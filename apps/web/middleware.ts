// apps/web/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight middleware:
 * - Do NOT call Supabase or DB here (no network calls).
 * - Only check if a session cookie exists and protect pages that need auth.
 *
 * NOTE: replace 'sb-access-token' below if your Supabase cookie name differs.
 */
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static files, images and _next be served without middleware checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname) ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  // Quick cookie existence check (no network)
  // Supabase SSR sets a cookie like 'sb-access-token' / 'sb:token' depending on config.
  // We look for any cookie that contains 'sb-' and isn't empty to be robust.
  const cookiePairs = request.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
  const hasSupabaseSession = cookiePairs.some(
    (c) =>
      c.name.includes("sb-") && c.value.length > 10
  );

  // Protect dashboard/admin routes: if no cookie, redirect to login
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!hasSupabaseSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // apply to all routes except static assets and public API routes
    "/((?!_next/static|_next/image|favicon.ico|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
