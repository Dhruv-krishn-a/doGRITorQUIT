// apps/web/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const ALLOWED_ORIGINS = [
  "http://localhost:1420",
  "tauri://localhost",
  "http://localhost",
  "http://tauri.localhost",
  "https://dogritorquit.in",
  "https://www.dogritorquit.in"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const response = new NextResponse(null, { status: 204 });
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Version, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
  }

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

  const response = NextResponse.next();

  // Add CORS headers to API responses
  if (pathname.startsWith("/api/") && origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    // apply to all routes except static assets and public API routes
    "/((?!_next/static|_next/image|favicon.ico|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
