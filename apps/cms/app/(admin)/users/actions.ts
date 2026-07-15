// apps/cms/app/(admin)/users/actions.ts
"use server";

import { cms, payment } from "@gritorquit/domain";
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

export async function revokePlanAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Unauthorized" };

  const userId = String(formData.get("userId"));

  try {
    await cms.revokeUserSubscription(userId, admin.id);
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to revoke plan" };
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

export async function refundSubscriptionAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Unauthorized" };

  const providerPaymentId = String(formData.get("providerPaymentId"));
  if (!providerPaymentId || providerPaymentId === "null") {
    return { success: false, error: "No payment ID found" };
  }
  
  try {
    await payment.refundOrderPayment(providerPaymentId, admin.id, true);
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to refund subscription" };
  }
}
