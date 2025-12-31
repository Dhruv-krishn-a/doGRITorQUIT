// apps/web/app/api/billing/subscription/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { payment } from "@domain"; // ✅ Using Domain

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await payment.getUserSubscription(userId);
    
    if (!data) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[billing/subscription] ", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}