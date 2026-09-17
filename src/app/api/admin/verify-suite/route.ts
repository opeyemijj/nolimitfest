import { NextResponse } from "next/server";
import { dbQuery, dbQueryOne, dbExecute } from "@/lib/db";
import { performTicketCheckIn, getTicketByCode } from "@/lib/data-service";
import { verifyPassword } from "@/lib/auth";
import { generateTicketSignature } from "@/lib/qrcode";

export async function GET() {
  try {
    const results: string[] = [];

    // 1. Count records in Supabase
    const eventCount = await dbQueryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM events",
    );
    const tierCount = await dbQueryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM ticket_tiers",
    );
    const userCount = await dbQueryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM users",
    );
    results.push(
      `Supabase connected: ${eventCount?.count} events, ${tierCount?.count} tiers, ${userCount?.count} staff users.`,
    );

    // 2. RBAC check
    const adminUser = await dbQueryOne<any>(
      `SELECT id, name, email, role, password_hash AS "passwordHash" FROM users WHERE email = 'admin@nolimitfest.com'`,
    );
    const gateUser = await dbQueryOne<any>(
      `SELECT id, name, email, role, password_hash AS "passwordHash" FROM users WHERE email = 'gate@nolimitfest.com'`,
    );
    const adminValid = adminUser
      ? verifyPassword("admin12345!", adminUser.passwordHash)
      : false;
    const gateValid = gateUser
      ? verifyPassword("gate12345!", gateUser.passwordHash)
      : false;
    results.push(
      `RBAC verified: Admin auth=${adminValid}, Gate auth=${gateValid}`,
    );

    // 3. Simulated Checkout (writes test order to Supabase)
    const testOrderId = `test-ord-${Date.now()}`;
    const testOrderNumber = `NLF-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const dubaiEvent = await dbQueryOne<any>(
      "SELECT id, slug FROM events WHERE slug = 'dubai'",
    );
    const tier = await dbQueryOne<any>(
      `SELECT id, price FROM ticket_tiers WHERE event_id = $1 AND category = 'phase' LIMIT 1`,
      [dubaiEvent?.id],
    );

    if (!dubaiEvent || !tier) {
      results.push(
        "Warning: Dubai event or phase tier not found in Supabase — skipping checkout simulation",
      );
    } else {
      await dbExecute(
        `INSERT INTO orders (id, order_number, event_id, customer_name, customer_email, customer_phone, total_amount, currency, status)
         VALUES ($1, $2, $3, 'Elena Rostova', 'elena@example.com', '+971501112233', $4, 'AED', 'PAID')`,
        [testOrderId, testOrderNumber, dubaiEvent.id, tier.price],
      );

      const testTicketCode = `NLF-DXB-TEST-${Math.floor(10000 + Math.random() * 90000)}`;
      const testSignature = generateTicketSignature(testTicketCode);
      const testQrHash = `${testTicketCode}:${testSignature}`;

      await dbExecute(
        `INSERT INTO tickets (id, order_id, tier_id, ticket_code, qr_hash, attendee_name, attendee_email, status)
         VALUES ($1, $2, $3, $4, $5, 'Elena Rostova', 'elena@example.com', 'VALID')`,
        [
          `tkt-test-${Date.now()}`,
          testOrderId,
          tier.id,
          testTicketCode,
          testQrHash,
        ],
      );

      await dbExecute(
        `UPDATE ticket_tiers SET sold_count = sold_count + 1 WHERE id = $1`,
        [tier.id],
      );
      results.push(`Order & Ticket created: ${testTicketCode} (Status: VALID)`);

      // 4. Check-in 1st Scan
      const scan1 = await performTicketCheckIn(
        testTicketCode,
        "Gate Staff 1 (GATE_STAFF)",
        "Gate Terminal 1",
      );
      results.push(`Scan 1 Result: ${scan1.status} - ${scan1.message}`);

      // 5. Duplicate Check-in 2nd Scan
      const scan2 = await performTicketCheckIn(
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
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
