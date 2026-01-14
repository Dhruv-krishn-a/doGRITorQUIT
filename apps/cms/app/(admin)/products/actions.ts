"use server";

import { cms } from "@domain";
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  key: z.string().min(1, "Key is required").regex(/^[A-Z0-9_]+$/, "Key must be UPPERCASE_WITH_UNDERSCORES"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  description: z.string().optional(),
});

export async function createProductAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

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

  try {
    await cms.deleteProduct(productId);
    revalidatePath("/products");
  } catch (error) {
    console.error("Failed to delete product:", error);
    // In a real app, you'd pass this error back to the UI
  }
}