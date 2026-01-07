import { NextResponse } from "next/server";
import { payment } from "@domain"; 

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    await payment.handleWebhook(rawBody, signature);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Webhook Error";
    console.error("[Webhook Error]", message);

    const status = message.includes("signature") ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}