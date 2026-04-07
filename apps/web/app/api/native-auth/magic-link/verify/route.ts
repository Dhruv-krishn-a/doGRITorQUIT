import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signNativeAccessToken } from "@/lib/native-auth-token";
import { sanitizeNativeRedirectUri } from "@/lib/native-redirect";

const IDENTIFIER_PREFIX = "native-magic:";

function appendParams(uri: string, params: Record<string, string>) {
  const hasHash = uri.includes("#");
  const separator = hasHash ? "&" : uri.includes("?") ? "&" : "?";
  const query = new URLSearchParams(params).toString();
  return `${uri}${separator}${query}`;
}

function redirectPage(target: string) {
  const escapedTarget = target.replace(/"/g, "&quot;");
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Open GritOrQuit</title>
        <style>
          body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; margin:0; background:#0b0c10; color:#f4f4f5; display:flex; min-height:100vh; align-items:center; justify-content:center; }
          .card { width:min(92vw,420px); background:#151821; border:1px solid #2a2f3a; border-radius:16px; padding:24px; text-align:center; }
          .btn { display:inline-block; margin-top:16px; padding:12px 16px; border-radius:10px; background:#ffffff; color:#111827; text-decoration:none; font-weight:700; }
          .muted { color:#9ca3af; font-size:13px; margin-top:10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Return To App</h2>
          <p>Magic link verified. Opening GritOrQuit now.</p>
          <a class="btn" href="${escapedTarget}">Open App</a>
          <p class="muted">If it does not open automatically, tap the button.</p>
        </div>
        <script>
          setTimeout(function () { window.location.href = "${escapedTarget}"; }, 50);
        </script>
      </body>
    </html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = String(url.searchParams.get("token") ?? "").trim();
  const redirectUri = sanitizeNativeRedirectUri(url.searchParams.get("redirect_uri"));

  if (!redirectUri) {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const fail = (error: string, errorDescription: string) =>
    redirectPage(
      appendParams(redirectUri, {
        error,
        error_description: errorDescription,
      })
    );

  try {
    if (!token) {
      return fail("invalid_token", "Missing token");
    }

    const row = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!row || row.expires < new Date() || !row.identifier.startsWith(IDENTIFIER_PREFIX)) {
      return fail("invalid_token", "Invalid or expired token");
    }

    const email = row.identifier.slice(IDENTIFIER_PREFIX.length);
    if (!email) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => undefined);
      return fail("invalid_token", "Invalid token payload");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true },
    });

    await prisma.verificationToken.delete({ where: { token } }).catch(() => undefined);

    if (!user) {
      return fail("invalid_user", "User not found");
    }

    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const nativeToken = await signNativeAccessToken(
      {
        sub: user.id,
        email: user.email,
        type: "native-access",
      },
      expiresIn
    );

    return redirectPage(
      appendParams(redirectUri, {
        native_token: nativeToken,
        token_type: "bearer",
        expires_in: String(expiresIn),
      })
    );
  } catch (error) {
    console.error("Native magic-link verification failed:", error);
    return fail("internal_error", "Could not complete sign-in");
  }
}
