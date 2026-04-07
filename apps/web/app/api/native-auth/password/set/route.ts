import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const authUser = await getServerUser();

    const body = (await request.json()) as { password?: string; token?: string };
    const password = String(body.password ?? "");
    const resetToken = String(body.token ?? "");

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    if (resetToken) {
      const tokenRow = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });

      if (!tokenRow || tokenRow.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: tokenRow.userId },
          data: {
            passwordHash,
            emailVerified: new Date(),
          },
        }),
        prisma.passwordResetToken.deleteMany({
          where: { userId: tokenRow.userId },
        }),
      ]);

      return NextResponse.json({ success: true });
    }

    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        passwordHash,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Native set password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
