// packages/domain/billing/service.ts
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";

// Ensure keys are read safely (fallback to empty string to prevent crash on init, but throw later)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

const razor = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// ✅ MUST have 'export' here
export async function createCheckoutOrder(userId: string, productKey: string) {
  const product = await prisma.product.findUnique({ where: { key: productKey } });
  if (!product) throw new Error("Invalid productKey");

  const amount = product.price; 
  const currency = product.currency ?? "INR";
  
  const rec = `u_${userId.slice(0, 8)}_${String(Date.now()).slice(-5)}`;
  const receipt = rec.slice(0, 40);

  const order = await razor.orders.create({
    amount,
    currency,
    receipt,
    notes: { productKey, userId },
  });

  await prisma.order.create({
    data: {
      providerOrderId: order.id,
      userId,
      productId: product.id,
      amount: Number(order.amount),
      currency: order.currency,
      status: order.status ?? "created",
      metadata: { raw: order },
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: RAZORPAY_KEY_ID,
  };
}

// ✅ Add the verification functions here too (needed for verify route)
export async function verifyAndActivateSubscription(
  userId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  if (!RAZORPAY_KEY_SECRET) throw new Error("RAZORPAY_KEY_SECRET is not defined");

  const generated_signature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generated_signature !== razorpaySignature) {
    throw new Error("Invalid payment signature");
  }

  const order = await prisma.order.findUnique({
    where: { providerOrderId: razorpayOrderId },
    include: { product: true }
  });

  if (!order || !order.product) throw new Error("Order not found");

  const existingSub = await prisma.userSubscription.findFirst({
    where: { providerSubId: razorpayPaymentId } 
  });

  if (!existingSub) {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.userSubscription.create({
      data: {
        userId,
        productId: order.product.id,
        status: "active",
        startedAt: now,
        currentPeriodEnd: thirtyDays,
        provider: "razorpay",
        providerSubId: razorpayPaymentId,
      },
    });

    let newTier = "FREE";
    if (order.product.key.includes("PRO")) newTier = "PRO";
    if (order.product.key.includes("TEAM")) newTier = "TEAM";

    if (newTier !== "FREE") {
      await prisma.user.update({ where: { id: userId }, data: { tier: newTier as any } });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        providerPaymentId: razorpayPaymentId,
        metadata: { ...((order.metadata as object) || {}), verified: true }
      }
    });
  }

  return { success: true };
}

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tier: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: { product: true },
      },
    },
  });

  if (!user) return null;
  const activeSubscription = user.subscriptions.find((s) => s.status === "active") ?? null;

  return {
    userTier: user.tier,
    activeSubscription,
    subscriptions: user.subscriptions,
  };
}