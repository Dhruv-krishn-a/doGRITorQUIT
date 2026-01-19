import { prisma } from "@planner/db";

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

export async function fetchUserEntitlements(userId: string): Promise<UserEntitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true, 
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        orderBy: { currentPeriodEnd: "desc" },
        take: 1,
        include: {
          product: {
            include: {
              productFeatures: { include: { feature: true } }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.warn(`[Entitlements] User ${userId} authenticated but not found in DB.`);
    return {
      userId,
      tierFallback: "Free",
      product: null,
      productName: "Free Tier",
      productKey: "FREE",
      features: {},
      user: { 
        id: userId, 
        email: "", 
        name: "Guest", 
        avatarUrl: null 
      }
    };
  }

  // 1. Determine Active Product
  let product = null;
  const activeSub = user.subscriptions[0];

  if (activeSub && activeSub.product) {
    product = activeSub.product;
  } else {
    // Fallback to Free Tier if no subscription
    const freeProduct = await prisma.product.findUnique({
      where: { key: "FREE" },
      include: {
        productFeatures: { include: { feature: true } },
      },
    });
    if (freeProduct) product = freeProduct;
  }

  // 2. Build Feature Map
  const features: FeatureMap = {};
  if (product && product.productFeatures) {
    for (const pf of product.productFeatures) {
      // ✅ FIX: Force key to be a string to avoid 'Date cannot be used as index' error
      const key = String(pf.feature.key);
      features[key] = pf.value ?? { enabled: true };
    }
  }

  return {
    userId,
    // ✅ FIX: Safe access for tier
    tierFallback: user.tier ? String(user.tier) : undefined,
    product: product ? {
      id: String(product.id),
      key: String(product.key),
      name: String(product.name ?? "Unknown Plan"),
      price: typeof product.price === 'number' ? product.price : 0, 
      currency: product.currency ? String(product.currency) : "INR",
    } : null,
    // ✅ FIX: Safe access for name/key
    productName: product?.name ? String(product.name) : "Free Tier",
    productKey: product?.key ? String(product.key) : "FREE",
    features,
    user: {
      ...user,
      name: user.profile?.name ?? "User",
      avatarUrl: user.profile?.avatarUrl
    }
  };
}

export async function getPagePermissions(userId: string) {
  const ent = await fetchUserEntitlements(userId);
  const isFree = ent.productKey === 'FREE';

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
    canViewPlans: check("ACCESS_TASKS") || check("ACCESS_PLANS"),
    canViewTasks: check("ACCESS_TASKS"),
    canViewChecklist: true,
    canViewAnalytics: check("ACCESS_ANALYTICS"),
  };
}

export async function getActiveUserSubscription(userId: string) {
  return prisma.userSubscription.findFirst({
    where: { userId, status: { in: ["active", "trialing"] } },
    orderBy: { currentPeriodEnd: "desc" },
    include: { product: { include: { productFeatures: { include: { feature: true } } } } },
  }).catch(() => null);
}

export async function assertPlanCreationAllowed(userId: string) {
  const ent = await fetchUserEntitlements(userId);
  const maxPlans = Number(ent.features['MAX_PLANS']?.value ?? 1);

  const currentCount = await prisma.plan.count({
    where: { userId, isArchived: false }
  });

  if (currentCount >= maxPlans) {
    throw new Error(`Plan limit reached (${maxPlans}). Please upgrade to create more.`);
  }
}

export async function getMaxPlanDaysForUser(userId: string): Promise<number> {
  const ent = await fetchUserEntitlements(userId);
  const featureVal = ent.features['MAX_PLAN_DAYS'];
  
  if (featureVal) {
    if (typeof featureVal.value === 'number') return featureVal.value;
    if (typeof featureVal === 'number') return featureVal;
  }
  
  if (ent.productKey === 'FREE') return 7;
  return 30;
}

export async function incrementAIUsage(userId: string) {
  await prisma.aiUsage.upsert({
    where: { userId },
    create: { userId, count: 1 },
    update: { count: { increment: 1 } }
  });

  await prisma.aiUsageLog.create({
    data: {
      userId,
      delta: 1
    }
  });
}

export async function getFeatureForUser(userId: string, featureKey: string): Promise<unknown> {
  const ent = await fetchUserEntitlements(userId);
  return ent.features?.[featureKey];
}

export async function getAIUsageStats(userId: string) {
  const ent = await fetchUserEntitlements(userId);
  
  const freshUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      customAiLimit: true,
      aiUsage: { select: { count: true } }
    }
  });
  
  const usageCount = freshUser?.aiUsage?.count ?? 0;
  const customLimit = freshUser?.customAiLimit;

  if (customLimit !== null && customLimit !== undefined) {
    return {
      used: usageCount,
      limit: Number(customLimit),
      remaining: Math.max(0, Number(customLimit) - usageCount)
    };
  }

  let limit = 0; 
  const limitFeature = ent.features['AI_GEN_LIMIT'];
  
  if (limitFeature) {
    if (typeof limitFeature.value === 'number') limit = limitFeature.value;
    else if (typeof limitFeature === 'number') limit = limitFeature;
    else if (limitFeature.limit) limit = limitFeature.limit;
  } else if (ent.productKey === 'FREE') {
    limit = 5; 
  } else {
    limit = 100;
  }

  return {
    used: usageCount,
    limit: limit,
    remaining: Math.max(0, limit - usageCount)
  };
}

export async function canUseAIGenerationForUser(userId: string): Promise<boolean> {
  const stats = await getAIUsageStats(userId);
  if (stats.limit === Infinity) return true;
  if (stats.used >= stats.limit) return false;
  return true;
}