// apps/cms/app/(admin)/products/[id]/actions.ts
"use server";

import { updateFeatureValue as updateSvc, toggleProductFeature as toggleSvc, createFeature as createSvc } from "@domain/cms";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const featureValueSchema = z.object({
  productId: z.string(),
  featureId: z.string(),
  value: z.coerce.number(), // Automatically handles string -> number
});

export async function saveFeatureValue(formData: FormData) {
  const parsed = featureValueSchema.safeParse({
    productId: formData.get("productId"),
    featureId: formData.get("featureId"),
    value: formData.get("value"),
  });

  if (!parsed.success) return { error: "Invalid Input" };

  await updateSvc(parsed.data.productId, parsed.data.featureId, parsed.data.value);
  revalidatePath(`/products/${parsed.data.productId}`);
}

export async function toggleFeature(productId: string, featureId: string, currentState: boolean) {
  await toggleSvc(productId, featureId, !currentState);
  revalidatePath(`/products/${productId}`);
}

export async function createSystemFeature(formData: FormData) {
  const key = String(formData.get("key"));
  const description = String(formData.get("description"));
  
  if (!key || !description) return;
  
  await createSvc(key, description);
  revalidatePath("/products");
}