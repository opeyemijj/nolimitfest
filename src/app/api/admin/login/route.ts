import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AuthUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await dbQueryOne<any>(
      `SELECT id, name, email, password_hash AS "passwordHash", role, is_active AS "isActive",
              permissions, assigned_events AS "assignedEvents"
       FROM users
       WHERE email = $1 AND is_active = true`,
      [cleanEmail],
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive ? 1 : 0,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      assignedEvents: Array.isArray(user.assignedEvents)
        ? user.assignedEvents
        : ["ALL"],
    };

    const token = createSessionToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      redirectUrl: authUser.role === "GATE_STAFF" ? "/admin/scan" : "/admin",
    });

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.nextUrl.protocol === "https:";

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Login Exception:", err);
    return NextResponse.json(
      { error: "Login failed due to server error." },
      { status: 500 },
    );
  }
}
