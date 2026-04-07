import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const ALLOWED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "tauri.localhost",
  "gritorquit.in",
  "www.gritorquit.in",
  "dogritorquit.in",
  "www.dogritorquit.in",
]);

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  if (origin === "tauri://localhost" || origin === "app://localhost" || origin === "asset://localhost") {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();

    if (!ALLOWED_HOSTS.has(hostname)) {
      return false;
    }

    if (
      hostname === "gritorquit.in" ||
      hostname === "www.gritorquit.in" ||
      hostname === "dogritorquit.in" ||
      hostname === "www.dogritorquit.in"
    ) {
      return parsed.protocol === "https:";
    }

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host")?.toLowerCase();

  if (host === "dogritorquit.in") {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https";
    canonical.host = "www.dogritorquit.in";
    return NextResponse.redirect(canonical, 308);
  }

  // Handle CORS preflight
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const response = new NextResponse(null, { status: 204 });
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Device-Id, X-Api-Version, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Vary", "Origin");
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
  const cookiePairs = request.cookies.getAll().map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
  }));
  const hasSupabaseSession = cookiePairs.some(
    (cookie) => cookie.name.includes("sb-") && cookie.value.length > 10
  );
  const hasNextAuthSession = cookiePairs.some(
    (cookie) =>
      (cookie.name === "authjs.session-token" ||
        cookie.name === "__Secure-authjs.session-token" ||
        cookie.name === "next-auth.session-token" ||
        cookie.name === "__Secure-next-auth.session-token") &&
      cookie.value.length > 10
  );
  const hasSession = hasSupabaseSession || hasNextAuthSession;

  // Protect dashboard/admin routes: if no cookie, redirect to login
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Add CORS headers to API responses
  if (pathname.startsWith("/api/") && origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
