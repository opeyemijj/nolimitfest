import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || (!hasPermission(user, "walkins") && !hasPermission(user, "orders"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "ALL";
  const query = searchParams.get("q")?.trim().toLowerCase();

  const whereClauses: string[] = [
    `(o.order_number LIKE 'WALK-%' OR o.notes ILIKE '%walk-in%')`
  ];
  const params: any[] = [];
  let paramIdx = 1;

  if (status !== "ALL") {
    whereClauses.push(`o.status = $${paramIdx++}`);
    params.push(status);
  }

  if (query) {
    whereClauses.push(
      `(LOWER(o.customer_name) LIKE $${paramIdx} OR LOWER(o.customer_email) LIKE $${paramIdx + 1} OR LOWER(o.customer_phone) LIKE $${paramIdx + 2} OR LOWER(o.order_number) LIKE $${paramIdx + 3})`
    );
    params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    paramIdx += 4;
  }

  const whereSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const sql = `
    SELECT
      o.id,
      o.order_number AS "orderNumber",
      o.customer_name AS "customerName",
      o.customer_email AS "customerEmail",
      o.customer_phone AS "customerPhone",
      o.total_amount AS "totalAmount",
      o.currency,
      o.status,
      o.notes,
      o.created_at AS "createdAt",
      e.name AS "eventName",
      COUNT(t.id) AS "ticketsCount",
      MIN(tt.name) AS "tierName",
      MIN(tt.color) AS "tierColor",
      MIN(tt.wristband_color) AS "wristbandColor"
    FROM orders o
    LEFT JOIN tickets t ON o.id = t.order_id
    LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
    LEFT JOIN events e ON o.event_id = e.id
    ${whereSql}
    GROUP BY o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
             o.total_amount, o.currency, o.status, o.notes, o.created_at, e.name
    ORDER BY o.created_at DESC
  `;

  const walkIns = await dbQuery(sql, params);

  // Compute live counter metrics
  const allWalkIns = await dbQuery<any>(`
    SELECT status, total_amount AS "totalAmount"
    FROM orders
    WHERE order_number LIKE 'WALK-%' OR notes ILIKE '%walk-in%'
  `);

  const metrics = {
    totalWalkIns: allWalkIns.length,
    pendingCount: allWalkIns.filter((w) => w.status === "PENDING").length,
    paidCount: allWalkIns.filter((w) => w.status === "PAID").length,
    cancelledCount: allWalkIns.filter((w) => w.status === "CANCELLED").length,
    totalRevenue: allWalkIns
      .filter((w) => w.status === "PAID")
      .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0),
  };

  return NextResponse.json({
    walkIns,
    metrics,
  });
}
