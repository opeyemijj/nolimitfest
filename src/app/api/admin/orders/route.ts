import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  hasPermission,
  canManageContent,
  getUserAssignedEvents,
  canAccessEvent,
} from "@/lib/auth";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";
import { generateTicketSignature } from "@/lib/qrcode";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "orders")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.toLowerCase();
  const status = req.nextUrl.searchParams.get("status");

  const whereClauses: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  // Scoped to staff assigned events if not ALL
  const assignedEvents = getUserAssignedEvents(user);
  if (!assignedEvents.includes("ALL")) {
    const placeholders = assignedEvents.map(() => `$${paramIdx++}`).join(",");
    whereClauses.push(`o.event_id IN (${placeholders})`);
    params.push(...assignedEvents);
  }

  if (status) {
    whereClauses.push(`o.status = $${paramIdx++}`);
    params.push(status);
  }

  if (query) {
    whereClauses.push(
      `(LOWER(o.customer_name) LIKE $${paramIdx} OR LOWER(o.customer_email) LIKE $${paramIdx + 1} OR LOWER(o.order_number) LIKE $${paramIdx + 2} OR o.id IN (SELECT order_id FROM tickets WHERE LOWER(ticket_code) LIKE $${paramIdx + 3}))`,
    );
    params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    paramIdx += 4;
  }

  const whereSQL =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const sql = `
    SELECT
      o.id,
      o.order_number         AS "orderNumber",
      o.event_id             AS "eventId",
      o.customer_name        AS "customerName",
      o.customer_email       AS "customerEmail",
      o.customer_phone       AS "customerPhone",
      o.customer_location    AS "customerLocation",
      o.total_amount         AS "totalAmount",
      o.currency,
      o.status,
      o.notes,
      o.stripe_session_id    AS "stripeSessionId",
      o.created_at           AS "createdAt",
      e.name                 AS "eventName",
      COUNT(t.id)            AS "ticketsCount",
      SUM(CASE WHEN t.status = 'CHECKED_IN' THEN 1 ELSE 0 END) AS "checkedInCount"
    FROM orders o
    LEFT JOIN tickets t ON o.id = t.order_id
    LEFT JOIN events e  ON o.event_id = e.id
    ${whereSQL}
    GROUP BY
      o.id, o.order_number, o.event_id, o.customer_name, o.customer_email,
      o.customer_phone, o.customer_location, o.total_amount, o.currency,
      o.status, o.notes, o.stripe_session_id, o.created_at, e.name
    ORDER BY o.created_at DESC
    LIMIT 100
  `;

  const orders = await dbQuery(sql, params);
  return NextResponse.json({ orders });
}

// Issue Complimentary Pass (VIP / Artist / Sponsor)
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Comp passes require organizer or admin role." },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const {
      eventId,
      tierId,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      quantity = 1,
    } = body;

    if (!eventId || !tierId || !guestName) {
      return NextResponse.json(
        { error: "Event, Tier, and Guest Name are required." },
        { status: 400 },
      );
    }

    if (!canAccessEvent(user, eventId)) {
      return NextResponse.json(
        {
          error:
            "Forbidden. You are not assigned to manage this festival edition.",
        },
        { status: 403 },
      );
    }

    const [event, tier] = await Promise.all([
      dbQueryOne<any>("SELECT * FROM events WHERE id = $1", [eventId]),
      dbQueryOne<any>("SELECT * FROM ticket_tiers WHERE id = $1", [tierId]),
    ]);

    if (!event || !tier)
      return NextResponse.json(
        { error: "Event or Tier not found" },
        { status: 404 },
      );

    const orderId = `ord-comp-${Date.now()}`;
    const orderNumber = `COMP-${event.slug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await dbExecute(
      `INSERT INTO orders
         (id, order_number, event_id, customer_name, customer_email,
          customer_phone, notes, total_amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 'AED', 'PAID')`,
      [
        orderId,
        orderNumber,
        event.id,
        guestName,
        guestEmail || "comp@nolimitfest.com",
        guestPhone || "",
        `Complimentary pass issued by ${user.name}. ${notes || ""}`,
      ],
    );

    const createdTickets: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const ticketId = `tkt-comp-${Date.now()}-${i}`;
      const ticketCode = `COMP-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const qrHash = `${ticketCode}:${generateTicketSignature(ticketCode)}`;

      await dbExecute(
        `INSERT INTO tickets
           (id, order_id, tier_id, ticket_code, qr_hash,
            attendee_name, attendee_email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'VALID')`,
        [
          ticketId,
          orderId,
          tier.id,
          ticketCode,
          qrHash,
          `${guestName} (Comp ${i + 1})`,
          guestEmail || "",
        ],
      );

      createdTickets.push(ticketCode);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      tickets: createdTickets,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
