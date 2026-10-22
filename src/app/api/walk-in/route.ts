import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne, dbExecute } from "@/lib/db";
import { generateTicketSignature } from "@/lib/qrcode";
import { calculateServiceFee } from "@/lib/fees";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId = "dubai-2026",
      customerName,
      customerEmail,
      customerPhone,
      tierId,
      quantity = 1,
      attendeeNames = [],
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Please enter your Full Name, Email, and WhatsApp Number." },
        { status: 400 },
      );
    }
    if (!tierId) {
      return NextResponse.json(
        { error: "Please select a ticket tier." },
        { status: 400 },
      );
    }

    const qty = Math.max(1, Math.min(10, Number(quantity) || 1));

    // 1. Fetch Event
    const event = await dbQueryOne<any>(
      "SELECT id, slug, name, city FROM events WHERE id = $1 OR slug = $1",
      [eventId],
    );
    if (!event) {
      return NextResponse.json({ error: "Festival event not found." }, { status: 404 });
    }

    // 2. Fetch Tier
    const tier = await dbQueryOne<any>(
      `SELECT id, name, price, currency, capacity, sold_count, status, pax_per_unit, category
       FROM ticket_tiers WHERE id = $1`,
      [tierId],
    );
    if (!tier) {
      return NextResponse.json({ error: "Selected ticket tier does not exist." }, { status: 404 });
    }

    if (tier.status === "sold_out" || (tier.capacity - tier.sold_count <= 0)) {
      return NextResponse.json(
        { error: `${tier.name} is completely sold out. Please select another tier.` },
        { status: 400 },
      );
    }

    // 3. Calculate 5% charges
    const baseTotal = Number(tier.price) * qty;
    const feeAmount = calculateServiceFee(baseTotal);
    const totalAmount = Math.round((baseTotal + feeAmount) * 100) / 100;
    const currency = tier.currency || "AED";

    // 4. Create Order with status PENDING and notes identifying as Walk-in
    const orderId = `ord-walkin-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const cityCode = event.city ? event.city.substring(0, 3).toUpperCase() : "DUB";
    const orderNumber = `WALK-${cityCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    const notes = `Walk-in Guest Registration • ${qty}x ${tier.name} • Pending Payment at Counter (Base: ${currency} ${baseTotal} + 5% Charges: ${currency} ${feeAmount})`;

    await dbExecute(
      `INSERT INTO orders
        (id, order_number, event_id, customer_name, customer_email, customer_phone,
         notes, total_amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')`,
      [
        orderId,
        orderNumber,
        event.id,
        customerName.trim(),
        customerEmail.trim().toLowerCase(),
        customerPhone.trim(),
        notes,
        totalAmount,
        currency,
      ],
    );

    // 5. Create provisional tickets in tickets table with status 'PENDING'
    // This immediately adds them to CRM & guestlist as requested!
    for (let i = 0; i < qty; i++) {
      const ticketId = `tkt-walkin-${Date.now()}-${i}-${crypto.randomBytes(3).toString("hex")}`;
      const ticketCode = `WLK-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const qrHash = `${ticketCode}:${generateTicketSignature(ticketCode)}`;
      const attendee =
        attendeeNames[i] && attendeeNames[i].trim()
          ? attendeeNames[i].trim()
          : qty === 1
            ? customerName.trim()
            : `${customerName.trim()} (Guest ${i + 1})`;

      await dbExecute(
        `INSERT INTO tickets
          (id, order_id, tier_id, ticket_code, qr_hash, attendee_name, attendee_email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
        [
          ticketId,
          orderId,
          tier.id,
          ticketCode,
          qrHash,
          attendee,
          customerEmail.trim().toLowerCase(),
        ],
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      invoiceUrl: `/walk-in/invoice/${orderId}`,
    });
  } catch (err: any) {
    console.error("Walk-in registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process walk-in registration." },
      { status: 500 },
    );
  }
}
