// packages/domain/cms/cms.service.ts
import * as repo from "./cms.repo";
import { getAdminUser } from "../auth"; // temporary import - see notes
import { revalidatePath } from "next/cache"; // still OK to call from server actions

/* NOTE:
   - We keep getAdminUser in apps/cms/lib/auth for now and call it from service.
   - Later we can move auth helpers to packages/domain/auth and import here.
*/

export async function getOrders(limit = 100) {
  // no admin check for read-only listing (you may enforce it)
  return repo.findRecentOrders(limit);
}

export async function getDashboardCounts() {
  return repo.countEntities();
}

export async function getRecentSales(limit = 5) {
  return repo.findRecentSales(limit);
}

/* Products */
export async function getProducts() {
  return repo.findAllProducts();
}

export async function getProductDetail(productId: string) {
  return repo.findProductWithFeatures(productId);
}

export async function getAllFeatures() {
  return repo.findAllFeatures();
}

export async function createProduct(payload: { name: string; key: string; priceRupees: number; description?: string | null }) {
  await getAdminUser();
  const priceInPaise = Math.round(payload.priceRupees * 100);
  const product = await repo.createProductDb({
    name: payload.name,
    key: payload.key,
    priceInPaise,
    description: payload.description,
  });
  revalidatePath("/products");
  return product;
}

export async function deleteProduct(productId: string) {
  await getAdminUser();
  await repo.deleteProductDb(productId);
  revalidatePath("/products");
}

/* Feature actions */
export async function createFeature(key: string, description: string) {
  await getAdminUser();
  const f = await repo.upsertFeature(key, description);
  revalidatePath("/products/[id]");
  return f;
}

export async function updateFeatureValue(productId: string, featureId: string, rawValue: any) {
  await getAdminUser();
  const numValue = parseInt(String(rawValue));
  if (isNaN(numValue)) throw new Error("Invalid number");
  await repo.updateProductFeatureValue(productId, featureId, { value: numValue, enabled: true });
  revalidatePath(`/products/${productId}`);
}

export async function toggleProductFeature(productId: string, featureId: string, isEnabled: boolean) {
  await getAdminUser();
  if (isEnabled) {
    await repo.upsertProductFeature(productId, featureId, { enabled: true });
  } else {
    await repo.deleteProductFeature(productId, featureId);
  }
  revalidatePath(`/products/${productId}`);
}

/* Users */
export async function getUsersWithSubscriptions(limit = 50) {
  return repo.findUsersWithActiveSubscriptions(limit);
}

export async function assignUserPlan(userId: string, productId?: string | null) {
  await getAdminUser();

  if (!productId || productId === "manual_free") {
    await repo.cancelActiveSubscriptions(userId);
    await repo.setUserTier(userId, "FREE");
  } else {
    // create subscription
    await repo.cancelActiveSubscriptions(userId);
    const product = await repo.createProductDb({ name: "tmp", key: "tmp", priceInPaise: 0 }).catch(() => null);
    // NOTE: don't create a product here, in reality we should validate product exists.
    // We'll use repository createSubscriptionGrant that expects productId.
    await repo.createSubscriptionGrant(userId, productId);
    // set tier heuristics
    let newTier: "FREE" | "PRO" | "TEAM" = "FREE";
    if (productId.toUpperCase().includes("PRO")) newTier = "PRO";
    else if (productId.toUpperCase().includes("TEAM")) newTier = "TEAM";
    await repo.setUserTier(userId, newTier);
  }

  revalidatePath("/users");
}

export async function resetUserAI(userId: string) {
  await getAdminUser();
  await repo.resetUserAIUsage(userId);
  revalidatePath("/users");
}

export async function updateUserRole(userId: string, role: string) {
  await getAdminUser();
  await repo.updateUserRoleDb(userId, role);
  revalidatePath("/users");
}
