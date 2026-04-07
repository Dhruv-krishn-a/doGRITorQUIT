import { unstable_cache } from "next/cache";
import { fetchUserEntitlements } from "@gritorquit/domain/billing/entitlements";

// Wrap the pure domain function with Next.js Cache
export const getCachedUserEntitlements = unstable_cache(
  async (userId: string) => fetchUserEntitlements(userId),
  ["user-entitlements-v1"], 
  { revalidate: 300, tags: ["entitlements"] }
);