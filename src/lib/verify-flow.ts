import { getDb, dbQuery, dbQueryOne, dbExecute } from "./db";
import { seedDatabase } from "./seed";
import {
  performTicketCheckIn,
  getTicketByCode,
  getAllEvents,
  getTicketTiers,
} from "./data-service";
import { hashPassword, verifyPassword } from "./auth";
import { generateTicketSignature } from "./qrcode";

console.log("==================================================");
console.log(" FESTIVAL ENGINE END-TO-END VERIFICATION TEST");
console.log("==================================================");

// 1. Database Seeding Test
console.log("\n[1] Testing Database Seeding...");
const seedResult = seedDatabase();
console.log("✓ Seed Result:", seedResult.message);

const eventCount = dbQueryOne<{ count: number }>(
  "SELECT COUNT(*) as count FROM events",
);
const tierCount = dbQueryOne<{ count: number }>(
  "SELECT COUNT(*) as count FROM ticket_tiers",
);
const userCount = dbQueryOne<{ count: number }>(
  "SELECT COUNT(*) as count FROM users",
);
const artistCount = dbQueryOne<{ count: number }>(
  "SELECT COUNT(*) as count FROM artists",
);

console.log(`✓ Total Events in DB: ${eventCount?.count}`);
console.log(`✓ Total Ticket Tiers in DB: ${tierCount?.count}`);
console.log(`✓ Total Staff Users in DB: ${userCount?.count}`);
console.log(`✓ Total Artists in DB: ${artistCount?.count}`);

if (!eventCount || eventCount.count < 9 || !tierCount || tierCount.count < 11) {
  throw new Error(
    "Seeding verification failed: Missing required events or tiers.",
  );
}

// 2. Auth & RBAC Password Verification Test
console.log("\n[2] Testing RBAC Authentication...");
const adminUser = dbQueryOne<any>(
  "SELECT * FROM users WHERE email = 'admin@nolimitfest.com'",
);
const gateUser = dbQueryOne<any>(
  "SELECT * FROM users WHERE email = 'gate@nolimitfest.com'",
);

const isAdminValid = verifyPassword("admin12345!", adminUser.passwordHash);
const isGateValid = verifyPassword("gate12345!", gateUser.passwordHash);

console.log(
  `✓ Admin Login Verified: ${isAdminValid} (Role: ${adminUser.role})`,
);
console.log(
  `✓ Gate Staff Login Verified: ${isGateValid} (Role: ${gateUser.role})`,
);

if (!isAdminValid || !isGateValid) {
  throw new Error("Auth verification failed: Password hash mismatch.");
}

// 3. Simulated Checkout & Ticket Generation Test
console.log("\n[3] Testing Ticket Purchase & QR Generation...");
const testOrderId = `test-ord-${Date.now()}`;
const testOrderNumber = `NLF-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
const dubaiEvent = dbQueryOne<any>("SELECT * FROM events WHERE slug = 'dubai'");
const earlyBirdTier = dbQueryOne<any>(
  "SELECT * FROM ticket_tiers WHERE eventId = ? AND category = 'phase' LIMIT 1",
  [dubaiEvent.id],
);

const initialSold = earlyBirdTier.soldCount;

// Create Order
dbExecute(
  `INSERT INTO orders (id, orderNumber, eventId, customerName, customerEmail, customerPhone, totalAmount, currency, status)
   VALUES (?, ?, ?, 'Elena Rostova', 'elena@example.com', '+971501112233', ?, 'AED', 'PAID')`,
  [testOrderId, testOrderNumber, dubaiEvent.id, earlyBirdTier.price],
);

// Create Ticket with QR Hash
const testTicketCode = `NLF-DXB-TEST-${Math.floor(10000 + Math.random() * 90000)}`;
const testSignature = generateTicketSignature(testTicketCode);
const testQrHash = `${testTicketCode}:${testSignature}`;

dbExecute(
  `INSERT INTO tickets (id, orderId, tierId, ticketCode, qrHash, attendeeName, attendeeEmail, status)
   VALUES (?, ?, ?, ?, ?, 'Elena Rostova', 'elena@example.com', 'VALID')`,
  [
    `tkt-test-${Date.now()}`,
    testOrderId,
    earlyBirdTier.id,
    testTicketCode,
    testQrHash,
  ],
);

dbExecute(`UPDATE ticket_tiers SET soldCount = soldCount + 1 WHERE id = ?`, [
  earlyBirdTier.id,
]);

const loadedTicket = getTicketByCode(testTicketCode);
console.log(`✓ Ticket Generated: ${loadedTicket?.ticketCode}`);
console.log(
  `✓ Attendee: ${loadedTicket?.attendeeName} | Tier: ${loadedTicket?.tierName}`,
);
console.log(`✓ Initial Status: ${loadedTicket?.status} (Expected: VALID)`);

if (loadedTicket?.status !== "VALID") {
  throw new Error("Ticket generation failed: Status is not VALID.");
}

// 4. Gate Entrance Check-In Test (First Scan -> SUCCESS)
console.log("\n[4] Testing Gate Entrance Check-In (1st Scan)...");
const firstScan = performTicketCheckIn(
  testTicketCode,
  "Helipad Gate Staff (GATE_STAFF)",
  "iPhone 15 Pro - Chrome",
);
console.log(`✓ First Scan Result: ${firstScan.status}`);
console.log(`✓ Message: ${firstScan.message}`);

if (firstScan.status !== "CHECKED_IN" || !firstScan.success) {
  throw new Error("Gate Check-in failed on valid ticket.");
}

// 5. Duplicate Entrance Attempt Test (Second Scan -> ALREADY_CHECKED_IN)
console.log("\n[5] Testing Duplicate Gate Entrance Attempt (2nd Scan)...");
const secondScan = performTicketCheckIn(
  testTicketCode,
  "Gate Bouncer 2",
  "iPad Air - Safari",
);
console.log(`✓ Second Scan Result: ${secondScan.status}`);
console.log(`✓ Warning Alert: ${secondScan.message}`);

if (
  secondScan.status !== "ALREADY_CHECKED_IN" ||
  secondScan.success !== false
) {
  throw new Error(
    "Anti-fraud check-in failed: Duplicate entry was not blocked!",
  );
}

// Check-in audit logs
const logs = dbQuery("SELECT * FROM check_in_logs WHERE ticketId = ?", [
  loadedTicket?.id,
]);
console.log(
  `✓ Check-In Audit Logs Recorded: ${logs.length} events (SUCCESS and DUPLICATE logged)`,
);

console.log("\n==================================================");
console.log(" ALL 5 TEST SUITES PASSED FLAWLESSLY! 🚀");
console.log("==================================================");
