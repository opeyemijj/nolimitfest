import { NextResponse } from "next/server";
import { getDb, dbQuery, dbQueryOne, dbExecute } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { performTicketCheckIn, getTicketByCode } from "@/lib/data-service";
import { verifyPassword } from "@/lib/auth";
import { generateTicketSignature } from "@/lib/qrcode";

export async function GET() {
  try {
    const results: string[] = [];

    // 1. Seed
    seedDatabase();
    const eventCount = dbQueryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM events",
    );
    const tierCount = dbQueryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM ticket_tiers",
    );
    const userCount = dbQueryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM users",
    );
    results.push(
      `Database seeded: ${eventCount?.count} events, ${tierCount?.count} tiers, ${userCount?.count} staff users.`,
    );

    // 2. RBAC check
    const adminUser = dbQueryOne<any>(
      "SELECT * FROM users WHERE email = 'admin@nolimitfest.com'",
    );
    const gateUser = dbQueryOne<any>(
      "SELECT * FROM users WHERE email = 'gate@nolimitfest.com'",
    );
    const adminValid = verifyPassword("admin12345!", adminUser.passwordHash);
    const gateValid = verifyPassword("gate12345!", gateUser.passwordHash);
    results.push(
      `RBAC verified: Admin auth=${adminValid}, Gate auth=${gateValid}`,
    );

    // 3. Simulated Checkout
    const testOrderId = `test-ord-${Date.now()}`;
    const testOrderNumber = `NLF-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const dubaiEvent = dbQueryOne<any>(
      "SELECT * FROM events WHERE slug = 'dubai'",
    );
    const tier = dbQueryOne<any>(
      "SELECT * FROM ticket_tiers WHERE eventId = ? AND category = 'phase' LIMIT 1",
      [dubaiEvent.id],
    );

    dbExecute(
      `INSERT INTO orders (id, orderNumber, eventId, customerName, customerEmail, customerPhone, totalAmount, currency, status)
       VALUES (?, ?, ?, 'Elena Rostova', 'elena@example.com', '+971501112233', ?, 'AED', 'PAID')`,
      [testOrderId, testOrderNumber, dubaiEvent.id, tier.price],
    );

    const testTicketCode = `NLF-DXB-TEST-${Math.floor(10000 + Math.random() * 90000)}`;
    const testSignature = generateTicketSignature(testTicketCode);
    const testQrHash = `${testTicketCode}:${testSignature}`;

    dbExecute(
      `INSERT INTO tickets (id, orderId, tierId, ticketCode, qrHash, attendeeName, attendeeEmail, status)
       VALUES (?, ?, ?, ?, ?, 'Elena Rostova', 'elena@example.com', 'VALID')`,
      [
        `tkt-test-${Date.now()}`,
        testOrderId,
        tier.id,
        testTicketCode,
        testQrHash,
      ],
    );

    dbExecute(
      `UPDATE ticket_tiers SET soldCount = soldCount + 1 WHERE id = ?`,
      [tier.id],
    );
    results.push(`Order & Ticket created: ${testTicketCode} (Status: VALID)`);

    // 4. Check-in 1st Scan
    const scan1 = performTicketCheckIn(
      testTicketCode,
      "Gate Staff 1 (GATE_STAFF)",
      "Gate Terminal 1",
    );
    results.push(`Scan 1 Result: ${scan1.status} - ${scan1.message}`);

    // 5. Duplicate Check-in 2nd Scan
    const scan2 = performTicketCheckIn(
      testTicketCode,
      "Gate Staff 2",
      "Gate Terminal 2",
    );
    results.push(`Scan 2 Result: ${scan2.status} - ${scan2.message}`);

    const allPassed =
      scan1.status === "CHECKED_IN" && scan2.status === "ALREADY_CHECKED_IN";

    return NextResponse.json({
      success: allPassed,
      results,
      ticketCode: testTicketCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
