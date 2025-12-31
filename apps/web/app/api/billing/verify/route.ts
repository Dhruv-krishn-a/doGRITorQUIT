// apps/web/app/api/billing/verify/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { payment } from "@domain"; // ✅ Using Domain

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Delegate to Domain
    await payment.verifyAndActivateSubscription(
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Verify Error]", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}