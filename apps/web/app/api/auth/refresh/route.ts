import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  verifyNativeRefreshToken, 
  signNativeAccessToken, 
  signNativeRefreshToken 
} from "@/lib/native-auth-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const refreshToken = body.refresh_token;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    // 1. Verify token structure/signature
    const payload = await verifyNativeRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // 2. Check DB for token validity (Rotation & Revocation)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { profile: true } } }
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      // Security: If a revoked token is used, it might be a reuse attack.
      // Optionally revoke all tokens for this user.
      return NextResponse.json({ error: "Refresh token expired or revoked" }, { status: 401 });
    }

    // 3. Token Rotation: Revoke old, issue new
    const nextAccessExpiresIn = 60 * 60 * 1; // 1 hour
    const nextAccessToken = await signNativeAccessToken({
      sub: storedToken.userId,
      email: storedToken.user.email,
      type: "native-access"
    }, nextAccessExpiresIn);

    const nextRefreshToken = await signNativeRefreshToken(storedToken.userId);
    const nextRefreshExpiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000); // 30 days

    await prisma.$transaction([
      // Revoke current token
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      }),
      // Create new token
      prisma.refreshToken.create({
        data: {
          token: nextRefreshToken,
          userId: storedToken.userId,
          expiresAt: nextRefreshExpiresAt,
          deviceId: storedToken.deviceId
        }
      })
    ]);

    return NextResponse.json({
      token_type: "bearer",
      access_token: nextAccessToken,
      refresh_token: nextRefreshToken,
      expires_in: nextAccessExpiresIn,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.profile?.name ?? null,
        image: storedToken.user.profile?.avatarUrl ?? null,
      }
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
