// apps/web/app/dashboard/subscriptions/page.tsx
import { auth, payment, billing } from "@domain";
import { redirect } from "next/navigation";
import SubscriptionClientPage from "./subscription-client";

export const metadata = {
  title: "Subscription | Planner AI",
};

export default async function SubscriptionPage() {
  // 1. Auth Check
  const user = await auth.getServerUser();
  if (!user) redirect("/login");

  // 2. Fetch All Data in Parallel
  const [rawProducts, entitlements, usageStats, rawHistory] = await Promise.all([
    payment.getPublicPlans(),
    billing.getUserEntitlements(user.id),
    billing.getAIUsageStats(user.id),
    payment.getUserOrders(user.id),
  ]);

  // 3. Transform Products
  const products = rawProducts.map(p => ({
    id: p.id,
    name: p.name,
    key: p.key,
    price: p.price,
    currency: p.currency,
    description: p.description || "",
  }));

  // 4. Transform History (Explicitly typed status)
  const history = rawHistory.map((order) => {
    let status: "paid" | "failed" | "pending" = "pending";
    if (order.status === "paid" || order.status === "captured") {
      status = "paid";
    } else if (order.status === "failed") {
      status = "failed";
    }

    return {
      id: order.id,
      formattedDate: new Date(order.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      amount: order.amount,
      status: status 
    };
  });

  // 5. Extract Active Subscription
  const activeSub = entitlements.user.subscriptions?.[0]; 

  // ✅ FIX: Ensure currentPeriodEnd is treated as a Date object before using date methods
  const endDate = activeSub?.currentPeriodEnd ? new Date(activeSub.currentPeriodEnd) : undefined;

  const clientData = {
    activeSubscription: activeSub ? {
      product: activeSub.product ? {
        id: activeSub.product.id,
        name: activeSub.product.name,
        key: activeSub.product.key,
      } : undefined,
      status: activeSub.status,
      // Safe conversion
      currentPeriodEnd: endDate?.toISOString(),
      formattedRenewsAt: endDate 
        ? endDate.toLocaleDateString("en-GB", { 
            day: "numeric", month: "short", year: "numeric" 
          }) 
        : undefined,
    } : undefined,
    usage: {
      aiGenerated: usageStats.used,
      aiLimit: usageStats.limit === Infinity ? null : usageStats.limit, 
      remaining: usageStats.remaining === Infinity ? null : usageStats.remaining
    },
    history: history
  };

  return (
    <SubscriptionClientPage 
      products={products} 
      data={clientData} 
    />
  );
}