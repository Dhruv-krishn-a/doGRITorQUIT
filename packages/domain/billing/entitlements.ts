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
    aiGeneration: false, // overridden by dynamic check below
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
  // We check the new UserSubscription table populated by the webhook
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
    // fallback to legacy tier if no active subscription found
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

  // Build feature map from product features
  const product = sub.product;
  const features: FeatureMap = {};
  for (const pf of product.productFeatures ?? []) {
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

/**
 * Assert plan creation allowed (throws "ENTITLEMENT_LIMIT" if not).
 * This was the missing export causing your build error.
 */
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

  // Default fallback if everything fails
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
 * Check if user can use AI generation.
 * Logic: Paid Plan OR Free Plan (Usage < 1)
 */
export async function canUseAIGenerationForUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { id: true, tier: true, aiUsageCount: true } 
  });

  if (!user) return false;

  // 1. Check Active Subscription features
  const sub = await getActiveUserSubscription(userId);
  if (sub && sub.product) {
    const aiFeature = sub.product.productFeatures.find(pf => pf.feature.key === 'AI_PLAN');
    if (aiFeature && (aiFeature.value as any)?.enabled === true) {
      return true;
    }
  }

  // 2. Fallback to Tier Logic
  // FREE users get exactly 1 generation
  if (user.tier === 'FREE') {
    return user.aiUsageCount < 1;
  }

  // PRO/TEAM always allowed
  if (user.tier === 'PRO' || user.tier === 'TEAM') return true;

  return false;
}

/**
 * Increment the AI usage counter for a user.
 */
export async function incrementAIUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { aiUsageCount: { increment: 1 } }
  });
}

/**
 * Generic get feature value
 */
export async function getFeatureForUser(userId: string, featureKey: string): Promise<unknown> {
  const ent = await getUserEntitlements(userId);
  return ent.features?.[featureKey];
}