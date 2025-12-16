import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return NextResponse.json(subscription);
}
