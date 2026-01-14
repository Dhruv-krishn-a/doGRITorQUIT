// apps/cms/app/(admin)/products/actions.ts
"use server";

import { cms } from "@domain";
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const featureValueSchema = z.object({
  productId: z.string(),
  featureId: z.string(),
  value: z.coerce.number(), 
});

// ✅ Renamed to match page import
export async function updateFeatureValue(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const parsed = featureValueSchema.safeParse({
    productId: formData.get("productId"),
    featureId: formData.get("featureId"),
    value: formData.get("value"),
  });

  if (!parsed.success) return;

  await cms.updateFeatureValue(parsed.data.productId, parsed.data.featureId, parsed.data.value);
  revalidatePath(`/products/${parsed.data.productId}`);
}

// ✅ Renamed to match page import
export async function toggleProductFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));
  
  // Logic: If we are calling this, we want to Enable it. 
  // If we wanted to remove it, we'd use removeProductFeature.
  await cms.toggleProductFeature(productId, featureId, true);
  
  revalidatePath(`/products/${productId}`);
}

// ✅ Added missing function
export async function removeProductFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));

  await cms.removeProductFeature(productId, featureId);
  revalidatePath(`/products/${productId}`);
}

export async function createSystemFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const key = String(formData.get("key"));
  const description = String(formData.get("description"));
  
  if (!key || !description) return;
  
  await cms.createFeature(key, description);
  revalidatePath("/products");
}

export async function createProductAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const name = String(formData.get("name"));
  const key = String(formData.get("key"));
  const price = Number(formData.get("price"));

  if (!name || !key || isNaN(price)) return;

  await cms.createProduct({
    name,
    key,
    priceRupees: price,
    description: "",
  });

  revalidatePath("/products");
}

export async function deleteProductAction(productId: string) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");
  await cms.deleteProduct(productId);
  revalidatePath("/products");
}