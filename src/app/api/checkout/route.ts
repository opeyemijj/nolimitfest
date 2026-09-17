import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne, dbExecute } from "@/lib/db";
import { generateTicketSignature } from "@/lib/qrcode";
import { sendTicketConfirmationEmail } from "@/lib/email";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId,
      items,
      customerName,
      customerEmail,
      customerPhone,
      customerLocation,
      notes,
      isDeposit = false,
    } = body;

    if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order items or event ID." },
        { status: 400 },
      );
    }
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Please provide customer name, email, and phone." },
        { status: 400 },
      );
    }

    // 1. Verify Event
    const event = await dbQueryOne<any>(
      "SELECT * FROM events WHERE id = $1 OR slug = $1",
      [eventId],
    );
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // 2. Validate Tier Inventory and Calculate Total
    let fullTotalAmount = 0;
    let chargeAmount = 0;
    const validatedItems: {
      tier: any;
      quantity: number;
      attendeeNames: string[];
    }[] = [];

    for (const item of items) {
      const tier = await dbQueryOne<any>(
        `SELECT
           id,
           event_id        AS "eventId",
           name,
           description,
           category,
           price,
           currency,
           capacity,
           sold_count      AS "soldCount",
           pax_per_unit    AS "paxPerUnit",
           wristband_color AS "wristbandColor",
           color,
           status,
           sort_order      AS "sortOrder",
           COALESCE(allow_deposit, true) AS "allowDeposit",
           COALESCE(deposit_percentage, 20) AS "depositPercentage"
         FROM ticket_tiers
         WHERE id = $1`,
        [item.tierId],
      );
      if (!tier) {
        return NextResponse.json(
          { error: `Ticket tier ${item.tierId} does not exist.` },
          { status: 400 },
        );
      }

      const available = tier.capacity - tier.soldCount;
      if (item.quantity > available) {
        return NextResponse.json(
          {
            error: `Insufficient tickets for ${tier.name}. Only ${available} remaining.`,
          },
          { status: 400 },
        );
      }

      const itemFullPrice = tier.price * item.quantity;
      fullTotalAmount += itemFullPrice;

      // If deposit requested and allowed on table tier
      if (
        isDeposit &&
        (tier.category === "table" || tier.is_vvip || tier.isVVIP) &&
        tier.allowDeposit
      ) {
        const pct = tier.depositPercentage || 20;
        chargeAmount += Math.round((itemFullPrice * pct) / 100);
      } else {
        chargeAmount += itemFullPrice;
      }

      validatedItems.push({
        tier,
        quantity: item.quantity,
        attendeeNames: item.attendeeNames || [],
      });
    }

    const isOrderDeposit = isDeposit && chargeAmount < fullTotalAmount;
    const remainingBalance = isOrderDeposit
      ? fullTotalAmount - chargeAmount
      : 0;

    // 3. Generate Order Reference Number
    const orderId = `ord-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const orderNumber = `NLF-${event.city.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderCurrency = validatedItems[0]?.tier?.currency || "AED";

    const origin = req.nextUrl.origin || "https://nolimitfest.net";

    // 4. Handle Stripe Integration if API key is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && !stripeSecretKey.includes("placeholder")) {
      const stripeParams = new URLSearchParams();
      stripeParams.append("mode", "payment");
      stripeParams.append(
        "success_url",
        `${origin}/orders/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      );
      stripeParams.append(
        "cancel_url",
        `${origin}/events/${event.slug || "dubai"}`,
      );
      stripeParams.append("customer_email", customerEmail);
      stripeParams.append("client_reference_id", orderNumber);
      stripeParams.append("metadata[orderId]", orderId);
      stripeParams.append("metadata[orderNumber]", orderNumber);
      stripeParams.append(
        "metadata[isDeposit]",
        isOrderDeposit ? "true" : "false",
      );

      let lineIndex = 0;
      for (const item of validatedItems) {
        const isTierDeposit =
          isOrderDeposit &&
          (item.tier.category === "table" || item.tier.isVVIP);
        const itemUnitCost = isTierDeposit
          ? Math.round(
              (item.tier.price * (item.tier.depositPercentage || 20)) / 100,
            )
          : item.tier.price;

        stripeParams.append(
          `line_items[${lineIndex}][price_data][currency]`,
          item.tier.currency.toLowerCase(),
        );
        stripeParams.append(
          `line_items[${lineIndex}][price_data][product_data][name]`,
          `${event.name} - ${item.tier.name}${isTierDeposit ? ` (${item.tier.depositPercentage || 20}% Table Reservation Deposit)` : ""}`,
        );
        stripeParams.append(
          `line_items[${lineIndex}][price_data][product_data][description]`,
          isTierDeposit
            ? `20% Deposit. Remaining balance of ${orderCurrency} ${(item.tier.price * item.quantity - itemUnitCost * item.quantity).toLocaleString()} due prior to event entrance.`
            : item.tier.description || `${item.tier.paxPerUnit} Guest Pass`,
        );
        stripeParams.append(
          `line_items[${lineIndex}][price_data][unit_amount]`,
          Math.round(itemUnitCost * 100).toString(),
        );
        stripeParams.append(
          `line_items[${lineIndex}][quantity]`,
          item.quantity.toString(),
        );
        lineIndex++;
      }

      const stripeRes = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: stripeParams.toString(),
        },
      );

      const stripeSession = await stripeRes.json();
      if (!stripeRes.ok) {
        console.error("Stripe Error:", stripeSession);
        return NextResponse.json(
          {
            error:
              stripeSession.error?.message ||
              "Failed to initiate Stripe checkout.",
          },
          { status: 500 },
        );
      }

      // Record Order as PENDING in Supabase
      await dbExecute(
        `INSERT INTO orders (id, order_number, event_id, customer_name, customer_email, customer_phone, customer_location, notes, total_amount, currency, status, stripe_session_id, is_deposit, deposit_amount, remaining_balance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', $11, $12, $13, $14)`,
        [
          orderId,
          orderNumber,
          event.id,
          customerName,
          customerEmail,
          customerPhone,
          customerLocation || "",
          notes || "",
          chargeAmount,
          orderCurrency,
          stripeSession.id,
          isOrderDeposit,
          isOrderDeposit ? chargeAmount : 0,
          remainingBalance,
        ],
      );

      // Pre-generate pending tickets linked to order
      for (const item of validatedItems) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
          const ticketCode = `NLF-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
          const signature = generateTicketSignature(ticketCode);
          const qrHash = `${ticketCode}:${signature}`;
          const attendeeName =
            item.attendeeNames[i] || `${customerName} (Guest ${i + 1})`;

          await dbExecute(
            `INSERT INTO tickets (id, order_id, tier_id, ticket_code, qr_hash, attendee_name, attendee_email, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
            [
              ticketId,
              orderId,
              item.tier.id,
              ticketCode,
              qrHash,
              attendeeName,
              customerEmail,
            ],
          );
        }
      }

      return NextResponse.json({ url: stripeSession.url });
    }

    // 5. Seamless Direct / Test Mode Checkout (Instant Fulfillment & Real Tickets)
    await dbExecute(
      `INSERT INTO orders (id, order_number, event_id, customer_name, customer_email, customer_phone, customer_location, notes, total_amount, currency, status, stripe_session_id, is_deposit, deposit_amount, remaining_balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PAID', $11, $12, $13, $14)`,
      [
        orderId,
        orderNumber,
        event.id,
        customerName,
        customerEmail,
        customerPhone,
        customerLocation || "",
        notes || "",
        chargeAmount,
        orderCurrency,
        `test_session_${Date.now()}`,
        isOrderDeposit,
        isOrderDeposit ? chargeAmount : 0,
        remainingBalance,
      ],
    );

    // Generate Tickets with unique QR Codes and increment inventory
    const generatedTickets: any[] = [];
    for (const item of validatedItems) {
      await dbExecute(
        `UPDATE ticket_tiers SET sold_count = sold_count + $1 WHERE id = $2`,
        [item.quantity, item.tier.id],
      );

      for (let i = 0; i < item.quantity; i++) {
        const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        const ticketCode = `NLF-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const signature = generateTicketSignature(ticketCode);
        const qrHash = `${ticketCode}:${signature}`;
        const attendeeName =
          item.attendeeNames[i] || `${customerName} (Guest ${i + 1})`;

        await dbExecute(
          `INSERT INTO tickets (id, order_id, tier_id, ticket_code, qr_hash, attendee_name, attendee_email, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'VALID')`,
          [
            ticketId,
            orderId,
            item.tier.id,
            ticketCode,
            qrHash,
            attendeeName,
            customerEmail,
          ],
        );

        generatedTickets.push({
          id: ticketId,
          orderId,
          tierId: item.tier.id,
          ticketCode,
          qrHash,
          attendeeName,
          attendeeEmail: customerEmail,
          status: "VALID",
          tierName: item.tier.name,
          paxPerUnit: item.tier.paxPerUnit,
        });
      }
    }

    // Send instant confirmation email
    await sendTicketConfirmationEmail({
      order: {
        id: orderId,
        orderNumber,
        eventId: event.id,
        customerName,
        customerEmail,
        customerPhone,
        totalAmount: chargeAmount,
        currency: orderCurrency,
        status: "PAID",
        isDeposit: isOrderDeposit,
        depositAmount: isOrderDeposit ? chargeAmount : 0,
        remainingBalance,
        createdAt: new Date().toISOString(),
      },
      tickets: generatedTickets,
      baseUrl: origin,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      url: `/orders/${orderId}?confirmed=true`,
    });
  } catch (err: any) {
    console.error("Checkout Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Checkout server error" },
      { status: 500 },
    );
  }
}
