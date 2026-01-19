// apps/web/app/api/billing/subscription/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
// ✅ Import 'billing' and 'payment' from the domain package
import { payment, billing } from "@domain"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      console.log("[BillingAPI] No user session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- DEBUG LOGS ---
    console.log(`[BillingAPI] Loading data for User ID: ${user.id}`);

    // 1. Fetch Subscription
    const subData = await payment.getUserSubscription(user.id).catch(err => {
      console.error("[BillingAPI] Subscription Fetch Failed:", err);
      return null;
    });

    // 2. Fetch Usage (This is likely where it was failing)
    let usageData = { used: 0, limit: 0, remaining: 0 };
    try {
      if (billing && typeof billing.getAIUsageStats === 'function') {
        usageData = await billing.getAIUsageStats(user.id);
        console.log("[BillingAPI] Usage Data:", usageData);
      } else {
        console.error("[BillingAPI] Critical: 'billing.getAIUsageStats' is not a function. Check packages/domain/index.ts export.");
      }
    } catch (err) {
      console.error("[BillingAPI] Usage Fetch Failed:", err);
    }

    // 3. Fetch History
    const history = await payment.getUserOrders(user.id).catch(err => {
      console.error("[BillingAPI] Orders Fetch Failed:", err);
      return [];
    });

    return NextResponse.json({
      activeSubscription: subData?.activeSubscription || null,
      usage: {
        aiGenerated: usageData.used,
        aiLimit: usageData.limit,
        remaining: usageData.remaining
      },
      history: history
    });

  } catch (err) {
    console.error("[BillingAPI] Global Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}