import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQueryOne, dbExecute } from "@/lib/db";

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
  const reason = body.reason || "Cancelled at entrance counter by staff";

  const order = await dbQueryOne<any>(
    "SELECT * FROM orders WHERE id = $1 OR order_number = $1 OR order_number ILIKE $1",
    [cleanId],
  );
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const cancelLog = `Cancelled on ${new Date().toLocaleTimeString()} by ${user.name} (${user.email}): ${reason}`;
  const updatedNotes = order.notes ? `${order.notes} | ${cancelLog}` : cancelLog;

  // 1. Mark Order as CANCELLED
  await dbExecute(
    `UPDATE orders
     SET status = 'CANCELLED', void_reason = $1, voided_at = $2, voided_by = $3, notes = $4, updated_at = $2
     WHERE id = $5`,
    [reason, now, user.email, updatedNotes, order.id],
  );

  // 2. Mark Tickets as CANCELLED
  await dbExecute(
    `UPDATE tickets
     SET status = 'CANCELLED', void_reason = $1, voided_at = $2, voided_by = $3, updated_at = $2
     WHERE order_id = $4`,
    [reason, now, user.email, order.id],
  );

  return NextResponse.json({
    success: true,
    message: "Walk-in order cancelled.",
    order: {
      ...order,
      status: "CANCELLED",
    },
  });
}
