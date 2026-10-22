import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission, getUserAssignedEvents } from "@/lib/auth";
import { dbQuery, dbQueryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "buyers")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const eventId = searchParams.get("eventId");
  const tierId = searchParams.get("tierId");
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim().toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(200, parseInt(searchParams.get("limit") || "50", 10)));
  const offset = (page - 1) * limit;

  const assignedEvents = getUserAssignedEvents(user);

  // 1. Fetch available events for filtering
  let events = await dbQuery<{
    id: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    status: string;
  }>(
    `SELECT id, slug, name, city, country, status
     FROM events
     ORDER BY is_current_edition DESC, name ASC`,
  );

  if (!assignedEvents.includes("ALL")) {
    events = events.filter((e) => assignedEvents.includes(e.id));
  }

  // 2. Fetch available tiers for filtering
  const tiers = await dbQuery<{
    id: string;
    eventId: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    paxPerUnit: number;
  }>(
    `SELECT
       id,
       event_id        AS "eventId",
       name,
       category,
       price,
       currency,
       pax_per_unit    AS "paxPerUnit"
     FROM ticket_tiers
     ORDER BY sort_order ASC, price ASC`,
  );

  // 3. Build query for tickets & buyers
  let sql = `
    SELECT
      t.id                                          AS "ticketId",
      t.ticket_code                                 AS "ticketCode",
      t.attendee_name                               AS "attendeeName",
      t.attendee_email                              AS "attendeeEmail",
      t.status                                      AS "ticketStatus",
      t.checked_in_at                               AS "checkedInAt",
      t.checked_in_by                               AS "checkedInBy",
      t.created_at                                  AS "ticketCreatedAt",
      o.id                                          AS "orderId",
      o.order_number                                AS "orderNumber",
      o.customer_name                               AS "customerName",
      o.customer_email                              AS "customerEmail",
      o.customer_phone                              AS "customerPhone",
      o.customer_location                           AS "customerLocation",
      o.notes                                       AS "orderNotes",
      o.total_amount                                AS "orderTotalAmount",
      o.currency                                    AS "orderCurrency",
      o.status                                      AS "orderStatus",
      COALESCE(o.is_deposit, false)                 AS "isDeposit",
      COALESCE(o.deposit_amount, 0)                 AS "depositAmount",
      COALESCE(o.remaining_balance, 0)              AS "remainingBalance",
      o.created_at                                  AS "orderCreatedAt",
      tt.id                                         AS "tierId",
      COALESCE(tt.name, 'General Admission')        AS "tierName",
      COALESCE(tt.category, 'phase')                AS "tierCategory",
      COALESCE(tt.price, 0)                         AS "tierPrice",
      COALESCE(tt.currency, o.currency)             AS "tierCurrency",
      COALESCE(tt.pax_per_unit, 1)                  AS "paxPerUnit",
      COALESCE(tt.color, '#00E676')                 AS "tierColor",
      COALESCE(tt.wristband_color, 'NEON GREEN')    AS "wristbandColor",
      e.id                                          AS "eventId",
      e.slug                                        AS "eventSlug",
      COALESCE(e.name, o.event_id)                  AS "eventName",
      COALESCE(e.city, '')                          AS "eventCity",
      COALESCE(e.country, '')                       AS "eventCountry"
    FROM tickets t
    JOIN orders o ON t.order_id = o.id
    LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
    LEFT JOIN events e ON o.event_id = e.id
  `;

  const whereClauses: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (!assignedEvents.includes("ALL")) {
    whereClauses.push(`o.event_id = ANY($${paramIndex}::text[])`);
    params.push(assignedEvents);
    paramIndex++;
  }

  if (eventId && eventId !== "ALL") {
    whereClauses.push(`o.event_id = $${paramIndex}`);
    params.push(eventId);
    paramIndex++;
  }

  if (tierId && tierId !== "ALL") {
    whereClauses.push(`t.tier_id = $${paramIndex}`);
    params.push(tierId);
    paramIndex++;
  }

  if (status && status !== "ALL") {
    if (status === "CHECKED_IN") {
      whereClauses.push("t.status = 'CHECKED_IN'");
    } else if (status === "VALID") {
      whereClauses.push("t.status = 'VALID'");
    } else if (status === "PAID") {
      whereClauses.push("o.status = 'PAID' AND o.order_number NOT LIKE 'COMP-%'");
    } else if (status === "COMPLIMENTARY" || status === "COMPLEMENTARY") {
      whereClauses.push(
        "(o.status IN ('COMPLIMENTARY', 'COMPLEMENTARY') OR o.order_number LIKE 'COMP-%' OR t.ticket_code LIKE 'COMP-%')",
      );
    } else if (status === "PENDING") {
      whereClauses.push("o.status = 'PENDING'");
    } else if (status === "CANCELLED") {
      whereClauses.push("(t.status = 'CANCELLED' OR o.status = 'CANCELLED')");
    }
  }

  if (query) {
    whereClauses.push(`(
      o.customer_name                    ILIKE $${paramIndex}
      OR o.customer_email                ILIKE $${paramIndex}
      OR o.customer_phone                ILIKE $${paramIndex}
      OR t.attendee_name                 ILIKE $${paramIndex}
      OR t.ticket_code                   ILIKE $${paramIndex}
      OR o.order_number                  ILIKE $${paramIndex}
      OR COALESCE(o.customer_location, '') ILIKE $${paramIndex}
      OR COALESCE(tt.name, '')           ILIKE $${paramIndex}
    )`);
    params.push(`%${query}%`);
    paramIndex++;
  }

  const whereSql = whereClauses.length > 0 ? " WHERE " + whereClauses.join(" AND ") : "";

  // Compute exact summary metrics across the entire filtered dataset
  const summarySql = `
    WITH filtered_orders AS (
      SELECT DISTINCT o.id, o.status, o.total_amount
      FROM tickets t
      JOIN orders o ON t.order_id = o.id
      LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
      LEFT JOIN events e ON o.event_id = e.id
      ${whereSql}
    ),
    filtered_tickets AS (
      SELECT t.id, t.status
      FROM tickets t
      JOIN orders o ON t.order_id = o.id
      LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
      LEFT JOIN events e ON o.event_id = e.id
      ${whereSql}
    )
    SELECT
      (SELECT COUNT(*) FROM filtered_tickets) AS "totalPasses",
      (SELECT COUNT(*) FROM filtered_orders) AS "totalBuyers",
      (SELECT COALESCE(SUM(CASE WHEN status = 'CHECKED_IN' THEN 1 ELSE 0 END), 0) FROM filtered_tickets) AS "checkedInCount",
      (SELECT COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END), 0) FROM filtered_orders) AS "totalRevenue"
  `;

  const summaryRow = await dbQueryOne<any>(summarySql, params);
  const totalPasses = Number(summaryRow?.totalPasses || 0);
  const totalBuyers = Number(summaryRow?.totalBuyers || 0);
  const totalRevenue = Number(summaryRow?.totalRevenue || 0);
  const checkedInCount = Number(summaryRow?.checkedInCount || 0);

  const dataParams = [...params, limit, offset];
  const dataSql = `${sql} ${whereSql} ORDER BY o.created_at DESC, t.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

  const records = await dbQuery(dataSql, dataParams);

  return NextResponse.json({
    records,
    pagination: {
      page,
      limit,
      total: totalPasses,
      totalPages: Math.max(1, Math.ceil(totalPasses / limit)),
    },
    summary: {
      totalPasses,
      totalBuyers,
      totalRevenue,
      checkedInCount,
      checkedInRate:
        totalPasses > 0
          ? Math.round((checkedInCount / totalPasses) * 100)
          : 0,
    },
    events,
    tiers,
  });
}
