// =============================================================================
// NO LIMIT FEST — DATABASE LAYER (Supabase PostgreSQL Only)
// =============================================================================
// All data is stored in Supabase. SQLite has been fully removed.
// Column convention: snake_case in Supabase SQL, aliased to camelCase in queries.
// =============================================================================

import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Connection Pool
// ---------------------------------------------------------------------------
let pgPoolInstance: Pool | null = null;

export function getPgPool(): Pool {
  if (!pgPoolInstance) {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please configure your Supabase connection string in .env.local.",
      );
    }

    // Strip sslmode query parameters if present because pg parses sslmode=require
    // as strict verify-full, overriding ssl: { rejectUnauthorized: false }
    try {
      const url = new URL(connectionString);
      url.searchParams.delete("sslmode");
      url.searchParams.delete("ssl");
      connectionString = url.toString();
    } catch {
      connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/g, "");
    }

    pgPoolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pgPoolInstance;
}

// ---------------------------------------------------------------------------
// Core async query helpers — these replace the old synchronous SQLite helpers.
// All callers must await these functions.
// ---------------------------------------------------------------------------

/**
 * Execute a SELECT query and return typed rows.
 * Use $1, $2, ... for placeholders (PostgreSQL style).
 */
export async function dbQuery<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  const pool = getPgPool();
  const sanitized = params.map((p) => (p === undefined ? null : p));
  const result = await pool.query(sql, sanitized);
  return result.rows as T[];
}

/**
 * Execute a SELECT query and return the first row, or null.
 */
export async function dbQueryOne<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Execute a non-SELECT statement (INSERT, UPDATE, DELETE).
 */
export async function dbExecute(
  sql: string,
  params: any[] = [],
): Promise<void> {
  const pool = getPgPool();
  const sanitized = params.map((p) => (p === undefined ? null : p));
  await pool.query(sql, sanitized);
}

// ---------------------------------------------------------------------------
// Named aliases for explicit pg calls (used by legacy code paths)
// ---------------------------------------------------------------------------
export const pgQuery = dbQuery;
export const pgQueryOne = dbQueryOne;
export const pgExecute = dbExecute;

// ---------------------------------------------------------------------------
// Compatibility shim — getDb() is no longer needed (no SQLite)
// ---------------------------------------------------------------------------
export function getDb() {
  // Returns nothing — kept only to avoid import errors during migration.
  // All code should use dbQuery / dbQueryOne / dbExecute instead.
  return null;
}
