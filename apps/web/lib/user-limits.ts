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
      aiUsageCount: true,
      customAiLimit: true, // ✅ Must exist in schema
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        take: 1,
        orderBy: { currentPeriodEnd: "desc" },
        include: {
          product: true, // Fetch product details
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  const usage = user.aiUsageCount || 0;

  // ---------------------------------------------------------
  // 1. CHECK CMS OVERRIDE (Highest Priority)
  // ---------------------------------------------------------
  if (user.customAiLimit !== null) {
    const limit = user.customAiLimit;
    // Assuming -1 means Unlimited in your CMS
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
    let limit = 5; // Fallback
    let isUnlimited = false;

    // A. Check for "productFeatures" if your schema uses it (Advanced)
    // Note: We cast to 'any' to prevent TS errors if you haven't generated types yet
    const productAny = activeSub.product as any;
    
    if (productAny.productFeatures?.length > 0) {
       // ... Logic to extract feature limit would go here
    }

    // B. Simpler Fallback: Check hardcoded keys (Robust)
    // This ensures it works even if your DB 'Feature' tables are empty
    const pKey = activeSub.product.key;
    
    if (pKey === "PRO_MONTHLY") limit = 50;
    else if (pKey === "PRO_YEARLY") limit = 500;
    else if (pKey === "ENTERPRISE") isUnlimited = true;
    
    // C. Check direct DB field if you added 'aiLimit' to Product model
    if (typeof productAny.aiLimit === 'number') {
        limit = productAny.aiLimit;
        if (limit === -1) isUnlimited = true;
    }

    return {
      limit: isUnlimited ? -1 : limit,
      usage: usage,
      remaining: isUnlimited ? 999999 : Math.max(0, limit - usage),
      isUnlimited: isUnlimited,
      source: `SUBSCRIPTION_${pKey}`,
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