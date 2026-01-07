// apps/web/app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import { payment } from "@domain"; // ✅ Using Domain

export async function POST(req: Request) {
  try {
    // 1. Get raw body (required for signature verification)
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 2. Delegate to Domain
    // The domain service will verify the signature and handle the DB updates
    await payment.handleWebhook(rawBody, signature);

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("[Webhook Error]", err.message);
    // Return 500 if it's a server/logic error, 400 if it's a signature error
    const status = err.message.includes("signature") ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}