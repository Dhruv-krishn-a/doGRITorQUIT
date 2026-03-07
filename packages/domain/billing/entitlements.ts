import { prisma } from "@planner/db";

export type FeatureMap = Record<string, any>;

export interface UserEntitlements {
  userId: string;
  tierFallback?: string;
  product?: {
    id: string;
    key: string;
    name: string;
  } | null;
  features: FeatureMap;
  productName: string;
  productKey: string;
  user: any;
}

export async function fetchUserEntitlements(userId: string): Promise<UserEntitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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
    return {
      userId,
      tierFallback: "Free",
      product: null,
      productName: "Free Tier",
      productKey: "FREE",
      features: {},
      user: null,
    };
  }

  // ✅ FIX: Type as 'any' to prevent Prisma Type Mismatch errors 
  let product: any = user.subscriptions[0]?.product || null;

  if (!product) {
    // Fallback: Load the "FREE" plan configuration from DB
    product = await prisma.product.findFirst({
      where: { key: { equals: "FREE", mode: 'insensitive' } },
      include: { productFeatures: { include: { feature: true } } }
    });
  }

  // 2. Build Feature Map
  const features: FeatureMap = {};
  if (product?.productFeatures) {
    product.productFeatures.forEach((pf: any) => {
      const key = String(pf.feature.key);
      features[key] = pf.value ?? true;
    });
  }

  const productKey = product?.key ? String(product.key).toUpperCase() : "FREE";

  return {
    userId,
    tierFallback: user.tier ? String(user.tier) : "Free",
    product: product ? {
      id: String(product.id),
      key: productKey,
      name: String(product.name),
    } : null,
    productName: product?.name ? String(product.name) : "Free Tier",
    productKey,
    features,
    user: user,
  };
}

export async function getPagePermissions(userId: string) {
  const ent = await fetchUserEntitlements(userId);
  const isFree = ent.productKey.toUpperCase() === 'FREE';

  // The Gatekeeper
  const check = (key: string) => {
    const feat = ent.features[key];

    // 1. If explicitly present in DB -> Obey DB
    if (feat !== undefined) {
      if (feat === false) return false;
      if (typeof feat === 'object' && feat.enabled === false) return false;
      return true;
    }

    // 2. If MISSING -> Block for Free, Allow for Pro
    if (isFree) return false; 
    return true; 
  };

  const hasStudyAccess = check("ACCESS_STUDY");

  return {
    canViewDashboard: true,
    canViewSubscription: true,
    canViewPlans: check("ACCESS_PLANS"),
    canViewToday: check("ACCESS_TODAY"),
    canViewTasks: check("ACCESS_TASKS") || check("ACCESS_TODAY"), // Backward compatibility
    canViewChecklist: check("ACCESS_HABITS"),
    canViewStudy: hasStudyAccess, 
    canViewYouTube: hasStudyAccess && check("ACCESS_STUDY_YOUTUBE"),
    canViewCourse: hasStudyAccess && check("ACCESS_STUDY_COURSE"),
    canViewProject: hasStudyAccess && check("ACCESS_STUDY_PROJECT"),
    canViewAnalytics: check("ACCESS_ANALYTICS"),
  };
}

// --- Helper Functions ---

export async function getActiveUserSubscription(userId: string) {
  return prisma.userSubscription.findFirst({
    where: { userId, status: { in: ["active", "trialing"] } },
    orderBy: { currentPeriodEnd: "desc" },
    include: { product: { include: { productFeatures: { include: { feature: true } } } } },
  }).catch(() => null);
}

export async function assertPlanCreationAllowed(userId: string) {
  const ent = await fetchUserEntitlements(userId);
  const maxPlans = Number(ent.features['MAX_PLANS']?.value ?? (ent.productKey === 'FREE' ? 1 : 100));

  const currentCount = await prisma.plan.count({
    where: { userId, isArchived: false }
  });

  if (currentCount >= maxPlans) {
    throw new Error(`Plan limit reached (${maxPlans}). Please upgrade to create more.`);
  }
}

export async function assertTrackCreationAllowed(userId: string, type: 'PLAYLIST' | 'COURSE' | 'PROJECT') {
  const ent = await fetchUserEntitlements(userId);
  
  let limitKey = '';
  let label = '';
  
  if (type === 'PLAYLIST') { limitKey = 'MAX_STUDY_YOUTUBE'; label = 'YouTube Playlists'; }
  else if (type === 'COURSE') { limitKey = 'MAX_STUDY_COURSES'; label = 'Courses'; }
  else if (type === 'PROJECT') { limitKey = 'MAX_STUDY_PROJECTS'; label = 'Projects'; }
  
  const limit = Number(ent.features[limitKey]?.value ?? (ent.productKey === 'FREE' ? 1 : 100));
  
  const currentCount = await prisma.track.count({
    where: { userId, type }
  });

  if (currentCount >= limit) {
    throw new Error(`${label} limit reached (${limit}). Please upgrade your plan.`);
  }
}

export async function getMaxPlanDaysForUser(userId: string): Promise<number> {
  const ent = await fetchUserEntitlements(userId);
  const featureVal = ent.features['MAX_PLAN_DAYS'];
  
  if (featureVal) {
    const val = typeof featureVal === 'object' ? featureVal.value : featureVal;
    return Number(val) || 30;
  }
  
  if (ent.productKey.toUpperCase() === 'FREE') return 7;
  return 30;
}

export async function incrementAIUsage(userId: string) {
  await prisma.aiUsage.upsert({
    where: { userId },
    create: { userId, count: 1 },
    update: { count: { increment: 1 } }
  });
  await prisma.aiUsageLog.create({ data: { userId, delta: 1 } });
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
  
  // 1. Check for User-Specific Override (Database)
  if (freshUser?.customAiLimit != null) {
    return {
      used: usageCount,
      limit: Number(freshUser.customAiLimit),
      remaining: Math.max(0, Number(freshUser.customAiLimit) - usageCount)
    };
  }

  // 2. Check for Plan-Specific Limit (Database)
  // This value comes from the CMS (productFeatures table)
  let limit = 0; 
  const limitFeature = ent.features['AI_GEN_LIMIT'];
  
  if (limitFeature) {
     // Handle cases where value is stored as raw number OR as JSON object { value: 50 }
     const val = typeof limitFeature === 'object' ? (limitFeature.value ?? limitFeature.limit) : limitFeature;
     limit = Number(val);
  } else {
     // ✅ Fallback only if strictly missing from DB
     // If you deleted the key from the Free plan, this will run.
     // Defaulting to 5 as a safe 'starter' limit if nothing is configured.
     limit = 5; 
  }

  // Ensure limit is a valid number, fallback to 0 if NaN
  if (isNaN(limit)) limit = 0;

  return {
    used: usageCount,
    limit: limit,
    remaining: Math.max(0, limit - usageCount)
  };
}

export async function canUseAIGenerationForUser(userId: string): Promise<boolean> {
  const stats = await getAIUsageStats(userId);
  if (stats.limit === Infinity) return true;
  return stats.used < stats.limit;
}