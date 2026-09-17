import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission, getUserAssignedEvents } from "@/lib/auth";
import { dbQuery } from "@/lib/db";

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  let str = String(field).trim();
  // If field contains double quotes, commas, or newlines, quote and escape
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return `"${str}"`;
}

// Format phone so Excel does not drop leading '+' or convert to scientific notation
function formatPhoneForExcel(phone: string | null | undefined): string {
  if (!phone) return '""';
  const clean = phone.trim();
  // Prepending ="..." in Excel forces it to be treated as a literal text cell
  return `="""${clean}"""`;
}

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

  sql += " ORDER BY o.createdAt DESC, t.createdAt DESC";

  const records = dbQuery(sql, params);

  const headers = [
    "Order Number",
    "Order Status",
    "Purchase Date",
    "Customer Full Name",
    "First Name",
    "Last Name",
    "Customer Email",
    "Customer Phone (WhatsApp)",
    "Customer Location",
    "Event Name",
    "Event City",
    "Event Country",
    "Ticket Tier",
    "Tier Category",
    "Guests Per Pass",
    "Wristband Color",
    "Wristbands To Issue",
    "Guest / Attendee Name",
    "Guest Email",
    "Ticket Code",
    "Ticket Gate Status",
    "Checked In (Gate)",
    "Checked In Time",
    "Tier Unit Price",
    "Order Total Amount",
    "Currency",
    "Order Notes",
  ];

  const rows = records.map((r) => {
    // Split full name into first and last name for marketing email personalization
    const nameParts = (r.customerName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const isCheckedIn = r.ticketStatus === "CHECKED_IN" ? "YES" : "NO";

    return [
      escapeCsvField(r.orderNumber),
      escapeCsvField(r.orderStatus),
      escapeCsvField(r.orderCreatedAt),
      escapeCsvField(r.customerName),
      escapeCsvField(firstName),
      escapeCsvField(lastName),
      escapeCsvField(r.customerEmail),
      formatPhoneForExcel(r.customerPhone),
      escapeCsvField(r.customerLocation || ""),
      escapeCsvField(r.eventName),
      escapeCsvField(r.eventCity),
      escapeCsvField(r.eventCountry),
      escapeCsvField(r.tierName),
      escapeCsvField(r.tierCategory),
      escapeCsvField(r.paxPerUnit),
      escapeCsvField(r.wristbandColor || "NEON GREEN"),
      escapeCsvField(r.paxPerUnit || 1),
      escapeCsvField(r.attendeeName),
      escapeCsvField(r.attendeeEmail || r.customerEmail),
      escapeCsvField(r.ticketCode),
      escapeCsvField(r.ticketStatus),
      escapeCsvField(isCheckedIn),
      escapeCsvField(r.checkedInAt || "N/A"),
      escapeCsvField(r.tierPrice),
      escapeCsvField(r.orderTotalAmount),
      escapeCsvField(r.orderCurrency),
      escapeCsvField(r.orderNotes || ""),
    ].join(",");
  });

  // UTF-8 BOM (\uFEFF) ensures Excel automatically opens with proper UTF-8 decoding
  const csvContent =
    "\uFEFF" + [headers.map(escapeCsvField).join(","), ...rows].join("\r\n");

  const filename = `nlf-ticket-buyers-${(eventId || "all-events").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
