import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Cryptographic Verification (Security Check)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not defined");

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Activate Plan in Database (Idempotent)
    // Find the original order to know which product was bought
    const order = await prisma.order.findUnique({
      where: { providerOrderId: razorpay_order_id },
      include: { product: true }
    });

    if (!order || !order.product) {
      return NextResponse.json({ error: "Order record not found" }, { status: 404 });
    }

    // Check if subscription already exists (prevent duplicates)
    const existingSub = await prisma.userSubscription.findFirst({
      where: { providerSubId: razorpay_payment_id } 
    });

    if (!existingSub) {
      const now = new Date();
      // Default to 30 days if not specified
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // A. Create User Subscription
      await prisma.userSubscription.create({
        data: {
          userId,
          productId: order.product.id,
          status: "active",
          startedAt: now,
          currentPeriodEnd: thirtyDays,
          provider: "razorpay",
          providerSubId: razorpay_payment_id,
        },
      });

      // B. Update User Tier Badge (Legacy/UI support)
      let newTier = "FREE";
      if (order.product.key.includes("PRO")) newTier = "PRO";
      if (order.product.key.includes("TEAM")) newTier = "TEAM";

      if (newTier !== "FREE") {
        await prisma.user.update({
          where: { id: userId },
          data: { tier: newTier as any },
        });
      }

      // C. Mark Order as Paid
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          providerPaymentId: razorpay_payment_id,
          metadata: { ...((order.metadata as object) || {}), verified: true }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Verify Error]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}