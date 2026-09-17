import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, canManageContent } from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";
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

    const order = dbQueryOne<any>("SELECT * FROM orders WHERE id = ?", [id]);
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
      dbExecute("UPDATE orders SET customerEmail = ? WHERE id = ?", [
        targetEmail,
        order.id,
      ]);
      order.customerEmail = targetEmail;
    }

    // Fetch tickets for this order
    const tickets = dbQuery<any>(
      `SELECT t.*, tt.name as tierName, tt.paxPerUnit 
       FROM tickets t 
       JOIN ticket_tiers tt ON t.tierId = tt.id 
       WHERE t.orderId = ?`,
      [order.id],
    );

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: "No tickets found for this order." },
        { status: 400 },
      );
    }

    const origin = req.nextUrl.origin || "https://nolimitfest.com";

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
