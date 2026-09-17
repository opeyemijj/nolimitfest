import crypto from "node:crypto";
import { cookies } from "next/headers";
import { dbQueryOne } from "./db";

export * from "./permissions";
import { AuthUser, PermissionKey, UserRole } from "./permissions";

const AUTH_COOKIE_NAME = "nlf_staff_session";
const SECRET_KEY =
  process.env.AUTH_SECRET || "fest_secret_key_nolimitfest_2026_jwt_token_sign";

/**
 * Hash a plain text password with salt using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const testHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(originalHash, "hex"),
      Buffer.from(testHash, "hex"),
    );
  } catch {
    return false;
  }
}

/**
 * Create a secure HMAC signed session token
 */
export function createSessionToken(user: AuthUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    permissions: user.permissions || [],
    assignedEvents: user.assignedEvents || ["ALL"],
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify and decode an HMAC signed session token
 */
export function verifySessionToken(token: string): {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  permissions?: PermissionKey[];
  assignedEvents?: string[];
} | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(data)
      .digest("base64url");
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to retrieve currently authenticated staff user
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    try {
      const dbUser = await dbQueryOne<any>(
        `SELECT id, name, email, role, is_active AS "isActive",
                permissions, assigned_events AS "assignedEvents"
         FROM users WHERE id = $1 AND is_active = true`,
        [payload.id],
      );
      if (dbUser) {
        // JSONB comes back as arrays already in pg; guard against null
        const parsedPermissions: PermissionKey[] = Array.isArray(
          dbUser.permissions,
        )
          ? dbUser.permissions
          : [];
        const parsedEvents: string[] = Array.isArray(dbUser.assignedEvents)
          ? dbUser.assignedEvents
          : ["ALL"];

        return {
          id: String(dbUser.id),
          name: String(dbUser.name),
          email: String(dbUser.email),
          role: dbUser.role,
          isActive: dbUser.isActive ? 1 : 0,
          permissions: parsedPermissions,
          assignedEvents: parsedEvents,
        };
      }
    } catch (e) {
      // If DB is busy or migrating, rely on the verified HMAC payload
    }

    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role,
      isActive: 1,
      permissions: payload.permissions || [],
      assignedEvents: payload.assignedEvents || ["ALL"],
    };
  } catch {
    return null;
  }
}

export { AUTH_COOKIE_NAME };
