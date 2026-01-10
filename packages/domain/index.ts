// packages/domain/index.ts
export * as plans from "./plans/service";
// Export 'entitlements' functions under 'billing' namespace
export * as billing from "./billing/entitlements"; 
export * as payment from "./billing/service";
export * as ai from "./ai/service";
export * as habits from "./habits/service";
export * as dashboard from "./dashboard/service";
export * as cms from "./cms";
export * as analytics from "./analytics/service";
export * as auth from "./auth/auth.service";
