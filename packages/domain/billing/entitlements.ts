import { prisma } from "@gritorquit/db";

export type FeatureMap = Record<string, any>;

/**
 * ✅ Centralized Feature Keys
 * Prevents "Magic String" bugs between CMS and Web
 */
export enum PlanFeature {
  ACCESS_PLANS = "ACCESS_PLANS",
  ACCESS_TODAY = "ACCESS_TODAY",
  ACCESS_HABITS = "ACCESS_HABITS",
  ACCESS_STUDY = "ACCESS_STUDY",
  ACCESS_STUDY_YOUTUBE = "ACCESS_STUDY_YOUTUBE",
  ACCESS_STUDY_COURSE = "ACCESS_STUDY_COURSE",
  ACCESS_STUDY_PROJECT = "ACCESS_STUDY_PROJECT",
  ACCESS_ANALYTICS = "ACCESS_ANALYTICS",
  ACCESS_NOTES = "ACCESS_NOTES",
  
  // New Granular Toggles (C & D)
  ACCESS_SPACED_REPETITION = "ACCESS_SPACED_REPETITION",
  ACCESS_WEEKLY_REFLECTION = "ACCESS_WEEKLY_REFLECTION",
  ACCESS_DAILY_JOURNAL = "ACCESS_DAILY_JOURNAL",
  ACCESS_ADVANCED_ANALYTICS = "ACCESS_ADVANCED_ANALYTICS",
  
  AI_GEN_LIMIT = "AI_GEN_LIMIT",
  MAX_PLANS = "MAX_PLANS",
  MAX_PLAN_DAYS = "MAX_PLAN_DAYS",
  MAX_STUDY_YOUTUBE = "MAX_STUDY_YOUTUBE",
  MAX_STUDY_COURSES = "MAX_STUDY_COURSES",
  MAX_STUDY_PROJECTS = "MAX_STUDY_PROJECTS",
  
  // New Limits (C & D)
  MAX_VIDEOS_PER_PLAYLIST = "MAX_VIDEOS_PER_PLAYLIST",
  MAX_HABITS_TRACKED = "MAX_HABITS_TRACKED",
}

export interface OfflineConfig {
  enabled: boolean;
  localDbAllowed: boolean;
  maxDurationHours: number;
  tokenExpiryHours: number;
}

export interface UserEntitlements {
  userId: string;
  tierFallback?: string;
  product?: {
    id: string;
    key: string;
    name: string;
  } | null;
  features: FeatureMap;
  offlineConfig: OfflineConfig;
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
      offlineConfig: {
        enabled: false,
        localDbAllowed: false,
        maxDurationHours: 0,
        tokenExpiryHours: 0
      },
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
    offlineConfig: {
      enabled: product?.offlineEnabled ?? false,
      localDbAllowed: product?.localDbAllowed ?? false,
      maxDurationHours: product?.offlineMaxDuration ?? 24,
      tokenExpiryHours: product?.tokenExpiryDuration ?? 48
    },
    user: user,
  };
}

import { createHmac } from "crypto";

function getOfflineTokenSecret() {
  const secret = process.env.OFFLINE_TOKEN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "fallback-secret-for-dev";
  }

  throw new Error("OFFLINE_TOKEN_SECRET_MISSING");
}

