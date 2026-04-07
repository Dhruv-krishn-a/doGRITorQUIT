import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signNativeAccessToken } from "@/lib/native-auth-token";
import {
  clearFailedLoginAttempts,
  extractRequestContext,
  markAndCheckNewDevice,
  registerFailedLoginAttempt,
} from "@/lib/auth-security";
import { sendNewLoginAlertEmail, sendSuspiciousActivityEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const context = extractRequestContext(request.headers);

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        passwordHash: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      await registerFailedLoginAttempt(email, context.ip);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Legacy account detected. Please reset your password." },
        { status: 403 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in." },
        { status: 403 }
      );
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      const failed = await registerFailedLoginAttempt(email, context.ip);
      if (failed.shouldAlert) {
        await sendSuspiciousActivityEmail({
          email,
          reason: "Multiple failed password login attempts",
          time: new Date(),
          ip: context.ip,
          userAgent: context.userAgent,
          locationHint: context.locationHint,
        }).catch((error) => {
          console.error("Failed to send suspicious activity email:", error);
        });
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await clearFailedLoginAttempts(email, context.ip);
    const isNewDevice = await markAndCheckNewDevice(user.id, context.fingerprint, {
      ip: context.ip,
      userAgent: context.userAgent,
      locationHint: context.locationHint,
    });
    if (isNewDevice) {
      await sendNewLoginAlertEmail({
        email,
        time: new Date(),
        ip: context.ip,
        userAgent: context.userAgent,
        locationHint: context.locationHint,
      }).catch((error) => {
        console.error("Failed to send new login alert email:", error);
      });
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const accessToken = await signNativeAccessToken(
      {
        sub: user.id,
        email: user.email,
        type: "native-access",
      },
      expiresIn
    );

    return NextResponse.json({
      token_type: "bearer",
      access_token: accessToken,
      expires_in: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name ?? null,
        image: user.profile?.avatarUrl ?? null,
      },
    });
  } catch (error) {
    console.error("Native credentials login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
