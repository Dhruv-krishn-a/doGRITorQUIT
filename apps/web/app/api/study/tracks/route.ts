import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { study, billing } from '@gritorquit/domain';
import { PlanFeature } from '@gritorquit/domain/billing/entitlements';

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tracks = await study.StudyService.listTracks(user.id);
    return NextResponse.json({ tracks });
  } catch (error: unknown) {
    console.error("Tracks List API Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    // ✅ Granular Entitlement Checks
    if (body.type === 'COURSE') {
      await billing.checkFeatureAccess(user.id, PlanFeature.ACCESS_STUDY_COURSE);
    } else if (body.type === 'PROJECT') {
      await billing.checkFeatureAccess(user.id, PlanFeature.ACCESS_STUDY_PROJECT);
    }

    // Validate targetDate if provided
    if (body.targetDate) {
      body.targetDate = new Date(body.targetDate);
    }
    
    const track = await study.StudyService.createTrack(user.id, body);
    return NextResponse.json({ track });
  } catch (error: unknown) {
    console.error("Track Creation Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('FEATURE_LOCKED')) {
      return NextResponse.json({ error: "This feature is locked for your current plan. Please upgrade." }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
