// apps/cms/middleware.ts
import { type NextRequest, NextResponse } from "next/server";

/**
 * CMS middleware: lightweight session presence check.
 * Detailed role checks (admin) should be done in server layout/pages or via an admin endpoint
 * that does proper Supabase/Prisma checks — not in middleware.
 */
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname) ||
    pathname === "/favicon.ico" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const cookiePairs = request.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
  const hasSupabaseSession = cookiePairs.some(
    (c) =>
      c.name.includes("sb") && (c.name.includes("token") || c.name.includes("session") || c.value)
  );

  if (!hasSupabaseSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
