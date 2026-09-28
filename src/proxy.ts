import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "nlf_staff_session";
const SECRET_KEY =
  process.env.AUTH_SECRET || "fest_secret_key_nolimitfest_2026_jwt_token_sign";

/**
 * Verify HMAC SHA-256 session token using Edge-compatible Web Crypto
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [data, signature] = parts;
    if (!data || !signature) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expectedSigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(data),
    );

    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(expectedSigBuffer)),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (base64 !== signature) return false;

    // Validate expiration
    const payload = JSON.parse(
      atob(data.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Skip public auth endpoints
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    // If authenticated user visits login without a redirect/error trigger, send to dashboard
    if (pathname === "/admin/login") {
      const hasRedirectParam =
        req.nextUrl.searchParams.has("redirect") ||
        req.nextUrl.searchParams.has("error");
      const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

      // If user was kicked/redirected to login (e.g. suspended account or expired access),
      // purge the stale session cookie and show login form
      if (token && hasRedirectParam) {
        const res = NextResponse.next({ request: { headers: requestHeaders } });
        res.cookies.delete(AUTH_COOKIE_NAME);
        return res;
      }

      if (token && (await verifyToken(token))) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 2. Protect all /admin pages (strict redirection to /admin/login)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const isValid = token ? await verifyToken(token) : false;

    if (!isValid) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      if (token) {
        res.cookies.delete(AUTH_COOKIE_NAME);
      }
      return res;
    }
  }

  // 3. Protect all /api/admin endpoints (strict 401 Unauthorized)
  if (pathname.startsWith("/api/admin")) {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const isValid = token ? await verifyToken(token) : false;

    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized. Staff session required." },
        { status: 401 },
      );
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
