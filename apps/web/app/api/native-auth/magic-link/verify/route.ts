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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = String(url.searchParams.get("token") ?? "").trim();
  const redirectUri = sanitizeNativeRedirectUri(url.searchParams.get("redirect_uri"));

  if (!redirectUri) {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const fail = (error: string, errorDescription: string) =>
    NextResponse.redirect(
      appendParams(redirectUri, {
        error,
        error_description: errorDescription,
      }),
      302
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

    return NextResponse.redirect(
      appendParams(redirectUri, {
        native_token: nativeToken,
        token_type: "bearer",
        expires_in: String(expiresIn),
      }),
      302
    );
  } catch (error) {
    console.error("Native magic-link verification failed:", error);
    return fail("internal_error", "Could not complete sign-in");
  }
}
