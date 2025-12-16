// apps/web/app/api/entitlements/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { getUserEntitlements } from "@domain/billing/entitlements";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ent = await getUserEntitlements(userId);
    return NextResponse.json(ent);
  } catch (err: any) {
    console.error("[GET /api/entitlements] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
