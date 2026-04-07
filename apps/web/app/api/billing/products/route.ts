// apps/web/app/api/billing/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
      include: {
        productFeatures: {
          include: { feature: true },
        },
      },
    });

    // Map features into a friendly shape
    const mapped = products.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      features: p.productFeatures.map((pf) => ({
        key: pf.feature.key,
        value: pf.value,
      })),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[billing/products]", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
