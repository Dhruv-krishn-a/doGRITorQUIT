"use server";

import { cms } from "@domain"; // Import from your domain package
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function assignPlanAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  const productId = String(formData.get("productId"));

  await cms.assignUserPlan(userId, productId);
  revalidatePath("/users");
}

export async function updateRoleAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));

  await cms.updateUserRole(userId, role);
  revalidatePath("/users");
}