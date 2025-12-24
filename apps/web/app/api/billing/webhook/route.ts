// apps/web/app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Set RAZORPAY_WEBHOOK_SECRET in env (the secret you configured in Razorpay dashboard)
 * Header sent by Razorpay: 'x-razorpay-signature'
 */


const SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

function verifySignature(payload: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.error("CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set");
  return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }
  if (!verifySignature(raw, signature, SECRET)) {
    console.warn("Invalid Razorpay webhook signature");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON payload", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const event = payload.event;
    // handle payment.captured and order.paid (order-level or payment-level)
    if (event === "payment.captured" || event === "payment.authorized") {
      const payment = payload.payload.payment?.entity || payload.payload?.payment?.entity;
      if (!payment) return NextResponse.json({ ok: true });

      const providerPaymentId = payment.id;
      const providerOrderId = payment.order_id;

      // update Order
      const dbOrder = await prisma.order.findUnique({
        where: { providerOrderId: providerOrderId },
      });

      if (dbOrder) {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            providerPaymentId,
            status: payment.status ?? "captured",
            metadata: { ...dbOrder.metadata, payment },
          },
        });
      } else {
        console.warn("Order not found for providerOrderId:", providerOrderId);
      }

      // If captured, provision subscription
      if (payment.status === "captured") {
        // find product from order (if present)
        const orderRec = await prisma.order.findUnique({ where: { providerOrderId } });
        if (!orderRec) return NextResponse.json({ ok: true });

        const productId = orderRec.productId;
        const userId = orderRec.userId;

        if (!productId || !userId) return NextResponse.json({ ok: true });

        // Idempotent: check if UserSubscription already exists for this providerPaymentId
        const existing = await prisma.userSubscription.findFirst({
          where: {
            providerSubId: providerPaymentId,
          },
        });

        if (!existing) {
          // create user subscription
          const product = await prisma.product.findUnique({ where: { id: productId } });

          // set reasonable currentPeriodEnd (30 days) or null (since Razorpay may not have recurrence)
          const now = new Date();
          const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          const sub = await prisma.userSubscription.create({
            data: {
              userId,
              productId,
              status: "active",
              startedAt: now,
              currentPeriodEnd: thirtyDays,
              provider: "razorpay",
              providerSubId: providerPaymentId,
            },
          });

          // Map product key to Tier (simple rule)
          let tierToSet: "PRO" | "TEAM" | null = null;
          if (product?.key?.toUpperCase().includes("TEAM")) tierToSet = "TEAM";
          else if (product?.key?.toUpperCase().includes("PRO")) tierToSet = "PRO";

          if (tierToSet) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                tier: tierToSet,
              },
            });
          }
        }
      }

      return NextResponse.json({ ok: true });
    } else if (event === "order.paid") {
      // Some setups send order.paid - handle similarly
      const ord = payload.payload.order?.entity;
      if (!ord) return NextResponse.json({ ok: true });
      const providerOrderId = ord.id;

      const dbOrder = await prisma.order.findUnique({
        where: { providerOrderId },
      });

      if (dbOrder) {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            status: ord.status ?? "paid",
            metadata: { ...dbOrder.metadata, order: ord },
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    // ignore other events for now
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
