import { billing, payment } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server"; 
import { redirect } from "next/navigation";
import SubscriptionClientPage from "./subscription-client";

export const metadata = {
  title: "Subscription | Planner AI",
};

export default async function SubscriptionPage() {
  // 1. Auth Check 
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 2. Fetch Data
  const [rawProducts, entitlements, usageStats, rawHistory] = await Promise.all([
    payment.getPublicPlans(),
    billing.fetchUserEntitlements(user.id), 
    billing.getUserUsageStats(user.id),
    payment.getUserOrders(user.id),
  ]);

  // 3. Transform Products
  // ✅ FIXED: Added explicit type to 'p' to fix build error
  const products = rawProducts.map((p: { 
    id: string; 
    name: string; 
    key: string; 
    price: number; 
    currency: string; 
    description?: string | null;
    featuresList?: any;
  }) => ({
    id: p.id,
    name: p.name,
    key: p.key,
    price: p.price,
    currency: p.currency,
    description: p.description || "",
    featuresList: Array.isArray(p.featuresList) ? (p.featuresList as string[]) : [],
  }));

  // 4. Transform History
  // ✅ FIXED: Added explicit type to 'order'
  const history = rawHistory.map((order: { 
    id: string; 
    status: string; 
    date: Date | string; 
    amount: number 
  }) => {
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

  // 5. Extract Active Subscription (Safe Access)
  const activeSub = entitlements.user?.subscriptions?.[0]; 

  const endDate = activeSub?.currentPeriodEnd ? new Date(activeSub.currentPeriodEnd) : undefined;

  const clientData = {
    activeSubscription: activeSub ? {
      product: activeSub.product ? {
        id: activeSub.product.id,
        name: activeSub.product.name,
        key: activeSub.product.key,
      } : undefined,
      status: activeSub.status,
      currentPeriodEnd: endDate?.toISOString(),
      formattedRenewsAt: endDate 
        ? endDate.toLocaleDateString("en-GB", { 
            day: "numeric", month: "short", year: "numeric" 
          }) 
        : undefined,
    } : undefined,
    usage: {
      ai: {
        used: usageStats.ai.used,
        limit: usageStats.ai.limit === Infinity ? 999999 : usageStats.ai.limit,
        remaining: usageStats.ai.remaining === Infinity ? 999999 : usageStats.ai.remaining
      },
      plans: usageStats.plans,
      habits: usageStats.habits,
      study: usageStats.study
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