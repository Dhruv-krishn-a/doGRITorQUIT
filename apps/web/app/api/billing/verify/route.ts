// apps/web/app/api/billing/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { takeRateLimit } from "@/lib/rate-limit";
import { payment } from "@gritorquit/domain"; 

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const rateLimit = takeRateLimit(`billing-verify:${user.id}:${clientIp}`, 5, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many verification attempts" }, { status: 429 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Delegate to Domain
    await payment.verifyAndActivateSubscription(
      user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Verify Error]", err);
    
    const message = err instanceof Error ? err.message : "Verification failed";
    const status = message === "Invalid payment signature" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
