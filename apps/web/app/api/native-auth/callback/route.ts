import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signNativeAccessToken } from "@/lib/native-auth-token";
import { sanitizeNativeRedirectUri } from "@/lib/native-redirect";

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
          <p>We authenticated your account. Opening GritOrQuit now.</p>
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
  const redirectUri = sanitizeNativeRedirectUri(url.searchParams.get("redirect_uri"));

  if (!redirectUri) {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    console.error(`Native OAuth callback failed: Missing session or user ID for redirectUri: ${redirectUri}`);
    const target = appendParams(redirectUri, {
      error: "access_denied",
      error_description: "Authentication failed or was cancelled."
    });
    return redirectPage(target);
  }

  let token: string;
  try {
    token = await signNativeAccessToken({
      sub: session.user.id,
      email: session.user.email ?? undefined,
      type: "native-access",
    });
  } catch (error) {
    console.error("Native callback token sign error:", error);
    const target = appendParams(redirectUri, {
      error: "native_token_sign_failed",
      error_description: "Failed to sign native token."
    });
    return redirectPage(target);
  }

  const target = appendParams(redirectUri, {
    native_token: token,
    token_type: "bearer",
    expires_in: String(60 * 60 * 24 * 7),
  });

  return redirectPage(target);
}
