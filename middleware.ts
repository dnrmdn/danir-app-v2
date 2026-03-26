import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware for admin route protection.
 *
 * Note: better-auth uses DB-based sessions (not JWTs), so we cannot verify
 * the user ROLE at the edge. This middleware only checks that a session cookie
 * exists (basic authentication check). The actual ADMIN role enforcement
 * happens in the server layout component (getAdminSession) and API routes
 * (requireAdminSession), which can query the database.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    // better-auth sets a session cookie named "better-auth.session_token"
    const sessionToken =
      req.cookies.get("better-auth.session_token")?.value ||
      req.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
