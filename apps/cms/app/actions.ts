// apps/cms/app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- USER ACTIONS ---

export async function resetUserAI(userId: string) {
  await getAdminUser(); // Security check
  await prisma.user.update({
    where: { id: userId },
    data: { aiUsageCount: 0 }
  });
  revalidatePath("/users");
}

export async function assignUserPlan(userId: string, formData: FormData) {
  await getAdminUser(); // Security check

  const productId = formData.get("productId") as string;

  if (!productId || productId === "manual_free") {
    // Case: Remove Subscription (downgrade to free tier explicitly)
    await prisma.userSubscription.updateMany({
      where: { userId, status: "active" },
      data: { status: "canceled", currentPeriodEnd: new Date() }
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: { tier: "FREE" }
    });
  } else {
    // Case: Assign a specific Product
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    // 1. Cancel existing active subscriptions
    await prisma.userSubscription.updateMany({
      where: { userId, status: "active" },
      data: { status: "canceled" }
    });

    // 2. Create new active subscription
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days grant

    await prisma.userSubscription.create({
      data: {
        userId,
        productId: product.id,
        status: "active",
        startedAt: now,
        currentPeriodEnd: thirtyDays,
        provider: "manual_cms_grant", // Mark as admin granted
        providerSubId: `grant_${Date.now()}`,
      }
    });

    // 3. Update User Badge (Legacy Support)
    let newTier: "FREE" | "PRO" | "TEAM" = "FREE";
    const key = product.key.toUpperCase();
    if (key.includes("PRO")) newTier = "PRO";
    else if (key.includes("TEAM")) newTier = "TEAM";

    await prisma.user.update({
      where: { id: userId },
      data: { tier: newTier }
    });
  }

  revalidatePath("/users");
}

export async function updateUserRole(userId: string, formData: FormData) {
  await getAdminUser();
  const role = formData.get("role") as string;
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  revalidatePath("/users");
}

// --- PRODUCT/PLAN ACTIONS ---

export async function createProduct(formData: FormData) {
  await getAdminUser();
  
  const name = formData.get("name") as string;
  const key = formData.get("key") as string;
  const rawPrice = Number(formData.get("price")); // User enters Rupees (e.g. 199)
  const description = formData.get("description") as string;

  // CONVERSION: Rupees -> Paise
  const priceInPaise = Math.round(rawPrice * 100); 

  await prisma.product.create({
    data: { 
      name, 
      key, 
      price: priceInPaise, // Store as 19900
      description, 
      currency: "INR", 
      active: true 
    }
  });
  
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  await getAdminUser();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/products");
}

// --- FEATURE ACTIONS ---

export async function createFeature(formData: FormData) {
  await getAdminUser();
  const key = formData.get("key") as string;
  const description = formData.get("description") as string;

  await prisma.feature.upsert({
    where: { key },
    update: { description },
    create: { key, description }
  });
  revalidatePath("/products/[id]");
}

export async function updateFeatureValue(productId: string, featureId: string, formData: FormData) {
  await getAdminUser();
  const rawValue = formData.get("value");
  const numValue = parseInt(rawValue as string);

  if (isNaN(numValue)) return;

  // Store as structured JSON: { value: 10, enabled: true }
  await prisma.productFeature.update({
    where: { productId_featureId: { productId, featureId } },
    data: { 
      value: { value: numValue, enabled: true } 
    }
  });
  
  revalidatePath(`/products/${productId}`);
}

export async function toggleProductFeature(productId: string, featureId: string, isEnabled: boolean) {
  await getAdminUser();
  
  if (isEnabled) {
    // Enable (Create/Update link)
    await prisma.productFeature.upsert({
      where: { productId_featureId: { productId, featureId } },
      update: { value: { enabled: true } },
      create: { productId, featureId, value: { enabled: true } }
    });
  } else {
    // Disable (Remove link)
    await prisma.productFeature.deleteMany({
      where: { productId, featureId }
    });
  }
  revalidatePath(`/products/${productId}`);
}