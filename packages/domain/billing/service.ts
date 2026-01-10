// packages/domain/billing/service.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

const razor = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as unknown as Prisma.InputJsonValue;
}

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

export async function handleWebhook(rawBody: string, signature: string) {
  if (!RAZORPAY_WEBHOOK_SECRET) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");

  const expected = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  if (expected !== signature) {
    throw new Error("Invalid Razorpay webhook signature");
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  if (event === "payment.captured" || event === "payment.authorized") {
    const payment = payload.payload.payment?.entity;
    if (!payment) return;

    const providerOrderId = payment.order_id;
    const providerPaymentId = payment.id;

    const dbOrder = await prisma.order.findUnique({ where: { providerOrderId } });
    if (dbOrder) {
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
 * ✅ FIXED: Updates User Tier with the REAL Product Name
 */
async function _activateSubscription(providerOrderId: string, providerPaymentId: string) {
  const order = await prisma.order.findUnique({
    where: { providerOrderId },
    include: { product: true },
  });

  if (!order || !order.product || !order.userId) return;

  // Idempotency check
  const existingSub = await prisma.userSubscription.findFirst({
    where: { providerSubId: providerPaymentId },
  });

  if (!existingSub) {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Create Subscription
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

    // 2. ✅ Update User Label to match Product Name
    // This ensures Supabase 'tier' column matches the actual purchased plan
    await prisma.user.update({ 
      where: { id: order.userId }, 
      data: { tier: order.product.name } 
    });

    // 3. Mark Order Paid
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

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { 
      userId,
      status: { in: ["paid", "captured"] } 
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return orders.map(order => ({
    id: order.id,
    date: order.createdAt.toISOString(),
    amount: order.amount,
    status: order.status,
    invoiceUrl: null 
  }));
}