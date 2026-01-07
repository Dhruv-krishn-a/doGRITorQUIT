// apps/web/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}