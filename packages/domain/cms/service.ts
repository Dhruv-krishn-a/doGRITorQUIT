// packages/domain/cms/service.ts
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { cache } from "react";


export const getDashboardCounts = cache(async () => {
  const [users, orders, activePlans, revenueResult] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.userSubscription.count({ where: { status: "active" } }),
    prisma.order.aggregate({ where: { status: "paid" }, _sum: { amount: true } })
  ]);
  return { users, orders, activePlans, totalRevenue: revenueResult._sum.amount || 0 };
});

export const getOrders = cache(async (limit = 100) => {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, id: true } },
      product: { select: { name: true } },
    },
  });
});

// ✅ ADDED: This was missing
export const getRecentSales = cache(async () => { 
  return getOrders(5); 
});

export const getProducts = cache(async () => {
  return prisma.product.findMany({
    orderBy: { price: "asc" },
    include: { productFeatures: { include: { feature: true } } }
  });
});

export const getProductDetail = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { productFeatures: { include: { feature: true } } },
  });
});

export const getAllFeatures = cache(async () => {
  return prisma.feature.findMany({ orderBy: { key: "asc" } });
});

export const getUsersWithSubscriptions = cache(async (limit = 50, search?: string) => {
  return prisma.user.findMany({
    take: limit,
    where: search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        take: 1,
        orderBy: { currentPeriodEnd: 'desc' },
        include: { product: true } 
      },
      habits: { select: { id: true } }, 
    },
  });
});

// --- WRITE OPERATIONS ---

export async function createProduct(data: { name: string; key: string; priceRupees: number; description?: string }) {
  const amount = Math.round(data.priceRupees * 100); 
  await prisma.product.upsert({
    where: { key: data.key },
    create: {
      name: data.name,
      key: data.key,
      price: amount,
      description: data.description,
      currency: "INR",
      active: true,
    },
    update: {
      name: data.name,
      price: amount,
      description: data.description,
    },
  });
}

export async function deleteProduct(id: string) {
  const hasSubs = await prisma.userSubscription.count({ where: { productId: id, status: "active" } });
  if (hasSubs > 0) throw new Error("Cannot delete product with active subscriptions.");
  
  await prisma.product.delete({ where: { id } });
}

export async function updateFeatureValue(productId: string, featureId: string, rawValue: string | number) {
  const numValue = Number(rawValue);
  if (isNaN(numValue)) return; 
  
  await prisma.productFeature.upsert({
    where: { productId_featureId: { productId, featureId } },
    create: { productId, featureId, value: { value: numValue, enabled: true } },
    update: { value: { value: numValue, enabled: true } },
  });
}

export async function toggleProductFeature(productId: string, featureId: string, isEnabled: boolean) {
  if (isEnabled) {
    await prisma.productFeature.upsert({
      where: { productId_featureId: { productId, featureId } },
      create: { productId, featureId, value: { enabled: true } },
      update: { value: { enabled: true } },
    });
  } else {
    await prisma.productFeature.deleteMany({ where: { productId, featureId } });
  }
}

export async function createFeature(key: string, description: string) {
  await prisma.feature.upsert({
    where: { key },
    create: { key, description },
    update: { description }
  });
}

export async function assignUserPlan(userId: string, productId: string | "manual_free") {
  await prisma.userSubscription.updateMany({
    where: { userId, status: { in: ["active", "trialing"] } },
    data: { status: "canceled", currentPeriodEnd: new Date() },
  });

  if (productId === "manual_free") {
    await prisma.user.update({ where: { id: userId }, data: { tier: "Free Tier" } });
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.userSubscription.create({
    data: {
      userId,
      productId,
      status: "active",
      provider: "admin_manual",
      startedAt: now,
      currentPeriodEnd: thirtyDays,
    },
  });

  await prisma.user.update({ where: { id: userId }, data: { tier: product.name } });
}

export async function updateUserRole(userId: string, role: string) {
  if(role !== "admin" && role !== "user") return;
  await prisma.user.update({ where: { id: userId }, data: { role } });
}