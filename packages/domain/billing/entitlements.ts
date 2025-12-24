// packages/domain/billing/entitlements.ts
import { prisma } from "@/lib/prisma";
import type { Tier } from "@prisma/client";

/**
 * Legacy static entitlements kept for migration fallback.
 */
export const LEGACY_ENTITLEMENTS: Record<Tier, {
  maxPlans: number | typeof Infinity;
  aiGeneration: boolean;
}> = {
  FREE: {
    maxPlans: 3,
    aiGeneration: false, 
  },
  PRO: {
    maxPlans: Infinity,
    aiGeneration: true,
  },
  TEAM: {
    maxPlans: Infinity,
    aiGeneration: true,
  },
};

type FeatureMap = Record<string, unknown>;

export interface UserEntitlements {
  userId: string;
  tierFallback?: Tier;
  product?: {
    id: string;
    key: string;
    name: string;
    price?: number | null;
    currency?: string | null;
  } | null;
  features: FeatureMap;
}

/**
 * Get active user subscription using the new UserSubscription model.
 */
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

/**
 * Build a resolved entitlements object for a user.
 */
export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, tier: true } });
  if (!user) throw new Error("User not found");

  const sub = await getActiveUserSubscription(userId);

  if (!sub || !sub.product) {
    const tier = user.tier as Tier;
    const legacy = LEGACY_ENTITLEMENTS[tier] ?? LEGACY_ENTITLEMENTS.FREE;
    const features: FeatureMap = {
      AI_PLAN: { enabled: legacy.aiGeneration },
      MAX_PLANS: { limit: legacy.maxPlans === Infinity ? Number.POSITIVE_INFINITY : (legacy.maxPlans as number) },
    };
    return {
      userId,
      tierFallback: tier,
      product: null,
      features,
    };
  }

  const product = sub.product;
  const features: FeatureMap = {};
  for (const pf of product.productFeatures ?? []) {
    // If value is a simple boolean or structured object, we store it
    features[pf.feature.key] = pf.value ?? { enabled: true };
  }

  return {
    userId,
    product: {
      id: product.id,
      key: product.key,
      name: product.name,
      price: product.price ?? null,
      currency: product.currency ?? null,
    },
    features,
  };
}

export async function assertPlanCreationAllowed(userId: string) {
  const ent = await getUserEntitlements(userId);

  const maxPlansVal = ent.features?.MAX_PLANS;
  let allowedLimit: number | typeof Infinity | null = null;

  if (maxPlansVal && typeof (maxPlansVal as any).limit !== "undefined") {
    const v = (maxPlansVal as any).limit;
    allowedLimit = v === "Infinity" || v === "infinite" ? Infinity : Number(v);
  }

  if (allowedLimit == null && ent.tierFallback) {
    const legacy = LEGACY_ENTITLEMENTS[ent.tierFallback];
    allowedLimit = legacy?.maxPlans ?? 0;
  }

  if (allowedLimit == null) {
    allowedLimit = 3; 
  }

  if (allowedLimit === Infinity) return;

  const planCount = await prisma.plan.count({ where: { userId } });

  if (planCount >= (allowedLimit as number)) {
    const err: any = new Error("Plan limit reached. Upgrade to create more plans.");
    err.code = "ENTITLEMENT_LIMIT";
    throw err;
  }
}

/**
 * Get the max days allowed for a single plan.
 */
export async function getMaxPlanDaysForUser(userId: string): Promise<number> {
  const ent = await getUserEntitlements(userId);
  
  // 1. Check Product Feature Configuration
  // Looks for feature key "MAX_PLAN_DAYS" with a value like { value: 30 }
  const featureVal = ent.features?.['MAX_PLAN_DAYS'] as any;
  if (featureVal && typeof featureVal.value === 'number') {
    return featureVal.value;
  }

  // 2. Fallback Defaults
  if (ent.tierFallback === 'FREE') return 7; // Free users capped at 7 days
  return 30; // Default pro cap
}

/**
 * Check if user can use AI generation with dynamic limits.
 */
export async function canUseAIGenerationForUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { id: true, tier: true, aiUsageCount: true } 
  });

  if (!user) return false;

  const ent = await getUserEntitlements(userId);

  // 1. Determine Limit
  let limit = 1; // Default Free limit

  // Check if product defines a specific limit via "AI_GEN_LIMIT" feature
  const limitFeature = ent.features?.['AI_GEN_LIMIT'] as any;
  
  if (limitFeature && typeof limitFeature.value === 'number') {
    limit = limitFeature.value;
  } else {
    // Legacy Fallback Checks
    // A. Check for simple enable flag
    const simpleAiFeature = ent.features?.['AI_PLAN'] as any;
    if (simpleAiFeature && simpleAiFeature.enabled === true) {
        // If simple enabled flag is present without specific limit, assume "Pro" behavior
        limit = 100; 
    }
    // B. Check Tier/Key Name
    else if (user.tier === 'PRO' || user.tier === 'TEAM' || ent.product?.key.toUpperCase().includes('PRO')) {
        limit = 100; // Legacy Pro limit
    }
  }

  // 2. Check Usage against Limit
  return user.aiUsageCount < limit;
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