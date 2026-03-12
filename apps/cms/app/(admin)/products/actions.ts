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

export async function updateFeatureValue(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const parsed = featureValueSchema.safeParse({
    productId: formData.get("productId"),
    featureId: formData.get("featureId"),
    value: formData.get("value"),
  });

  if (!parsed.success) return;

  await cms.updateFeatureValue(parsed.data.productId, parsed.data.featureId, parsed.data.value, admin.id);
  revalidatePath(`/products/${parsed.data.productId}`);
}

export async function toggleProductFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const productId = String(formData.get("productId"));
  let featureId = formData.get("featureId") ? String(formData.get("featureId")) : null;
  const key = formData.get("key") ? String(formData.get("key")) : null;
  const description = formData.get("description") ? String(formData.get("description")) : "System feature";

  if (!featureId && key) {
    await cms.createFeature(key, description, admin.id);
    const allFeatures = await cms.getAllFeatures();
    const created = allFeatures.find(f => f.key === key);
    if (created) featureId = String(created.id);
  }

  if (!featureId) throw new Error("Feature ID or Key required");
  
  await cms.toggleProductFeature(productId, featureId, true, admin.id);
  revalidatePath(`/products/${productId}`);
}

export async function removeProductFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));

  await cms.removeProductFeature(productId, featureId, admin.id);
  revalidatePath(`/products/${productId}`);
}

export async function createSystemFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Unauthorized" };

  const key = String(formData.get("key"));
  const description = String(formData.get("description"));
  
  if (!key || !description) return { success: false, error: "Missing required fields" };
  
  try {
    await cms.createFeature(key, description, admin.id);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create feature" };
  }
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
  }, admin.id);

  revalidatePath("/products");
}

export async function updateProductDetailsAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Unauthorized" };

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const description = String(formData.get("description"));
  const priceInput = formData.get("price");
  const priceRupees = Number(priceInput);

  if (isNaN(priceRupees) || priceRupees < 0) {
    return { success: false, error: "Invalid price" };
  }

  const featuresListRaw = String(formData.get("featuresList") || "");
  const featuresList = featuresListRaw
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);

  const offlineEnabled = formData.get("offlineEnabled") === "on" || formData.get("offlineEnabled") === "true";
  const localDbAllowed = formData.get("localDbAllowed") === "on" || formData.get("localDbAllowed") === "true";
  const offlineMaxDuration = Number(formData.get("offlineMaxDuration") || 24);
  const tokenExpiryDuration = Number(formData.get("tokenExpiryDuration") || 48);

  try {
    await cms.updateProductDetails(id, {
      name,
      description,
      priceRupees,
      featuresList,
      offlineEnabled,
      localDbAllowed,
      offlineMaxDuration,
      tokenExpiryDuration
    }, admin.id);

    revalidatePath(`/products/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product details" };
  }
}

export async function deleteProductAction(productId: string) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const product = await cms.getProductDetail(productId);
  if (!product) return;

  const key = String(product.key ?? "").toUpperCase();
  if (key === 'FREE' || key === 'FREE TIER' || Number(product.price) === 0) {
    throw new Error("System Reserved Tiers cannot be deleted.");
  }

  await cms.deleteProduct(productId, admin.id);
  revalidatePath("/products");
}