export async function generateOfflineToken(userId: string, deviceId: string) {
  const entitlements = await fetchUserEntitlements(userId);
  if (!entitlements.offlineConfig.enabled) {
    throw new Error("OFFLINE_ACCESS_DISABLED");
  }

  const issuedAt = Date.now();
  const expiry = issuedAt + entitlements.offlineConfig.tokenExpiryHours * 60 * 60 * 1000;

  const payload = {
    uid: userId,
    pid: entitlements.product?.id,
    did: deviceId,
    iat: issuedAt,
    exp: expiry,
    dur: entitlements.offlineConfig.maxDurationHours,
    db: entitlements.offlineConfig.localDbAllowed
  };

  const secret = getOfflineTokenSecret();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Server-side check for feature access.
 * Throws an error if the user does not have access.
 */
export async function checkFeatureAccess(userId: string, feature: PlanFeature) {
  const ent = await fetchUserEntitlements(userId);
  const isFree = ent.productKey === 'FREE';
  const feat = ent.features[feature];

  let hasAccess = false;
  
  if (feat !== undefined) {
    if (feat === true) hasAccess = true;
    else if (typeof feat === 'object' && feat.enabled !== false) hasAccess = true;
  } else {
    // If missing from DB, Pro users get access by default, Free users don't
    hasAccess = !isFree;
  }

  if (!hasAccess) {
    throw new Error(`FEATURE_LOCKED: ${feature}`);
  }

  return ent;
}

/**
 * Server-side check for numeric limits.
 */
export async function getFeatureLimit(userId: string, feature: PlanFeature, fallbackFree: number, fallbackPro: number): Promise<number> {
  const ent = await fetchUserEntitlements(userId);
  const feat = ent.features[feature];
  
  if (feat !== undefined) {
    const val = typeof feat === 'object' ? (feat.value ?? feat.limit) : feat;
    return Number(val);
  }
  
  return ent.productKey === 'FREE' ? fallbackFree : fallbackPro;
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

  const hasStudyAccess = check(PlanFeature.ACCESS_STUDY);

  return {
    canViewDashboard: true,
    canViewSubscription: true,
    canViewPlans: check(PlanFeature.ACCESS_PLANS),
    canViewToday: check(PlanFeature.ACCESS_TODAY),
    canViewTasks: check(PlanFeature.ACCESS_TODAY), // Tasks are part of Today view
    canViewChecklist: check(PlanFeature.ACCESS_HABITS),
    canViewStudy: hasStudyAccess, 
    canViewYouTube: hasStudyAccess && check(PlanFeature.ACCESS_STUDY_YOUTUBE),
    canViewCourse: hasStudyAccess && check(PlanFeature.ACCESS_STUDY_COURSE),
    canViewProject: hasStudyAccess && check(PlanFeature.ACCESS_STUDY_PROJECT),
    canViewAnalytics: check(PlanFeature.ACCESS_ANALYTICS),
    canViewNotes: true, // check(PlanFeature.ACCESS_NOTES),
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
  const maxPlans = Number(ent.features[PlanFeature.MAX_PLANS]?.value ?? (ent.productKey === 'FREE' ? 1 : 100));

  const currentCount = await prisma.plan.count({
    where: { userId, isArchived: false }
  });

  if (currentCount >= maxPlans) {
    throw new Error(`Plan limit reached (${maxPlans}). Please upgrade to create more.`);
  }
}

export async function assertTrackCreationAllowed(userId: string, type: 'PLAYLIST' | 'COURSE' | 'PROJECT') {
  const ent = await fetchUserEntitlements(userId);
  
  let limitKey: PlanFeature;
  let label = '';
  
  if (type === 'PLAYLIST') { limitKey = PlanFeature.MAX_STUDY_YOUTUBE; label = 'YouTube Playlists'; }
  else if (type === 'COURSE') { limitKey = PlanFeature.MAX_STUDY_COURSES; label = 'Courses'; }
  else if (type === 'PROJECT') { limitKey = PlanFeature.MAX_STUDY_PROJECTS; label = 'Projects'; }
  else { return; } // Should not happen
  
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
  const featureVal = ent.features[PlanFeature.MAX_PLAN_DAYS];
  
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
  const limitFeature = ent.features[PlanFeature.AI_GEN_LIMIT];
  
  if (limitFeature) {
     // Handle cases where value is stored as raw number OR as JSON object { value: 50 }
     const val = typeof limitFeature === 'object' ? (limitFeature.value ?? limitFeature.limit) : limitFeature;
     limit = Number(val);
  } else {
     // ✅ Fallback only if strictly missing from DB
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

export async function getUserUsageStats(userId: string) {
  const ent = await fetchUserEntitlements(userId);
  const aiStats = await getAIUsageStats(userId);

  const [planCount, habitCount, trackCounts] = await Promise.all([
    prisma.plan.count({ where: { userId, isArchived: false } }),
    prisma.habit.count({ where: { userId, active: true } }),
    prisma.track.groupBy({
      by: ['type'],
      where: { userId },
      _count: true
    })
  ]);

  const tracks = {
    PLAYLIST: trackCounts.find(t => t.type === 'PLAYLIST')?._count ?? 0,
    COURSE: trackCounts.find(t => t.type === 'COURSE')?._count ?? 0,
    PROJECT: trackCounts.find(t => t.type === 'PROJECT')?._count ?? 0,
  };

  const getLimit = (key: PlanFeature, fallbackFree: number, fallbackPro: number) => {
    const feat = ent.features[key];
    if (feat !== undefined) {
      // Handle both raw values and JSON objects { value: X } or { limit: X }
      const val = typeof feat === 'object' ? (feat.value ?? feat.limit) : feat;
      const num = Number(val);
      return isNaN(num) ? (ent.productKey === 'FREE' ? fallbackFree : fallbackPro) : num;
    }
    // Hardcoded safety for FREE tier if not in DB
    return ent.productKey === 'FREE' ? fallbackFree : fallbackPro;
  };

  return {
    ai: aiStats,
    plans: {
      used: planCount,
      limit: getLimit(PlanFeature.MAX_PLANS, 1, 100),
    },
    habits: {
      used: habitCount,
      limit: getLimit(PlanFeature.MAX_HABITS_TRACKED, 3, 50),
    },
    study: {
      youtube: {
        used: tracks.PLAYLIST,
        limit: getLimit(PlanFeature.MAX_STUDY_YOUTUBE, 1, 50),
      },
      courses: {
        used: tracks.COURSE,
        limit: getLimit(PlanFeature.MAX_STUDY_COURSES, 1, 50),
      },
      projects: {
        used: tracks.PROJECT,
        limit: getLimit(PlanFeature.MAX_STUDY_PROJECTS, 1, 20),
      },
      videosPerPlaylist: {
        used: 0, // Not tracked per-user globally, but show limit
        limit: getLimit(PlanFeature.MAX_VIDEOS_PER_PLAYLIST, 10, 1000),
      }
    }
  };
}

export async function canUseAIGenerationForUser(userId: string): Promise<boolean> {
  const stats = await getAIUsageStats(userId);
  if (stats.limit === Infinity) return true;
  return stats.used < stats.limit;
}
