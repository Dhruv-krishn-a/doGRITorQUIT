// apps/web/app/api/billing/subscription/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tier: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: { product: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const activeSubscription = user.subscriptions.find((s) => s.status === "active") ?? null;

    return NextResponse.json({
      userTier: user.tier,
      activeSubscription,
      subscriptions: user.subscriptions,
    });
  } catch (err) {
    console.error("[billing/subscription] ", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
