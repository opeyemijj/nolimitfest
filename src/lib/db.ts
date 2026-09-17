import fs from "node:fs";
import path from "node:path";
// @ts-ignore
import { DatabaseSync } from "node:sqlite";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "fest.db");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE);
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    -- Users & Role-Based Access Control
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'GATE_STAFF', -- 'SUPER_ADMIN', 'ORGANIZER', 'GATE_STAFF'
      isActive INTEGER NOT NULL DEFAULT 1,
      permissions TEXT DEFAULT '[]', -- JSON array of allowed module keys
      assignedEvents TEXT DEFAULT '["ALL"]', -- JSON array of assigned event IDs or ["ALL"]
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Site Settings & Festival Config
    CREATE TABLE IF NOT EXISTS site_config (
      id TEXT PRIMARY KEY DEFAULT 'global',
      name TEXT NOT NULL,
      shortName TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      defaultWhatsApp TEXT NOT NULL,
      email TEXT NOT NULL,
      marqueeText TEXT NOT NULL,
      ageLimit TEXT NOT NULL,
      socials TEXT NOT NULL, -- JSON
      organizers TEXT NOT NULL, -- JSON
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Festival Events
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      edition TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      flag TEXT NOT NULL,
      region TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- active, waitlist, announced, completed
      dates TEXT NOT NULL,
      time TEXT NOT NULL,
      year TEXT NOT NULL,
      venue TEXT NOT NULL,
      address TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      heroImage TEXT NOT NULL,
      stagesCount INTEGER NOT NULL DEFAULT 2,
      expectedAttendance TEXT NOT NULL,
      isCurrentEdition INTEGER NOT NULL DEFAULT 0,
      experiences TEXT NOT NULL, -- JSON array
      partners TEXT, -- JSON array
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Ticket Tiers & Packages
    CREATE TABLE IF NOT EXISTS ticket_tiers (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'phase', 'group', 'table', 'vvip'
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'AED',
      capacity INTEGER NOT NULL,
      soldCount INTEGER NOT NULL DEFAULT 0,
      paxPerUnit INTEGER NOT NULL DEFAULT 1,
      badge TEXT,
      description TEXT,
      perks TEXT NOT NULL, -- JSON array
      status TEXT NOT NULL DEFAULT 'active', -- active, upcoming, sold_out, hidden
      popular INTEGER NOT NULL DEFAULT 0,
      isVVIP INTEGER NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#00E676',
      wristbandColor TEXT NOT NULL DEFAULT 'NEON GREEN',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE NOT NULL,
      eventId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerLocation TEXT,
      notes TEXT,
      totalAmount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'AED',
      status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
      stripeSessionId TEXT UNIQUE,
      stripePaymentIntent TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (eventId) REFERENCES events(id)
    );

    -- Tickets
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      tierId TEXT NOT NULL,
      ticketCode TEXT UNIQUE NOT NULL,
      qrHash TEXT UNIQUE NOT NULL,
      attendeeName TEXT NOT NULL,
      attendeeEmail TEXT,
      status TEXT NOT NULL DEFAULT 'VALID', -- VALID, CHECKED_IN, CANCELLED
      checkedInAt TEXT,
      checkedInBy TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (tierId) REFERENCES ticket_tiers(id)
    );

    -- Door Check-in Logs
    CREATE TABLE IF NOT EXISTS check_in_logs (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      scannedAt TEXT NOT NULL DEFAULT (datetime('now')),
      result TEXT NOT NULL, -- SUCCESS, DUPLICATE, INVALID
      staffEmail TEXT,
      deviceInfo TEXT,
      FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE
    );

    -- Artists & Lineup
    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- Headliner, Supporting Act, Special Guest, etc.
      genre TEXT NOT NULL,
      day TEXT NOT NULL,
      stage TEXT NOT NULL,
      time TEXT NOT NULL,
      image TEXT NOT NULL,
      bio TEXT NOT NULL,
      origin TEXT NOT NULL,
      hits TEXT NOT NULL, -- JSON array
      spotifyUrl TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Festival Stages
    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      genres TEXT NOT NULL, -- JSON array
      capacity TEXT NOT NULL,
      production TEXT NOT NULL, -- JSON object
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- FAQs
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Performance Indexes for Sub-5ms Lookups
    CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticketCode);
    CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qrHash);
    CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(orderId);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(orderNumber);
    CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripeSessionId);
    CREATE INDEX IF NOT EXISTS idx_tiers_event ON ticket_tiers(eventId);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Migrate existing users table if columns are missing
  try {
    const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columnNames = userColumns.map((c) => c.name);
    if (!columnNames.includes("permissions")) {
      db.exec("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[]';");
    }
    if (!columnNames.includes("assignedEvents")) {
      db.exec(
        "ALTER TABLE users ADD COLUMN assignedEvents TEXT DEFAULT '[\"ALL\"]';",
      );
    }
  } catch (e) {
    console.error("Migration error on users table:", e);
  }

  // Migrate existing ticket_tiers table for wristband color tracking
  try {
    const tierColumns = db
      .prepare("PRAGMA table_info(ticket_tiers)")
      .all() as any[];
    const columnNames = tierColumns.map((c) => c.name);
    if (!columnNames.includes("color")) {
      db.exec(
        "ALTER TABLE ticket_tiers ADD COLUMN color TEXT DEFAULT '#00E676';",
      );
    }
    if (!columnNames.includes("wristbandColor")) {
      db.exec(
        "ALTER TABLE ticket_tiers ADD COLUMN wristbandColor TEXT DEFAULT 'NEON GREEN';",
      );
    }

    // Populate distinctive wristband colors for existing tiers
    db.exec(`
      UPDATE ticket_tiers SET color = '#00E676', wristbandColor = 'NEON GREEN' WHERE category = 'phase';
      UPDATE ticket_tiers SET color = '#00E5FF', wristbandColor = 'ELECTRIC CYAN' WHERE category = 'group' AND paxPerUnit = 3;
      UPDATE ticket_tiers SET color = '#2979FF', wristbandColor = 'COBALT BLUE' WHERE category = 'group' AND paxPerUnit = 5;
      UPDATE ticket_tiers SET color = '#FFD600', wristbandColor = 'ROYAL GOLD VIP' WHERE category = 'table' AND paxPerUnit = 6;
      UPDATE ticket_tiers SET color = '#FFAB00', wristbandColor = 'AMBER GOLD VIP' WHERE category = 'table' AND paxPerUnit = 8;
      UPDATE ticket_tiers SET color = '#FF6D00', wristbandColor = 'SUNSET ORANGE VIP' WHERE category = 'table' AND paxPerUnit = 10 AND isVVIP = 0;
      UPDATE ticket_tiers SET color = '#D500F9', wristbandColor = 'ELECTRIC PURPLE VVIP' WHERE isVVIP = 1 OR category = 'vvip';
    `);
  } catch (e) {
    console.error("Migration error on ticket_tiers table:", e);
  }
}

