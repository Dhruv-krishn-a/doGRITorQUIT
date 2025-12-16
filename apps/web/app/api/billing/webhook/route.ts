import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();

  const signature = headerList.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    console.error("Invalid Razorpay signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  try {
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;
      const productKey = payment.notes?.productKey;

      if (!userId || !productKey) {
        throw new Error("Missing payment notes");
      }

      const product = await prisma.product.findUnique({
        where: { key: productKey },
      });

      if (!product) throw new Error("Product not found");

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1); // monthly

      // 🔒 SINGLE SOURCE OF TRUTH
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          status: "active",
          priceId: product.key,
          currentPeriodEnd: periodEnd,
        },
        create: {
          userId,
          status: "active",
          priceId: product.key,
          currentPeriodEnd: periodEnd,
        },
      });

      console.log("Subscription activated for", userId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[razorpay-webhook]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
