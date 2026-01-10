import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { cache } from "react";

// ... (Keep existing getDashboardCounts, getOrders, getRecentSales) ...

export const getDashboardCounts = cache(async () => {
  // ... (keep existing implementation)
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

export const getRecentSales = cache(async () => { return getOrders(5); });

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

/**
 * ✅ UPDATED: Fetch users with ROBUST subscription includes.
 * This fixes the "Badge defaulting to Free Tier" issue.
 */
export const getUsersWithSubscriptions = cache(async (limit = 50) => {
  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        // Match the logic in entitlements.ts (active OR trialing)
        where: { status: { in: ["active", "trialing"] } },
        take: 1,
        orderBy: { currentPeriodEnd: 'desc' },
        include: { 
          product: { 
            include: { 
              productFeatures: { include: { feature: true } } 
            } 
          } 
        } 
      },
      // Include custom limits
      habits: { select: { id: true } }, 
    },
  });
});

// ... (Keep ALL existing WRITE operations: createProduct, deleteProduct, etc.) ...
// Ensure you copy the 'upsert' based createProduct logic from previous steps if needed here.
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
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
}

export async function updateFeatureValue(productId: string, featureId: string, rawValue: string | number) {
  const numValue = parseInt(String(rawValue));
  if (isNaN(numValue)) return; 
  await prisma.productFeature.upsert({
    where: { productId_featureId: { productId, featureId } },
    create: { productId, featureId, value: { value: numValue, enabled: true } },
    update: { value: { value: numValue, enabled: true } },
  });
  revalidatePath(`/products/${productId}`);
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
  revalidatePath(`/products/${productId}`);
}

export async function createFeature(key: string, description: string) {
  await prisma.feature.create({ data: { key, description } });
  revalidatePath("/products");
}

export async function assignUserPlan(userId: string, productId: string) {
  // 1. Cancel existing
  await prisma.userSubscription.updateMany({
    where: { userId, status: { in: ["active", "trialing"] } },
    data: { status: "canceled", currentPeriodEnd: new Date() },
  });

  if (!productId || productId === "manual_free") {
    // Reset to "FREE" tier (Legacy field update)
    await prisma.user.update({ where: { id: userId }, data: { tier: "FREE" } });
    revalidatePath("/users");
    return;
  }

  // 2. Create new sub
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.userSubscription.create({
    data: {
      userId,
      productId,
      status: "active",
      provider: "manual_admin",
      startedAt: now,
      currentPeriodEnd: thirtyDays,
    },
  });

  // Legacy Tier sync
  let newTier = "FREE";
  if (product.key.toUpperCase().includes("PRO")) newTier = "PRO";
  if (product.key.toUpperCase().includes("TEAM")) newTier = "TEAM";

  await prisma.user.update({
    where: { id: userId },
    data: { tier: newTier as any },
  });

  revalidatePath("/users");
}

export async function updateUserRole(userId: string, role: string) {
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/users");
}