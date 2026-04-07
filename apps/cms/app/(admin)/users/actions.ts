// apps/cms/app/(admin)/users/actions.ts
"use server";

import { cms } from "@gritorquit/domain";
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateLimitAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  const rawLimit = formData.get("limit");

  // If input is empty string, set to null (removes custom limit)
  const limit = rawLimit === "" ? null : Number(rawLimit);

  await cms.updateUserCustomLimit(userId, limit, admin.id);
  revalidatePath("/users");
}

export async function resetUsageAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  await cms.resetUserAIUsage(userId, admin.id);
  revalidatePath("/users");
}

export async function assignPlanAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Unauthorized" };

  const userId = String(formData.get("userId"));
  const productId = String(formData.get("productId"));

  try {
    await cms.assignUserPlan(userId, productId, admin.id);
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to assign plan" };
  }
}

export async function updateRoleAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Unauthorized" };

  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));

  try {
    await cms.updateUserRole(userId, role, admin.id);
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update role" };
  }
}
