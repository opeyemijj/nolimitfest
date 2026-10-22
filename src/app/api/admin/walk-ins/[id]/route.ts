import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission } from "@/lib/auth";
import { dbQuery, dbQueryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (
    !user ||
    (!hasPermission(user, "walkins") &&
      !hasPermission(user, "orders") &&
      !hasPermission(user, "scan"))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  let cleanId = decodeURIComponent(id || "").trim();

  // If a scanner passes the full URL, extract the ID / code
  if (cleanId.includes("/admin/walk-ins/")) {
    cleanId = cleanId.split("/admin/walk-ins/").pop()?.split("?")[0] || cleanId;
  }
  if (cleanId.includes("/walk-in/invoice/")) {
    cleanId = cleanId.split("/walk-in/invoice/").pop()?.split("?")[0] || cleanId;
  }

  if (!cleanId) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  // Look up order by id or order_number
  const order = await dbQueryOne<any>(
    `SELECT
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
       o.created_at           AS "createdAt",
       e.name                 AS "eventName",
       e.venue                AS "eventVenue"
     FROM orders o
     LEFT JOIN events e ON o.event_id = e.id
     WHERE o.id = $1 OR o.order_number = $1 OR o.order_number ILIKE $1`,
    [cleanId],
  );

  if (!order) {
    return NextResponse.json({ error: "Walk-in order not found." }, { status: 404 });
  }

  // Fetch all tickets for this order
  const tickets = await dbQuery<any>(
    `SELECT
       t.id                   AS "ticketId",
       t.ticket_code          AS "ticketCode",
       t.attendee_name        AS "attendeeName",
       t.attendee_email       AS "attendeeEmail",
       t.status               AS "ticketStatus",
       t.checked_in_at        AS "checkedInAt",
       t.checked_in_by        AS "checkedInBy",
       tt.id                  AS "tierId",
       COALESCE(tt.name, 'Festival Pass') AS "tierName",
       COALESCE(tt.price, 0)  AS "tierPrice",
       COALESCE(tt.currency, o.currency) AS "tierCurrency",
       COALESCE(tt.color, '#00E676') AS "tierColor",
       COALESCE(tt.wristband_color, 'NEON GREEN') AS "wristbandColor",
       COALESCE(tt.pax_per_unit, 1) AS "paxPerUnit"
     FROM tickets t
     JOIN orders o ON t.order_id = o.id
     LEFT JOIN ticket_tiers tt ON t.tier_id = tt.id
     WHERE t.order_id = $1`,
    [order.id],
  );

  return NextResponse.json({
    order,
    tickets,
  });
}
