import { NextRequest, NextResponse } from "next/server";
import { dbQueryOne, pgQueryOne } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AuthUser,
} from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    seedDatabase(); // Ensure default users exist
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = dbQueryOne<any>(
      "SELECT * FROM users WHERE email = ? AND isActive = 1",
      [cleanEmail],
    );

    if (!user) {
      try {
        const pgUser = await pgQueryOne<any>(
          'SELECT id, name, email, password_hash as "passwordHash", role, is_active as "isActive" FROM users WHERE email = $1 AND is_active = 1',
          [cleanEmail],
        );
        if (pgUser) user = pgUser;
      } catch {}
    }
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
      isActive: user.isActive,
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
