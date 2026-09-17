import { NextRequest, NextResponse } from "next/server";
import { getDb, dbQueryOne, dbExecute, pgExecute } from "@/lib/db";
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

    const db = getDb();

    // 1. Verify Event
    const event = dbQueryOne<any>(
      "SELECT * FROM events WHERE id = ? OR slug = ?",
      [eventId, eventId],
    );
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // 2. Validate Tier Inventory and Calculate Total
    let totalAmount = 0;
    const validatedItems: {
      tier: any;
      quantity: number;
      attendeeNames: string[];
    }[] = [];

    for (const item of items) {
      const tier = dbQueryOne<any>("SELECT * FROM ticket_tiers WHERE id = ?", [
        item.tierId,
      ]);
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

      totalAmount += tier.price * item.quantity;
      validatedItems.push({
        tier,
        quantity: item.quantity,
        attendeeNames: item.attendeeNames || [],
      });
    }

    // 3. Generate Order Reference Number
    const orderId = `ord-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const orderNumber = `NLF-${event.city.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderCurrency = validatedItems[0]?.tier?.currency || "AED";

    const origin = req.nextUrl.origin || "https://nolimitfest.com";

    // 4. Handle Stripe Integration if API key is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && !stripeSecretKey.includes("placeholder")) {
      // Create Stripe Checkout Session using Stripe REST API
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

      let lineIndex = 0;
      for (const item of validatedItems) {
        stripeParams.append(
          `line_items[${lineIndex}][price_data][currency]`,
          item.tier.currency.toLowerCase(),
        );
        stripeParams.append(
          `line_items[${lineIndex}][price_data][product_data][name]`,
          `${event.name} - ${item.tier.name}`,
        );
        stripeParams.append(
          `line_items[${lineIndex}][price_data][product_data][description]`,
          item.tier.description || `${item.tier.paxPerUnit} Guest Pass`,
        );
        stripeParams.append(
          `line_items[${lineIndex}][price_data][unit_amount]`,
          Math.round(item.tier.price * 100).toString(),
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

      // Record Order as PENDING in DB
      dbExecute(
        `INSERT INTO orders (id, orderNumber, eventId, customerName, customerEmail, customerPhone, customerLocation, notes, totalAmount, currency, status, stripeSessionId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
        [
          orderId,
          orderNumber,
          event.id,
          customerName,
          customerEmail,
          customerPhone,
          customerLocation || "",
          notes || "",
          totalAmount,
          orderCurrency,
          stripeSession.id,
        ],
      );

      // Mirror order to Supabase PostgreSQL
      pgExecute(
        `INSERT INTO orders (id, order_number, event_id, customer_name, customer_email, customer_phone, customer_location, notes, total_amount, currency, status, stripe_session_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', $11)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, stripe_session_id = EXCLUDED.stripe_session_id`,
        [
          orderId,
          orderNumber,
          event.id,
          customerName,
          customerEmail,
          customerPhone,
          customerLocation || "",
          notes || "",
          totalAmount,
          orderCurrency,
          stripeSession.id,
        ],
      ).catch(() => {});

      // Pre-generate pending tickets in DB linked to order
      for (const item of validatedItems) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
          const ticketCode = `NLF-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
          const signature = generateTicketSignature(ticketCode);
          const qrHash = `${ticketCode}:${signature}`;
          const attendeeName =
            item.attendeeNames[i] || `${customerName} (Guest ${i + 1})`;

          dbExecute(
            `INSERT INTO tickets (id, orderId, tierId, ticketCode, qrHash, attendeeName, attendeeEmail, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
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

          // Mirror ticket to Supabase PostgreSQL
          pgExecute(
            `INSERT INTO tickets (id, order_id, tier_id, ticket_code, qr_hash, attendee_name, attendee_email, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
             ON CONFLICT (id) DO NOTHING`,
            [
              ticketId,
              orderId,
              item.tier.id,
              ticketCode,
              qrHash,
              attendeeName,
              customerEmail,
            ],
          ).catch(() => {});
        }
      }

      return NextResponse.json({ url: stripeSession.url });
    }

    // 5. Seamless Direct / Test Mode Checkout (Instant Fulfillment & Real Tickets)
    // Record Order as PAID
    dbExecute(
      `INSERT INTO orders (id, orderNumber, eventId, customerName, customerEmail, customerPhone, customerLocation, notes, totalAmount, currency, status, stripeSessionId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', ?)`,
      [
        orderId,
        orderNumber,
        event.id,
        customerName,
        customerEmail,
        customerPhone,
        customerLocation || "",
        notes || "",
        totalAmount,
        orderCurrency,
        `test_session_${Date.now()}`,
      ],
    );

    // Generate Tickets with unique QR Codes and decrement inventory
    const generatedTickets: any[] = [];
    for (const item of validatedItems) {
      // Increment sold count atomically
      dbExecute(
        `UPDATE ticket_tiers SET soldCount = soldCount + ? WHERE id = ?`,
        [item.quantity, item.tier.id],
      );

      for (let i = 0; i < item.quantity; i++) {
        const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        const ticketCode = `NLF-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const signature = generateTicketSignature(ticketCode);
        const qrHash = `${ticketCode}:${signature}`;

        const attendeeName =
          item.attendeeNames[i] || `${customerName} (Guest ${i + 1})`;

        dbExecute(
          `INSERT INTO tickets (id, orderId, tierId, ticketCode, qrHash, attendeeName, attendeeEmail, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'VALID')`,
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
          ticketCode,
          tierName: item.tier.name,
          attendeeName,
          paxPerUnit: item.tier.paxPerUnit,
        });
      }
    }

    // Send Automated Ticket Pass Email
    await sendTicketConfirmationEmail({
      order: {
        id: orderId,
        orderNumber,
        eventId: event.id,
        customerName,
        customerEmail,
        customerPhone,
        customerLocation,
        notes,
        totalAmount,
        currency: orderCurrency,
        status: "PAID",
        createdAt: new Date().toISOString(),
      },
      tickets: generatedTickets,
      baseUrl: origin,
    });

    return NextResponse.json({
      url: `/orders/${orderId}?confirmed=true`,
      orderNumber,
    });
  } catch (err: any) {
    console.error("Checkout Exception:", err);
    return NextResponse.json(
      { error: err.message || "Checkout could not be processed." },
      { status: 500 },
    );
  }
}
