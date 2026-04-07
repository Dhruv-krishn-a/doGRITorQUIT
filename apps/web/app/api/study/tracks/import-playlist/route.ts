import { NextRequest, NextResponse } from "next/server";
import { study, billing } from "@gritorquit/domain";
import { getServerUser } from "@/lib/auth-server";
import { PlanFeature } from "@gritorquit/domain/billing/entitlements";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // ✅ NEW: Server-side entitlement check
    await billing.checkFeatureAccess(user.id, PlanFeature.ACCESS_STUDY_YOUTUBE);

    const { playlistUrl, targetDate } = await req.json();
    const track = await study.StudyService.importPlaylist(user.id, playlistUrl, targetDate);
    
    return NextResponse.json({ track });
  } catch (error: unknown) {
    console.error("Failed to import playlist:", error);
    const message = error instanceof Error ? error.message : "Failed to import playlist";
    
    // Return 403 for entitlement errors
    if (message.includes('FEATURE_LOCKED')) {
      return NextResponse.json({ error: "Feature locked. Please upgrade your plan." }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
