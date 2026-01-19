import { prisma } from "@/lib/prisma";

/**
 * Limit Logic Helper
 * Priority:
 * 1. CMS Override (customAiLimit)
 * 2. Active Subscription (DB or Hardcoded)
 * 3. Free Tier
 */

export async function getUserLimits(userId: string) {
  // 1. Fetch User data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      // ✅ FIX 1: Fetch from the correct relation (aiUsage), not a flat field
      aiUsage: { select: { count: true } }, 
      customAiLimit: true,
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        take: 1,
        orderBy: { currentPeriodEnd: "desc" },
        include: {
          product: {
            // ✅ FIX 2: Explicitly include features so TS knows they exist
            include: {
              productFeatures: {
                include: { feature: true }
              }
            }
          },
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  // ✅ FIX 3: Safe usage access
  const usage = user.aiUsage?.count ?? 0;

  // ---------------------------------------------------------
  // 1. CHECK CMS OVERRIDE (Highest Priority)
  // ---------------------------------------------------------
  if (user.customAiLimit !== null) {
    const limit = user.customAiLimit;
    const isUnlimited = limit === -1; 
    
    return {
      limit: isUnlimited ? -1 : limit,
      usage: usage,
      remaining: isUnlimited ? 999999 : Math.max(0, limit - usage),
      isUnlimited: isUnlimited,
      source: "CMS_OVERRIDE",
    };
  }

  // ---------------------------------------------------------
  // 2. CHECK ACTIVE SUBSCRIPTION
  // ---------------------------------------------------------
  const activeSub = user.subscriptions[0];

  if (activeSub && activeSub.product) {
    let limit = 5; // Default fallback for paid plans
    let isUnlimited = false;

    // A. Check Product Features (The "Correct" DB Way)
    // Now strictly typed because of the 'include' above
    const limitFeature = activeSub.product.productFeatures.find(
      (pf) => pf.feature.key === "AI_GEN_LIMIT"
    );

    if (limitFeature) {
      // Handle Prisma JSON value safely
      const val = limitFeature.value;
      
      if (typeof val === 'number') {
        limit = val;
      } else if (typeof val === 'object' && val !== null) {
        // Handle { value: 100 } or { limit: 100 } structure
        const obj = val as Record<string, unknown>;
        if (typeof obj.value === 'number') limit = obj.value;
        else if (typeof obj.limit === 'number') limit = obj.limit;
      }
    } 
    // B. Simpler Fallback: Hardcoded Keys (Robustness)
    else {
      const pKey = activeSub.product.key;
      if (pKey === "PRO_MONTHLY") limit = 50;
      else if (pKey === "PRO_YEARLY") limit = 500;
      else if (pKey === "ENTERPRISE") isUnlimited = true;
    }

    return {
      limit: isUnlimited ? -1 : limit,
      usage: usage,
      remaining: isUnlimited ? 999999 : Math.max(0, limit - usage),
      isUnlimited: isUnlimited,
      source: `SUBSCRIPTION_${activeSub.product.key}`,
    };
  }

  // ---------------------------------------------------------
  // 3. FREE TIER (Fallback)
  // ---------------------------------------------------------
  const FREE_LIMIT = 5;
  
  return {
    limit: FREE_LIMIT,
    usage: usage,
    remaining: Math.max(0, FREE_LIMIT - usage),
    isUnlimited: false,
    source: "FREE_TIER",
  };
}