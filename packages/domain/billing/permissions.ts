import { prisma } from "@gritorquit/db";

// Default limits for users with NO subscription
const FALLBACK_FREE_CONFIG = {
  canSync: false,
  maxTasks: 50,
  localStorage: true,
};

export async function getUserSyncPermission(userId: string) {
  // 1. Query the CORRECT model: userSubscription
  const activeSub = await prisma.userSubscription.findFirst({
    where: {
      userId: userId,
      status: { in: ["active", "trialing"] },
    },
    include: {
      product: {
        include: {
          productFeatures: {
            include: {
              feature: true, // Gets the key like "SYNC_ENABLED"
            },
          },
        },
      },
    },
  });

  // 2. Validate Subscription AND Product existence
  if (!activeSub || !activeSub.product) {
    return FALLBACK_FREE_CONFIG;
  }

  // 3. Extract Features safely
  const features = activeSub.product.productFeatures;

  // 4. Helper to find value by key
  const getFeatureValue = (key: string) => {
    // Explicitly check for the feature existence
    const feat = features.find((f) => f.feature.key === key);
    
    // Handle Prisma JSON type safely
    if (!feat || !feat.value) return null;
    
    // Cast JSON to expected type (primitive or object)
    return feat.value as string | number | boolean;
  };

  const canSyncValue = getFeatureValue("SYNC_ENABLED");
  const maxTasksValue = getFeatureValue("MAX_TASKS");

  return {
    // Check if the DB value is explicitly true
    canSync: canSyncValue === true || canSyncValue === "true",
    
    // Parse the number, default to free limit if missing
    maxTasks: typeof maxTasksValue === 'number' 
      ? maxTasksValue 
      : FALLBACK_FREE_CONFIG.maxTasks,
      
    localStorage: true, // Always true
  };
}