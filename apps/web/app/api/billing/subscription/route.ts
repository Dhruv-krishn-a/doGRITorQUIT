// apps/web/app/api/billing/subscription/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
// ✅ Import 'billing' and 'payment' from the domain package
import { payment, billing } from "@gritorquit/domain"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      console.log("[BillingAPI] No user session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- DEBUG LOGS ---
    console.log(`[BillingAPI] Loading data for User ID: ${user.id}`);

    // Parallelize all data fetching
    const [subData, usageStats, history] = await Promise.all([
      payment.getUserSubscription(user.id).catch(err => {
        console.error("[BillingAPI] Subscription Fetch Failed:", err);
        return null;
      }),
      billing.getUserUsageStats(user.id).catch(err => {
        console.error("[BillingAPI] Usage Fetch Failed:", err);
        return null;
      }),
      payment.getUserOrders(user.id).catch(err => {
        console.error("[BillingAPI] Orders Fetch Failed:", err);
        return [];
      })
    ]);

    return NextResponse.json({
      activeSubscription: subData?.activeSubscription || null,
      usage: {
        aiGenerated: usageStats?.ai?.used ?? 0,
        aiLimit: usageStats?.ai?.limit ?? 5,
        remaining: usageStats?.ai?.remaining ?? 5,
        plans: usageStats?.plans ?? { used: 0, limit: 1 },
        habits: usageStats?.habits ?? { used: 0, limit: 3 },
        study: usageStats?.study ?? {}
      },
      history: history
    });

  } catch (err) {
    console.error("[BillingAPI] Global Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}