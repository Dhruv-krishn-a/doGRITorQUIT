// apps/web/app/api/billing/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { payment } from "@domain"; // ✅ Make sure you exported 'payment' in packages/domain/index.ts

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // Delegate to Domain
    const result = await payment.createCheckoutOrder(userId, body.productKey);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}