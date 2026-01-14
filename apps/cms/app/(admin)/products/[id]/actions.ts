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

export async function saveFeatureValue(formData: FormData) {
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

export async function toggleFeature(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const productId = String(formData.get("productId"));
  const featureId = String(formData.get("featureId"));
  const currentState = formData.get("currentState") === "true";

  await cms.toggleProductFeature(productId, featureId, !currentState);
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