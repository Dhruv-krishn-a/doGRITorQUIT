// apps/cms/app/(admin)/products/actions.ts
"use server";

import { getAdminUser } from "@/lib/auth";
import { cms } from "@domain"; // Import cms namespace from domain
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  key: z.string().min(1, "Key is required").regex(/^[A-Z0-9_]+$/, "Key must be UPPERCASE_WITH_UNDERSCORES"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  description: z.string().optional(),
});

// --- Product Actions ---

export async function createProductAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized: Admin access required");

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
    price: formData.get("price"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    console.error("Validation Error:", parsed.error);
    return;
  }

  await cms.createProduct({
    name: parsed.data.name,
    key: parsed.data.key,
    priceRupees: parsed.data.price,
    description: parsed.data.description,
  });

  revalidatePath("/products");
}

export async function deleteProductAction(productId: string) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  await cms.deleteProduct(productId);
  revalidatePath("/products");
}

// --- Feature Actions ---

/**
 * Creates a new System Feature Definition (e.g. AI_GEN_LIMIT)
 */
export async function createSystemFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");
  
  const key = String(formData.get("key"));
  const description = String(formData.get("description"));
  
  await cms.createFeature(key, description);
  revalidatePath("/products"); // Refresh all product pages potentially
}

/**
 * Adds a feature to the product (Enables it)
 */
export async function toggleProductFeature(formData: FormData) {
  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));
  
  // We use "toggle" in the service, passing true adds it
  await cms.toggleProductFeature(productId, featureId, true);
  revalidatePath(`/products/${productId}`);
}

/**
 * Removes a feature from the product (Disables/Locks it)
 */
export async function removeProductFeature(formData: FormData) {
  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));
  
  // Passing false removes it
  await cms.toggleProductFeature(productId, featureId, false);
  revalidatePath(`/products/${productId}`);
}

/**
 * Updates a numeric value (e.g. Max Plans = 10)
 */
export async function updateFeatureValue(formData: FormData) {
  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));
  const value = formData.get("value");
  
  if (value) {
    await cms.updateFeatureValue(productId, featureId, value.toString());
  }
  revalidatePath(`/products/${productId}`);
}