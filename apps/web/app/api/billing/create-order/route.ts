// apps/web/app/api/billing/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay keys not set");
}

const razor = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const productKey = body?.productKey;
    if (!productKey) return NextResponse.json({ error: "Missing productKey" }, { status: 400 });

    // Lookup product from DB
    const product = await prisma.product.findUnique({ where: { key: productKey } });
    if (!product) return NextResponse.json({ error: "Invalid productKey" }, { status: 400 });

    // Razorpay expects amounts in paise (integer). Use product.price as paise already.
    const amount = product.price;
    const currency = product.currency ?? "INR";

    // short receipt under 40 chars: u_<8chars>_<5digits>
    const rec = `u_${userId.slice(0, 8)}_${String(Date.now()).slice(-5)}`;
    const receipt = rec.slice(0, 40);

    // Create Razorpay order
    const order = await razor.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        productKey,
        userId,
      },
    });

    // Persist order record in DB (use schema fields)
    try {
      await prisma.order.create({
        data: {
          providerOrderId: order.id,
          userId,
          productId: product.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status ?? "created",
          metadata: { raw: order },
        },
      });
    } catch (err) {
      console.error("Failed to persist order record:", err);
      // don't block client — still return order to client for checkout
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      provider: "razorpay",
    });
  } catch (err: any) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
