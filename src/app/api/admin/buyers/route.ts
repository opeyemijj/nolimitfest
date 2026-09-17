import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission, getUserAssignedEvents } from "@/lib/auth";
import { dbQuery } from "@/lib/db";

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

  const assignedEvents = getUserAssignedEvents(user);

  // 1. Fetch available events for filtering
  let events = dbQuery<{
    id: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    status: string;
  }>(
    "SELECT id, slug, name, city, country, status FROM events ORDER BY isCurrentEdition DESC, name ASC",
  );

  if (!assignedEvents.includes("ALL")) {
    events = events.filter((e) => assignedEvents.includes(e.id));
  }

  // 2. Fetch available tiers for filtering
  const tiers = dbQuery<{
    id: string;
    eventId: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    paxPerUnit: number;
  }>(
    "SELECT id, eventId, name, category, price, currency, paxPerUnit FROM ticket_tiers ORDER BY sortOrder ASC, price ASC",
  );

  // 3. Build query for tickets & buyers
  let sql = `
    SELECT 
      t.id AS ticketId,
      t.ticketCode,
      t.attendeeName,
      t.attendeeEmail,
      t.status AS ticketStatus,
      t.checkedInAt,
      t.checkedInBy,
      t.createdAt AS ticketCreatedAt,
      o.id AS orderId,
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.customerLocation,
      o.notes AS orderNotes,
      o.totalAmount AS orderTotalAmount,
      o.currency AS orderCurrency,
      o.status AS orderStatus,
      o.createdAt AS orderCreatedAt,
      tt.id AS tierId,
      COALESCE(tt.name, 'General Admission') AS tierName,
      COALESCE(tt.category, 'phase') AS tierCategory,
      COALESCE(tt.price, 0) AS tierPrice,
      COALESCE(tt.currency, o.currency) AS tierCurrency,
      COALESCE(tt.paxPerUnit, 1) AS paxPerUnit,
      COALESCE(tt.color, '#00E676') AS tierColor,
      COALESCE(tt.wristbandColor, 'NEON GREEN') AS wristbandColor,
      e.id AS eventId,
      e.slug AS eventSlug,
      COALESCE(e.name, o.eventId) AS eventName,
      COALESCE(e.city, '') AS eventCity,
      COALESCE(e.country, '') AS eventCountry
    FROM tickets t
    JOIN orders o ON t.orderId = o.id
    LEFT JOIN ticket_tiers tt ON t.tierId = tt.id
    LEFT JOIN events e ON o.eventId = e.id
  `;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (!assignedEvents.includes("ALL")) {
    whereClauses.push(
      `o.eventId IN (${assignedEvents.map(() => "?").join(",")})`,
    );
    params.push(...assignedEvents);
  }

  if (eventId && eventId !== "ALL") {
    whereClauses.push("o.eventId = ?");
    params.push(eventId);
  }

  if (tierId && tierId !== "ALL") {
    whereClauses.push("t.tierId = ?");
    params.push(tierId);
  }

  if (status && status !== "ALL") {
    if (status === "CHECKED_IN") {
      whereClauses.push("t.status = 'CHECKED_IN'");
    } else if (status === "VALID") {
      whereClauses.push("t.status = 'VALID'");
    } else if (status === "PAID") {
      whereClauses.push("o.status = 'PAID'");
    } else if (status === "PENDING") {
      whereClauses.push("o.status = 'PENDING'");
    } else if (status === "CANCELLED") {
      whereClauses.push("(t.status = 'CANCELLED' OR o.status = 'CANCELLED')");
    }
  }

  if (query) {
    whereClauses.push(`(
      LOWER(o.customerName) LIKE ? 
      OR LOWER(o.customerEmail) LIKE ? 
      OR LOWER(o.customerPhone) LIKE ? 
      OR LOWER(t.attendeeName) LIKE ? 
      OR LOWER(t.ticketCode) LIKE ? 
      OR LOWER(o.orderNumber) LIKE ? 
      OR LOWER(COALESCE(o.customerLocation, '')) LIKE ? 
      OR LOWER(COALESCE(tt.name, '')) LIKE ?
    )`);
    params.push(
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
    );
  }

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  sql += " ORDER BY o.createdAt DESC, t.createdAt DESC LIMIT 1000";

  const records = dbQuery(sql, params);

  // Compute summary metrics on the filtered dataset
  const uniqueOrderIds = new Set<string>();
  let totalRevenue = 0;
  let checkedInCount = 0;

  for (const r of records) {
    if (!uniqueOrderIds.has(r.orderId)) {
      uniqueOrderIds.add(r.orderId);
      if (r.orderStatus === "PAID") {
        totalRevenue += Number(r.orderTotalAmount) || 0;
      }
    }
    if (r.ticketStatus === "CHECKED_IN") {
      checkedInCount++;
    }
  }

  return NextResponse.json({
    records,
    summary: {
      totalPasses: records.length,
      totalBuyers: uniqueOrderIds.size,
      totalRevenue,
      checkedInCount,
      checkedInRate:
        records.length > 0
          ? Math.round((checkedInCount / records.length) * 100)
          : 0,
    },
    events,
    tiers,
  });
}