// Helper methods for typed queries (ensures plain objects for React 19 Server Components)
function sanitizeParams(params: any[]): any[] {
  return params.map((p) => (p === undefined ? null : p));
}

export function dbQuery<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  const rows = stmt.all(...sanitizeParams(params));
  return rows.map((r: any) =>
    r && typeof r === "object" ? { ...r } : r,
  ) as T[];
}

export function dbQueryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.get(...sanitizeParams(params));
  if (!result || typeof result !== "object") return null;
  return { ...result } as T;
}

export function dbExecute(sql: string, params: any[] = []): void {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.run(...sanitizeParams(params));
}

// -----------------------------------------------------------------------------
// Supabase / PostgreSQL Connection Pool & Asynchronous Helpers
// -----------------------------------------------------------------------------
import { Pool } from "pg";

let pgPoolInstance: Pool | null = null;

export function getPgPool(): Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!pgPoolInstance && dbUrl) {
    pgPoolInstance = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pgPoolInstance;
}

export async function pgQuery<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  const pool = getPgPool();
  if (!pool) return [];
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

export async function pgQueryOne<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T | null> {
  const pool = getPgPool();
  if (!pool) return null;
  const res = await pool.query(sql, params);
  return (res.rows[0] as T) || null;
}

export async function pgExecute(
  sql: string,
  params: any[] = [],
): Promise<void> {
  const pool = getPgPool();
  if (!pool) return;
  await pool.query(sql, params);
}
