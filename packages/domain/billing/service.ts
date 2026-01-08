// packages/domain/billing/service.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * NOTE:
 * - We import Prisma type to cast JSON payloads to Prisma.InputJsonValue
 * - This file serializes SDK objects (Razorpay) to plain JSON and casts them
 *   so TypeScript/Prisma accept them for JSON columns.
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

const razor = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Helper: serialize any SDK object to plain JSON that Prisma accepts
function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  // JSON.stringify -> JSON.parse removes prototypes/methods and yields plain POJOs/arrays/primitives
  return JSON.parse(JSON.stringify(value)) as unknown as Prisma.InputJsonValue;
}

/**
 * Create a new Razorpay Order
 */
export async function createCheckoutOrder(userId: string, productKey: string) {
  const product = await prisma.product.findUnique({ where: { key: productKey } });
  if (!product) throw new Error("Invalid productKey");

  const amount = product.price;
  const currency = product.currency ?? "INR";

  // Create a unique receipt ID
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
      // serialize SDK object and cast to Prisma.InputJsonValue
      metadata: toPrismaJson({ raw: order }),
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: RAZORPAY_KEY_ID,
  };
}

/**
 * Client-side verification helper (called by /api/billing/verify)
 */
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

  return _activateSubscription(razorpayOrderId, razorpayPaymentId);
}

/**
 * Webhook Handler (Server-to-Server)
 */
export async function handleWebhook(rawBody: string, signature: string) {
  if (!RAZORPAY_WEBHOOK_SECRET) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");

  // 1. Verify Signature
  const expected = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  if (expected !== signature) {
    throw new Error("Invalid Razorpay webhook signature");
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  // 2. Handle Events
  if (event === "payment.captured" || event === "payment.authorized") {
    const payment = payload.payload.payment?.entity;
    if (!payment) return;

    const providerOrderId = payment.order_id;
    const providerPaymentId = payment.id;

    // Update Order Status
    const dbOrder = await prisma.order.findUnique({ where: { providerOrderId } });
    if (dbOrder) {
      // build merged metadata as plain object, then cast to Prisma JSON
      const existingMetadata = (dbOrder.metadata ?? {}) as Record<string, unknown>;
      const merged = {
        ...existingMetadata,
        webhook_payment: payment,
      };
      await prisma.order.update({
        where: { id: dbOrder.id },
        data: {
          providerPaymentId,
          status: payment.status ?? "captured",
          metadata: toPrismaJson(merged),
        },
      });
    }

    // Provision Subscription if captured
    if (payment.status === "captured") {
      await _activateSubscription(providerOrderId, providerPaymentId);
    }
  } else if (event === "order.paid") {
    const ord = payload.payload.order?.entity;
    if (ord) {
      const dbOrder = await prisma.order.findUnique({ where: { providerOrderId: ord.id } });
      if (dbOrder) {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { status: ord.status ?? "paid" },
        });
      }
    }
  }
}

/**
 * Internal helper to activate subscription logic (shared by verify & webhook)
 */
async function _activateSubscription(providerOrderId: string, providerPaymentId: string) {
  const order = await prisma.order.findUnique({
    where: { providerOrderId },
    include: { product: true },
  });

  if (!order || !order.product || !order.userId) return;

  // Idempotency: Check if already processed
  const existingSub = await prisma.userSubscription.findFirst({
    where: { providerSubId: providerPaymentId },
  });

  if (!existingSub) {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.userSubscription.create({
      data: {
        userId: order.userId,
        productId: order.product.id,
        status: "active",
        startedAt: now,
        currentPeriodEnd: thirtyDays,
        provider: "razorpay",
        providerSubId: providerPaymentId,
      },
    });

    let newTier = "FREE";
    const key = order.product.key.toUpperCase();
    if (key.includes("PRO")) newTier = "PRO";
    if (key.includes("TEAM")) newTier = "TEAM";

    if (newTier !== "FREE") {
      await prisma.user.update({ where: { id: order.userId }, data: { tier: newTier as any } });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", providerPaymentId },
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
