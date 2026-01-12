// packages/domain/billing/entitlements.ts
import { prisma } from "@/lib/prisma";

export const LEGACY_ENTITLEMENTS = {}; 

type FeatureMap = Record<string, any>;

export interface UserEntitlements {
  userId: string;
  tierFallback?: string; 
  product?: {
    id: string;
    key: string;
    name: string;
    price?: number | null;
    currency?: string | null;
  } | null;
  features: FeatureMap;
  user: any; 
  productName: string;
  productKey: string;
}

export async function getActiveUserSubscription(userId: string) {
  return prisma.userSubscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
    },
    orderBy: { currentPeriodEnd: "desc" },
    include: {
      product: {
        include: {
          productFeatures: {
            include: {
              feature: true,
            },
          },
        },
      },
    },
  }).catch(() => null);
}

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const user = await prisma.user.findUnique({ 
    where: { id: userId }, 
    select: { id: true, tier: true, customAiLimit: true, aiUsageCount: true } 
  });
  
  if (!user) throw new Error("User not found");

  let product = null;
  let features: FeatureMap = {};

  const sub = await prisma.userSubscription.findFirst({
    where: { userId, status: { in: ["active", "trialing"] } },
    include: { product: { include: { productFeatures: { include: { feature: true } } } } },
    orderBy: { currentPeriodEnd: "desc" }
  });

  if (sub && sub.product) {
    product = sub.product;
  } 
  else {
    const freeProduct = await prisma.product.findUnique({
      where: { key: "FREE" },
      include: {
        productFeatures: { include: { feature: true } },
      },
    });

    if (freeProduct) {
      product = freeProduct;
    }
  }

  if (product && product.productFeatures) {
    for (const pf of product.productFeatures) {
      features[pf.feature.key] = pf.value ?? { enabled: true };
    }
  }

  return {
    userId,
    tierFallback: user.tier, 
    product: product ? {
      id: product.id,
      key: product.key,
      name: product.name,
      price: product.price ?? null,
      currency: product.currency ?? null,
    } : null,
    productName: product?.name || "Free Tier", 
    productKey: product?.key || "FREE",
    features,
    user
  };
}

/**
 * ✅ NEW: Get page access permissions
 */
export async function getPagePermissions(userId: string) {
  const ent = await getUserEntitlements(userId);
  const isFree = ent.productKey === 'FREE';

  // Helper: If feature exists, use its value. 
  // If missing: PAID users allow by default, FREE users block by default.
  const check = (key: string) => {
    const feat = ent.features[key];
    if (feat) {
      if (feat.enabled === false) return false;
      if (feat.value === false) return false;
      return true; 
    }
    if (isFree) return false; 
    return true; 
  };

  return {
    canViewDashboard: true,
    canViewSubscription: true,
    canViewPlans: check("ACCESS_PLANS"),
    canViewTasks: check("ACCESS_TASKS"),
    canViewChecklist: check("ACCESS_CHECKLIST"),
    canViewAnalytics: check("ACCESS_ANALYTICS"),
  };
}

export async function assertPlanCreationAllowed(userId: string) {
  const ent = await getUserEntitlements(userId);

  const maxPlansFeat = ent.features['MAX_PLANS'];
  let allowedLimit: number | typeof Infinity = 3; 

  if (maxPlansFeat) {
    if (typeof maxPlansFeat.limit === 'number') allowedLimit = maxPlansFeat.limit;
    else if (typeof maxPlansFeat.value === 'number') allowedLimit = maxPlansFeat.value;
    else if (maxPlansFeat === 'Infinity' || maxPlansFeat.limit === 'Infinity') allowedLimit = Infinity;
  } 
  else {
    if (ent.productKey.includes('PRO') || ent.productKey.includes('TEAM')) {
      allowedLimit = Infinity;
    }
  }

  if (allowedLimit === Infinity) return;

  const planCount = await prisma.plan.count({ where: { userId } });

  if (planCount >= (allowedLimit as number)) {
    const err: any = new Error("Plan limit reached. Upgrade to create more plans.");
    err.code = "ENTITLEMENT_LIMIT";
    throw err;
  }
}

export async function getMaxPlanDaysForUser(userId: string): Promise<number> {
  const ent = await getUserEntitlements(userId);
  const featureVal = ent.features['MAX_PLAN_DAYS'];
  if (featureVal) {
    if (typeof featureVal.value === 'number') return featureVal.value;
    if (typeof featureVal === 'number') return featureVal;
  }
  if (ent.productKey === 'FREE') return 7; 
  return 30; 
}

export async function incrementAIUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { aiUsageCount: { increment: 1 } }
  });
}

export async function getFeatureForUser(userId: string, featureKey: string): Promise<unknown> {
  const ent = await getUserEntitlements(userId);
  return ent.features?.[featureKey];
}

export async function getAIUsageStats(userId: string) {
  const ent = await getUserEntitlements(userId);
  const user = ent.user;

  if (user.customAiLimit !== null && user.customAiLimit !== undefined) {
    return {
      used: user.aiUsageCount,
      limit: user.customAiLimit,
      remaining: Math.max(0, user.customAiLimit - user.aiUsageCount)
    };
  }

  let limit = 0; 
  const limitFeature = ent.features['AI_GEN_LIMIT'];
  
  if (limitFeature) {
    if (typeof limitFeature.value === 'number') limit = limitFeature.value;
    else if (typeof limitFeature === 'number') limit = limitFeature;
  } 
  else if (ent.productKey === 'FREE') {
    limit = 5; 
  } else {
    limit = 100;
  }

  return {
    used: user.aiUsageCount,
    limit: limit,
    remaining: Math.max(0, limit - user.aiUsageCount)
  };
}

export async function canUseAIGenerationForUser(userId: string): Promise<boolean> {
  const stats = await getAIUsageStats(userId);
  return stats.used < stats.limit;
}