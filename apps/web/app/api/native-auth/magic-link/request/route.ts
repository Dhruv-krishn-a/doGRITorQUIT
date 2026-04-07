import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sanitizeNativeRedirectUri } from "@/lib/native-redirect";
import { sendMagicLinkEmail } from "@/lib/mail";

const TOKEN_TTL_MS = 10 * 60 * 1000;
const IDENTIFIER_PREFIX = "native-magic:";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; redirectUri?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const redirectUri = sanitizeNativeRedirectUri(String(body.redirectUri ?? "").trim());

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!redirectUri) {
      return NextResponse.json({ error: "Invalid redirect URI" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true },
    });

    // Prevent account enumeration.
    if (!user) {
      return NextResponse.json({ success: true, message: "If an account exists, a login link has been sent." });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before requesting a magic link." },
        { status: 403 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_TTL_MS);
    const identifier = `${IDENTIFIER_PREFIX}${email}`;

    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    const origin = new URL(request.url).origin;
    const verifyUrl = `${origin}/api/native-auth/magic-link/verify?token=${encodeURIComponent(token)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    await sendMagicLinkEmail(email, verifyUrl);

    return NextResponse.json({ success: true, message: "If an account exists, a login link has been sent." });
  } catch (error) {
    console.error("Native magic-link request failed:", error);
    return NextResponse.json({ error: "Unable to send magic link right now" }, { status: 500 });
  }
}
