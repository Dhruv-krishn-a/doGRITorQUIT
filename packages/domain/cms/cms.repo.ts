// packages/domain/cms/cms.repo.ts
import { prisma } from "../../../lib/prisma"; // relative to package -> root/lib/prisma.ts

export async function findRecentOrders(limit = 100) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
    take: limit,
  });
}

export async function countEntities() {
  const [usersCount, ordersCount, productsCount] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
  ]);
  return { usersCount, ordersCount, productsCount };
}

export async function findRecentSales(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}

/* Products & Features */
export async function findAllProducts() {
  return prisma.product.findMany({ orderBy: { price: "asc" } });
}

export async function findProductWithFeatures(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: { productFeatures: { include: { feature: true } } },
  });
}

export async function findAllFeatures() {
  return prisma.feature.findMany();
}

export async function createProductDb(data: {
  name: string;
  key: string;
  priceInPaise: number;
  description?: string | null;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      key: data.key,
      price: data.priceInPaise,
      description: data.description ?? null,
      currency: "INR",
      active: true,
    },
  });
}

export async function deleteProductDb(productId: string) {
  return prisma.product.delete({ where: { id: productId } });
}

/* Users */
export async function findUsersWithActiveSubscriptions(limit = 50) {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      subscriptions: {
        where: { status: "active" },
        take: 1,
        include: { product: true },
      },
    },
  });
}

/* Subscriptions / features */
export async function upsertFeature(key: string, description: string) {
  return prisma.feature.upsert({
    where: { key },
    update: { description },
    create: { key, description },
  });
}

export async function upsertProductFeature(productId: string, featureId: string, value: any = { enabled: true }) {
  return prisma.productFeature.upsert({
    where: { productId_featureId: { productId, featureId } },
    update: { value },
    create: { productId, featureId, value },
  });
}

export async function deleteProductFeature(productId: string, featureId: string) {
  return prisma.productFeature.deleteMany({ where: { productId, featureId } });
}

export async function updateProductFeatureValue(productId: string, featureId: string, valueObj: any) {
  return prisma.productFeature.update({
    where: { productId_featureId: { productId, featureId } },
    data: { value: valueObj },
  });
}

/* Admin user helpers */
export async function setUserTier(userId: string, tier: "FREE" | "PRO" | "TEAM") {
  return prisma.user.update({ where: { id: userId }, data: { tier } });
}

export async function cancelActiveSubscriptions(userId: string) {
  return prisma.userSubscription.updateMany({
    where: { userId, status: "active" },
    data: { status: "canceled" },
  });
}

export async function createSubscriptionGrant(userId: string, productId: string) {
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return prisma.userSubscription.create({
    data: {
      userId,
      productId,
      status: "active",
      startedAt: now,
      currentPeriodEnd: thirtyDays,
      provider: "manual_cms_grant",
      providerSubId: `grant_${Date.now()}`,
    },
  });
}

export async function resetUserAIUsage(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { aiUsageCount: 0 },
  });
}

export async function updateUserRoleDb(userId: string, role: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}
