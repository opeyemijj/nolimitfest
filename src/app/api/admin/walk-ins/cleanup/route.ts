import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbExecute } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (
    !user ||
    (!hasPermission(user, "walkins") &&
      !hasPermission(user, "orders"))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find all test walk-in orders
    const testOrders = await dbQuery<any>(
      `SELECT id, order_number AS "orderNumber", customer_name AS "customerName", status
       FROM orders
       WHERE (customer_name ILIKE '%test%' OR customer_email ILIKE '%test%' OR order_number IN ('WALK-DUB-8295', 'WALK-DUB-2774'))
         AND (order_number LIKE 'WALK-%' OR notes ILIKE '%walk-in%')`
    );

    if (testOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No test walk-in records found.",
        deletedCount: 0,
      });
    }

    const orderIds = testOrders.map((o) => o.id);

    // 2. Delete tickets belonging to these test orders
    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(",");
    await dbExecute(
      `DELETE FROM tickets WHERE order_id IN (${placeholders})`,
      orderIds,
    );

    // 3. Delete the orders
    await dbExecute(
      `DELETE FROM orders WHERE id IN (${placeholders})`,
      orderIds,
    );

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${testOrders.length} test walk-in record(s) and associated tickets.`,
      deletedOrders: testOrders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to cleanup test orders." },
      { status: 500 },
    );
  }
}
