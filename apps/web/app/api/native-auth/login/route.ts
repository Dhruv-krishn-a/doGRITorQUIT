import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import {
  clearFailedLoginAttempts,
  extractRequestContext,
  markAndCheckNewDevice,
  registerFailedLoginAttempt,
} from "@/lib/auth-security";
import { sendNewLoginAlertEmail, sendSuspiciousActivityEmail } from "@/lib/mail";

const getNativeSecret = () => {
  const secret = process.env.AUTH_NATIVE_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_NATIVE_JWT_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "invalid_request", message: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const context = extractRequestContext(req.headers);

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { profile: true },
    });

    if (!user) {
      await registerFailedLoginAttempt(emailLower, context.ip);
      return NextResponse.json(
        { error: "invalid_credentials", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "legacy_account", message: "Legacy account detected. Please reset your password." },
        { status: 403 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "email_not_verified", message: "Please verify your email before signing in." },
        { status: 403 }
      );
    }

    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      const failed = await registerFailedLoginAttempt(emailLower, context.ip);
      if (failed.shouldAlert) {
        await sendSuspiciousActivityEmail({
          email: emailLower,
          reason: "Multiple failed password login attempts",
          time: new Date(),
          ip: context.ip,
          userAgent: context.userAgent,
          locationHint: context.locationHint,
        }).catch((error) => {
          console.error("Failed to send suspicious activity email:", error);
        });
      }
      return NextResponse.json(
        { error: "invalid_credentials", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    await clearFailedLoginAttempts(emailLower, context.ip);
    const isNewDevice = await markAndCheckNewDevice(user.id, context.fingerprint, {
      ip: context.ip,
      userAgent: context.userAgent,
      locationHint: context.locationHint,
    });
    if (isNewDevice) {
      await sendNewLoginAlertEmail({
        email: user.email,
        time: new Date(),
        ip: context.ip,
        userAgent: context.userAgent,
        locationHint: context.locationHint,
      }).catch((error) => {
        console.error("Failed to send new login alert email:", error);
      });
    }

    // Sign the token for native client
    const secret = getNativeSecret();
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.profile?.name,
      role: user.role,
      tier: user.tier,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json({
      success: true,
      token,
      token_type: "bearer",
      access_token: token,
      expires_in: 60 * 60 * 24 * 30,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name,
        role: user.role,
        tier: user.tier,
      },
    });
  } catch (error) {
    console.error("Native login API error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
