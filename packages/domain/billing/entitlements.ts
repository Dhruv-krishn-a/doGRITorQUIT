import { prisma } from "@/lib/prisma";
import { Tier } from "@prisma/client";

export const ENTITLEMENTS: Record<Tier, {
  maxPlans: number;
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

export async function getUserTier(userId: string): Promise<Tier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  return user?.tier ?? Tier.FREE;
}

export async function assertPlanCreationAllowed(userId: string) {
  const tier = await getUserTier(userId);
  const entitlement = ENTITLEMENTS[tier];

  if (entitlement.maxPlans === Infinity) return;

  const planCount = await prisma.plan.count({
    where: { userId },
  });

  if (planCount >= entitlement.maxPlans) {
    const err: any = new Error(
      "Free plan limit reached. Upgrade to create more plans."
    );
    err.code = "ENTITLEMENT_LIMIT";
    throw err;
  }
}

export function canUseAIGeneration(tier: Tier) {
  return ENTITLEMENTS[tier].aiGeneration;
}
