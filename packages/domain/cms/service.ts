import { prisma } from "@planner/db";
import { revalidatePath } from "next/cache";

// --- READ OPERATIONS ---

export async function getDashboardCounts() {
  const [users, orders, activeSubscriptions, revenueResult] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.userSubscription.count({ where: { status: "active" } }),
    prisma.order.aggregate({ where: { status: "paid" }, _sum: { amount: true } })
  ]);
  return { users, orders, activeSubscriptions, totalRevenue: revenueResult._sum.amount || 0 };
};

export async function getOrders(limit = 100, skip = 0) {
  return prisma.order.findMany({
    take: limit,
    skip: skip,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, id: true } },
      product: { select: { name: true } },
    },
  });
};

export const getRecentSales = async () => { 
  return getOrders(5); 
};

export async function getAuditLogs(limit = 50, skip = 0) {
  return prisma.cmsAuditLog.findMany({
    take: limit,
    skip: skip,
    orderBy: { createdAt: "desc" }
  });
}

export const getProducts = async () => {
  return prisma.product.findMany({
    orderBy: { price: "asc" },
    include: { productFeatures: { include: { feature: true } } }
  });
};

export const getProductDetail = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { productFeatures: { include: { feature: true } } },
  });
};

export const getAllFeatures = async () => {
  return prisma.feature.findMany({ orderBy: { key: "asc" } });
};

export const getUsersWithSubscriptions = async (limit = 50, skip = 0, search?: string) => {
  return prisma.user.findMany({
    take: limit,
    skip: skip,
    where: search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { 
          profile: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        }
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      aiUsage: true, 
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        take: 1,
        orderBy: { currentPeriodEnd: 'desc' },
        include: { 
          product: {
            include: {
              productFeatures: {
                include: { feature: true }
              }
            }
          }
        } 
      },
      habits: { select: { id: true } }, 
    },
  });
};

// --- WRITE OPERATIONS ---

export async function createProduct(data: { name: string; key: string; priceRupees: number; description?: string }, adminId?: string) {
  const amount = Math.round(data.priceRupees * 100); 
  const product = await prisma.product.upsert({
    where: { key: data.key },
    create: {
      name: data.name,
      key: data.key,
      price: amount,
      description: data.description,
      currency: "INR",
      active: true,
    },
    update: {
      name: data.name,
      price: amount,
      description: data.description,
    },
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "CREATE",
      entityType: "PRODUCT",
      entityId: product.id,
      newValue: product,
      description: `Created/Updated product ${product.name}`
    });
  }
  return product;
}

export async function createAuditLog(data: {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
}) {
  return prisma.cmsAuditLog.create({
    data: {
      adminId: data.adminId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValue: data.oldValue,
      newValue: data.newValue,
      description: data.description,
    }
  });
}

export async function updateProductDetails(id: string, data: { 
  name?: string; 
  description?: string; 
  priceRupees?: number;
  featuresList?: string[];
  offlineEnabled?: boolean;
  localDbAllowed?: boolean;
  offlineMaxDuration?: number;
  tokenExpiryDuration?: number;
}, adminId?: string) {
  const oldProduct = await prisma.product.findUnique({ where: { id } });
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priceRupees !== undefined) updateData.price = Math.round(data.priceRupees * 100);
  if (data.featuresList !== undefined) updateData.featuresList = data.featuresList;
  if (data.offlineEnabled !== undefined) updateData.offlineEnabled = data.offlineEnabled;
  if (data.localDbAllowed !== undefined) updateData.localDbAllowed = data.localDbAllowed;
  if (data.offlineMaxDuration !== undefined) updateData.offlineMaxDuration = data.offlineMaxDuration;
  if (data.tokenExpiryDuration !== undefined) updateData.tokenExpiryDuration = data.tokenExpiryDuration;

  const newProduct = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "UPDATE",
      entityType: "PRODUCT",
      entityId: id,
      oldValue: oldProduct,
      newValue: newProduct,
      description: `Updated product details for ${newProduct.name}`
    });
  }

  return newProduct;
}

export async function deleteProduct(id: string, adminId?: string) {
  const hasSubs = await prisma.userSubscription.count({ where: { productId: id, status: "active" } });
  if (hasSubs > 0) throw new Error("Cannot delete product with active subscriptions.");
  
  const product = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });

  if (adminId && product) {
    await createAuditLog({
      adminId,
      action: "DELETE",
      entityType: "PRODUCT",
      entityId: id,
      oldValue: product,
      description: `Deleted product ${product.name}`
    });
  }
}

