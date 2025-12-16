import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productKey } = body;

    if (!productKey) {
      return NextResponse.json({ error: "Missing productKey" }, { status: 400 });
    }

    // Load product from DB (CMS-controlled)
    const product = await prisma.product.findUnique({
      where: { key: productKey },
    });

    if (!product || !product.active) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: product.price * 100, // INR paise
      currency: product.currency,
      receipt: `user_${userId}_${Date.now()}`,
      notes: {
        userId,
        productKey: product.key,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
