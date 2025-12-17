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

// Add this new function to your existing actions
export async function updateUserTier(userId: string, formData: FormData) {
  await getAdminUser(); // Security check
  
  // Cast to specific Tier type if needed, or string
  const tier = formData.get("tier") as "FREE" | "PRO" | "TEAM";
  
  await prisma.user.update({
    where: { id: userId },
    data: { tier }
  });
  
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
  const price = Number(formData.get("price")); // in paise
  const description = formData.get("description") as string;

  await prisma.product.create({
    data: { name, key, price, description, currency: "INR", active: true }
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