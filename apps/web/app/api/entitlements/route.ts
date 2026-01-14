// apps/web/app/api/entitlements/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { billing } from "@domain";

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entitlements = await billing.getUserEntitlements(user.id);

    const maxPlansFeature = entitlements.features["MAX_PLANS"] as { limit?: number } | undefined;
    const aiLimitFeature = entitlements.features["AI_GEN_LIMIT"] as { limit?: number } | undefined;

    return NextResponse.json({
      tier: entitlements.tierFallback, 
      productName: entitlements.product?.name ?? "Free Tier",
      features: {
        maxPlans: maxPlansFeature?.limit ?? 3,
        aiGeneration: !!aiLimitFeature, 
        raw: entitlements.features 
      }
    });

  } catch (err) {
    console.error("Entitlements Error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}