export async function updateFeatureValue(productId: string, featureId: string, rawValue: string | number, adminId?: string) {
  const numValue = Number(rawValue);
  if (isNaN(numValue)) return; 
  
  const oldPf = await prisma.productFeature.findUnique({
    where: { productId_featureId: { productId, featureId } }
  });

  const pf = await prisma.productFeature.upsert({
    where: { productId_featureId: { productId, featureId } },
    create: { productId, featureId, value: { value: numValue, enabled: true } },
    update: { value: { value: numValue, enabled: true } },
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "UPDATE_FEATURE",
      entityType: "PRODUCT_FEATURE",
      entityId: `${productId}:${featureId}`,
      oldValue: oldPf,
      newValue: pf,
      description: `Updated feature value for product ${productId}`
    });
  }
}

export async function toggleProductFeature(productId: string, featureId: string, isEnabled: boolean, adminId?: string) {
  if (isEnabled) {
    const pf = await prisma.productFeature.upsert({
      where: { productId_featureId: { productId, featureId } },
      create: { productId, featureId, value: { enabled: true } },
      update: { value: { enabled: true } },
    });

    if (adminId) {
        await createAuditLog({
          adminId,
          action: "TOGGLE_FEATURE_ON",
          entityType: "PRODUCT_FEATURE",
          entityId: `${productId}:${featureId}`,
          newValue: pf,
          description: `Enabled feature ${featureId} for product ${productId}`
        });
    }
  } else {
    await prisma.productFeature.deleteMany({ where: { productId, featureId } });
    
    if (adminId) {
        await createAuditLog({
          adminId,
          action: "TOGGLE_FEATURE_OFF",
          entityType: "PRODUCT_FEATURE",
          entityId: `${productId}:${featureId}`,
          description: `Disabled feature ${featureId} for product ${productId}`
        });
    }
  }
}

export async function createFeature(key: string, description: string, adminId?: string) {
  const feat = await prisma.feature.upsert({
    where: { key },
    create: { key, description },
    update: { description }
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "CREATE_SYSTEM_FEATURE",
      entityType: "FEATURE",
      entityId: feat.id,
      newValue: feat,
      description: `Created/Updated system feature ${key}`
    });
  }
}

export async function assignUserPlan(userId: string, productId: string | "manual_free", adminId?: string) {
  await prisma.userSubscription.updateMany({
    where: { userId, status: { in: ["active", "trialing"] } },
    data: { status: "canceled", currentPeriodEnd: new Date() },
  });

  if (productId === "manual_free") {
    await prisma.user.update({ where: { id: userId }, data: { tier: "Free Tier" } });
    
    if (adminId) {
        await createAuditLog({
          adminId,
          action: "ASSIGN_PLAN",
          entityType: "USER",
          entityId: userId,
          description: `Assigned FREE plan to user ${userId}`
        });
    }
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.userSubscription.create({
    data: {
      userId,
      productId,
      status: "active",
      provider: "admin_manual",
      startedAt: now,
      currentPeriodEnd: thirtyDays,
    },
  });

  await prisma.user.update({ 
    where: { id: userId }, 
    data: { tier: String(product.name ?? "Premium Plan") } 
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "ASSIGN_PLAN",
      entityType: "USER",
      entityId: userId,
      description: `Assigned plan ${product.name} to user ${userId}`
    });
  }
}

export async function updateUserRole(userId: string, role: string, adminId?: string) {
  if(role !== "admin" && role !== "user") return;
  const oldUser = await prisma.user.findUnique({ where: { id: userId } });
  const newUser = await prisma.user.update({ where: { id: userId }, data: { role: role as any } });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "UPDATE_ROLE",
      entityType: "USER",
      entityId: userId,
      oldValue: { role: oldUser?.role },
      newValue: { role: newUser.role },
      description: `Updated role for user ${userId} to ${role}`
    });
  }
}

export async function updateUserCustomLimit(userId: string, limit: number | null, adminId?: string) {
  const oldUser = await prisma.user.findUnique({ where: { id: userId } });
  const newUser = await prisma.user.update({
    where: { id: userId },
    data: { customAiLimit: limit },
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "UPDATE_AI_LIMIT",
      entityType: "USER",
      entityId: userId,
      oldValue: { limit: oldUser?.customAiLimit },
      newValue: { limit: newUser.customAiLimit },
      description: `Updated custom AI limit for user ${userId}`
    });
  }
}

export async function resetUserAIUsage(userId: string, adminId?: string) {
  await prisma.aiUsage.upsert({
    where: { userId },
    create: { userId, count: 0 },
    update: { count: 0 }
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "RESET_AI_USAGE",
      entityType: "USER",
      entityId: userId,
      description: `Reset AI usage for user ${userId}`
    });
  }
  
  revalidatePath("/users");
}

export async function removeProductFeature(productId: string, featureId: string, adminId?: string) {
  const res = await prisma.productFeature.delete({
    where: {
      productId_featureId: {
        productId,
        featureId,
      },
    },
  });

  if (adminId) {
    await createAuditLog({
      adminId,
      action: "REMOVE_FEATURE",
      entityType: "PRODUCT_FEATURE",
      entityId: `${productId}:${featureId}`,
      description: `Removed feature ${featureId} from product ${productId}`
    });
  }
  return res;
}