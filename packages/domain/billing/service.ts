// packages/domain/billing/service.ts
import { prisma } from "@/lib/prisma"; // Ensure this alias works in your package
import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

const razor = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export async function createCheckoutOrder(userId: string, productKey: string) {
  const product = await prisma.product.findUnique({ where: { key: productKey } });
  if (!product) throw new Error("Invalid productKey");

  const amount = product.price; // Stored in paise
  const currency = product.currency ?? "INR";
  
  // Create Receipt ID
  const rec = `u_${userId.slice(0, 8)}_${String(Date.now()).slice(-5)}`;
  const receipt = rec.slice(0, 40);

  const order = await razor.orders.create({
    amount,
    currency,
    receipt,
    notes: { productKey, userId },
  });

  // Persist
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
    keyId: RAZORPAY_KEY_ID, // Return key for client
  };
}

export async function verifyPaymentSignature(
  orderId: string, 
  paymentId: string, 
  signature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not defined");

  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generated_signature !== signature) return false;

  return true;
}

export async function activateSubscriptionAfterPayment(
  userId: string, 
  providerOrderId: string, 
  providerPaymentId: string
) {
  const order = await prisma.order.findUnique({
    where: { providerOrderId },
    include: { product: true }
  });

  if (!order || !order.product) throw new Error("Order not found");

  // Check idempotency
  const existingSub = await prisma.userSubscription.findFirst({
    where: { providerSubId: providerPaymentId } 
  });

  if (existingSub) return; // Already processed

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Activate Subscription
  await prisma.userSubscription.create({
    data: {
      userId,
      productId: order.product.id,
      status: "active",
      startedAt: now,
      currentPeriodEnd: thirtyDays,
      provider: "razorpay",
      providerSubId: providerPaymentId,
    },
  });

  // Update User Tier (Legacy)
  let newTier = "FREE";
  if (order.product.key.includes("PRO")) newTier = "PRO";
  if (order.product.key.includes("TEAM")) newTier = "TEAM";

  if (newTier !== "FREE") {
    await prisma.user.update({
      where: { id: userId },
      data: { tier: newTier as any },
    });
  }

  // Update Order Status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      providerPaymentId: providerPaymentId,
      metadata: { ...((order.metadata as object) || {}), verified: true }
    }
  });

  return true;
}