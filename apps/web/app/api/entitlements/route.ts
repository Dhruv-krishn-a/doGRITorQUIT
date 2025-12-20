// apps/web/app/api/entitlements/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

export async function GET() {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  return NextResponse.json({
    tier: user?.tier ?? "FREE",
    aiGeneration: user?.tier !== "FREE",
    maxPlans: user?.tier === "FREE" ? 3 : Infinity,
  });
}
