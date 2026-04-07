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
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
          <meta http-equiv="refresh" content="0; url=${target}" />
          <script>window.location.href = "${target}";</script>
        </head>
        <body>
          <p>Redirecting to app... if nothing happens, <a href="${target}">click here</a>.</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
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
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
          <meta http-equiv="refresh" content="0; url=${target}" />
          <script>window.location.href = "${target}";</script>
        </head>
        <body>
          <p>Redirecting to app... if nothing happens, <a href="${target}">click here</a>.</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const target = appendParams(redirectUri, {
    native_token: token,
    token_type: "bearer",
    expires_in: String(60 * 60 * 24 * 7),
  });

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <meta http-equiv="refresh" content="0; url=${target}" />
        <script>window.location.href = "${target}";</script>
      </head>
      <body>
        <p>Redirecting to app... if nothing happens, <a href="${target}">click here</a>.</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
}
