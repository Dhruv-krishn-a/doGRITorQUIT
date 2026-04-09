// apps/web/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { analytics, billing } from "@gritorquit/domain";
import { PlanFeature } from "@gritorquit/domain/billing/entitlements";

export async function GET(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const categoryParam = searchParams.get("category");

    // ✅ Enforce Analytics Entitlement
    await billing.checkFeatureAccess(user.id, PlanFeature.ACCESS_ADVANCED_ANALYTICS);

    const data = await analytics.getAnalyticsData(user.id, {
      startDate: startDateParam ? new Date(startDateParam) : undefined,
      endDate: endDateParam ? new Date(endDateParam) : undefined,
      category: categoryParam as 'ALL' | 'YOUTUBE' | 'PLAN' | 'COURSE' | 'PROJECT' | null as any
    });
    
    return NextResponse.json(data);
  } catch (err) {
    // ✅ FIX 2: Remove 'any' and check type safely
    console.error("Analytics Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    if (message.includes('FEATURE_LOCKED')) {
      return NextResponse.json({ error: "Advanced Analytics is locked on your current plan." }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}