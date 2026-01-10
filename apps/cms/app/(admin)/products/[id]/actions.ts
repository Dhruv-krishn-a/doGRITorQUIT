// apps/cms/app/(admin)/products/[id]/actions.ts
"use server";

import { updateFeatureValue as updateSvc, toggleProductFeature as toggleSvc, createFeature as createSvc } from "@domain/cms";
import { getAdminUser } from "@/lib/auth"; // Security Import
import { revalidatePath } from "next/cache";
import { z } from "zod";

const featureValueSchema = z.object({
  productId: z.string(),
  featureId: z.string(),
  value: z.coerce.number(), 
});

export async function saveFeatureValue(formData: FormData) {
  // 1. Security Check
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  // 2. Validation
  const parsed = featureValueSchema.safeParse({
    productId: formData.get("productId"),
    featureId: formData.get("featureId"),
    value: formData.get("value"),
  });

  if (!parsed.success) {
    console.error("Invalid Feature Input", parsed.error);
    return; 
  }

  await updateSvc(parsed.data.productId, parsed.data.featureId, parsed.data.value);
}

export async function toggleFeature(productId: string, featureId: string, currentState: boolean) {
  // 1. Security Check
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  await toggleSvc(productId, featureId, !currentState);
}

export async function createSystemFeature(formData: FormData) {
  // 1. Security Check
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const key = String(formData.get("key"));
  const description = String(formData.get("description"));
  
  if (!key || !description) return;
  
  await createSvc(key, description);
  revalidatePath("/products");
}