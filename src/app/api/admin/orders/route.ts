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
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, "orders")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.toLowerCase();
  const status = req.nextUrl.searchParams.get("status");

  let sql = `
    SELECT o.*, 
           COUNT(t.id) as ticketsCount,
           SUM(CASE WHEN t.status = 'CHECKED_IN' THEN 1 ELSE 0 END) as checkedInCount,
           e.name as eventName
    FROM orders o
    LEFT JOIN tickets t ON o.id = t.orderId
    LEFT JOIN events e ON o.eventId = e.id
  `;
  const whereClauses: string[] = [];
  const params: any[] = [];

  // Scoped to staff assigned events if not ALL
  const assignedEvents = getUserAssignedEvents(user);
  if (!assignedEvents.includes("ALL")) {
    whereClauses.push(
      `o.eventId IN (${assignedEvents.map(() => "?").join(",")})`,
    );
    params.push(...assignedEvents);
  }

  if (status) {
    whereClauses.push("o.status = ?");
    params.push(status);
  }

  if (query) {
    whereClauses.push(
      "(LOWER(o.customerName) LIKE ? OR LOWER(o.customerEmail) LIKE ? OR LOWER(o.orderNumber) LIKE ? OR o.id IN (SELECT orderId FROM tickets WHERE LOWER(ticketCode) LIKE ?))",
    );
    params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
  }

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  sql += " GROUP BY o.id ORDER BY o.createdAt DESC LIMIT 100";

  const orders = dbQuery(sql, params);
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

    const event = dbQueryOne<any>("SELECT * FROM events WHERE id = ?", [
      eventId,
    ]);
    const tier = dbQueryOne<any>("SELECT * FROM ticket_tiers WHERE id = ?", [
      tierId,
    ]);
    if (!event || !tier)
      return NextResponse.json(
        { error: "Event or Tier not found" },
        { status: 404 },
      );

    const orderId = `ord-comp-${Date.now()}`;
    const orderNumber = `COMP-${event.slug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    dbExecute(
      `INSERT INTO orders (id, orderNumber, eventId, customerName, customerEmail, customerPhone, notes, totalAmount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'AED', 'PAID')`,
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

    const createdTickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketId = `tkt-comp-${Date.now()}-${i}`;
      const ticketCode = `COMP-${event.slug.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const qrHash = `${ticketCode}:${generateTicketSignature(ticketCode)}`;

      dbExecute(
        `INSERT INTO tickets (id, orderId, tierId, ticketCode, qrHash, attendeeName, attendeeEmail, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'VALID')`,
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
