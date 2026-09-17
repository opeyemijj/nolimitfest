import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, canManageContent } from "@/lib/auth";
import { dbQueryOne, dbQuery, dbExecute } from "@/lib/db";
import { sendTicketConfirmationEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Resending emails requires administrative rights." },
      { status: 403 },
    );
  }

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const targetEmail = body.email?.trim();

    const order = await dbQueryOne<any>(
      `SELECT
         id,
         order_number      AS "orderNumber",
         event_id          AS "eventId",
         customer_name     AS "customerName",
         customer_email    AS "customerEmail",
         customer_phone    AS "customerPhone",
         customer_location AS "customerLocation",
         total_amount      AS "totalAmount",
         currency,
         status,
         notes,
         stripe_session_id AS "stripeSessionId",
         created_at        AS "createdAt"
       FROM orders
       WHERE id = $1`,
      [id],
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const recipient = targetEmail || order.customerEmail;
    if (!recipient) {
      return NextResponse.json(
        { error: "No customer email available for this order." },
        { status: 400 },
      );
    }

    // Update recipient email in DB if changed
    if (targetEmail && targetEmail !== order.customerEmail) {
      await dbExecute("UPDATE orders SET customer_email = $1 WHERE id = $2", [
        targetEmail,
        order.id,
      ]);
      order.customerEmail = targetEmail;
    }

    // Fetch tickets for this order
    const tickets = await dbQuery<any>(
      `SELECT
         t.id,
         t.order_id        AS "orderId",
         t.tier_id         AS "tierId",
         t.ticket_code     AS "ticketCode",
         t.qr_hash         AS "qrHash",
         t.attendee_name   AS "attendeeName",
         t.attendee_email  AS "attendeeEmail",
         t.status,
         t.checked_in_at   AS "checkedInAt",
         t.checked_in_by   AS "checkedInBy",
         t.created_at      AS "createdAt",
         tt.name           AS "tierName",
         tt.pax_per_unit   AS "paxPerUnit"
       FROM tickets t
       JOIN ticket_tiers tt ON t.tier_id = tt.id
       WHERE t.order_id = $1`,
      [order.id],
    );

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: "No tickets found for this order." },
        { status: 400 },
      );
    }

    const origin = req.nextUrl.origin || "https://nolimitfest.net";

    const emailResult = await sendTicketConfirmationEmail({
      order: { ...order, customerEmail: recipient },
      tickets,
      baseUrl: origin,
    });

    return NextResponse.json({
      success: emailResult.success,
      message: `Passes successfully dispatched to ${recipient}`,
      messageId: emailResult.messageId,
    });
  } catch (err: any) {
    console.error("Resend Email Exception:", err);
    return NextResponse.json(
      { error: err.message || "Failed to resend confirmation email" },
      { status: 500 },
    );
  }
}
