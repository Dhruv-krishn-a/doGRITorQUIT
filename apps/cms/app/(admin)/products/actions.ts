// apps/cms/app/(admin)/products/actions.ts
"use server";

import { getAdminUser } from "@/lib/auth";
import { createProduct as createSvc, deleteProduct as deleteSvc } from "@domain/cms";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  key: z.string().min(1, "Key is required").regex(/^[A-Z0-9_]+$/, "Key must be UPPERCASE_WITH_UNDERSCORES"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  description: z.string().optional(),
});

// --- Actions ---

export async function createProductAction(formData: FormData) {
  // 1. Security Check
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }

  // 2. Validation
  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
    price: formData.get("price"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    console.error("Validation Error:", parsed.error);
    return; // In a real app, you'd return { error: parsed.error.flatten() }
  }

  // 3. Execution
  await createSvc({
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

  await deleteSvc(productId);
  revalidatePath("/products");
}