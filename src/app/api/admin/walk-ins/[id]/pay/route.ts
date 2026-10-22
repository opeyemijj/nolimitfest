import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";
import { sendTicketConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user || (!hasPermission(user, "walkins") && !hasPermission(user, "orders"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  let cleanId = decodeURIComponent(id || "").trim();
  if (cleanId.includes("/admin/walk-ins/")) {
    cleanId = cleanId.split("/admin/walk-ins/").pop()?.split("?")[0] || cleanId;
  }
  if (cleanId.includes("/walk-in/invoice/")) {
    cleanId = cleanId.split("/walk-in/invoice/").pop()?.split("?")[0] || cleanId;
  }

  const body = await req.json().catch(() => ({}));
  const paymentMethod = body.paymentMethod || "Cash"; // Cash, POS Terminal / Card, etc.

  // Fetch Order
  const order = await dbQueryOne<any>(
    "SELECT * FROM orders WHERE id = $1 OR order_number = $1 OR order_number ILIKE $1",
    [cleanId],
  );
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json(
      { error: "Order is already marked as PAID." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const paymentLog = `Paid via ${paymentMethod} at Entrance Counter on ${new Date().toLocaleTimeString()} by ${user.name} (${user.email})`;
  const updatedNotes = order.notes ? `${order.notes} | ${paymentLog}` : paymentLog;

  // 1. Mark Order as PAID
  await dbExecute(
    `UPDATE orders
     SET status = 'PAID', notes = $1, updated_at = $2
     WHERE id = $3`,
    [updatedNotes, now, order.id],
  );

  // 2. Mark Tickets as VALID
  await dbExecute(
    `UPDATE tickets
     SET status = 'VALID', updated_at = $1
     WHERE order_id = $2`,
    [now, order.id],
  );

  // 3. Increment inventory count for tiers
  const orderTickets = await dbQuery<any>(
    `SELECT tier_id AS "tierId", COUNT(id) AS "count"
     FROM tickets
     WHERE order_id = $1
     GROUP BY tier_id`,
    [order.id],
  );

  for (const item of orderTickets) {
    if (item.tierId) {
      await dbExecute(
        `UPDATE ticket_tiers
         SET sold_count = sold_count + $1
         WHERE id = $2`,
        [Number(item.count), item.tierId],
      );
    }
  }

  // 4. Fetch updated tickets for confirmation email & instant response
  const tickets = await dbQuery<any>(
    `SELECT t.id, t.ticket_code AS "ticketCode", t.attendee_name AS "attendeeName",
            t.attendee_email AS "attendeeEmail", t.status,
            COALESCE(tt.name, 'Festival Pass') AS "tierName",
            COALESCE(tt.wristband_color, 'NEON GREEN') AS "wristbandColor",
            COALESCE(tt.color, '#00E676') AS "tierColor",
            COALESCE(tt.pax_per_unit, 1) AS "paxPerUnit"
     FROM tickets t
     LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
     WHERE t.order_id = $1`,
    [order.id],
  );

  // 5. Send confirmation email in background if customer has a valid email
  if (order.customer_email && !order.customer_email.includes("placeholder")) {
    const origin = req.nextUrl.origin || "https://nolimitfest.net";
    sendTicketConfirmationEmail({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        eventId: order.event_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        totalAmount: order.total_amount,
        currency: order.currency,
        status: "PAID",
        isDeposit: false,
        createdAt: now,
      },
      tickets,
      baseUrl: origin,
    }).catch((err) => console.error("Error sending walk-in confirmation email:", err));
  }

  return NextResponse.json({
    success: true,
    message: "Payment successfully recorded and festival passes activated.",
    order: {
      ...order,
      status: "PAID",
      notes: updatedNotes,
    },
    tickets,
  });
}
