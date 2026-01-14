// apps/cms/app/(admin)/users/actions.ts
"use server";

import { cms } from "@domain";
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateLimitAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  const rawLimit = formData.get("limit");

  // If input is empty string, set to null (removes custom limit)
  const limit = rawLimit === "" ? null : Number(rawLimit);

  await cms.updateUserCustomLimit(userId, limit);
}

export async function resetUsageAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  await cms.resetUserAIUsage(userId);
}

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
