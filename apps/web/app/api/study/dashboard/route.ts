// apps/web/app/api/study/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { study } from '@planner/domain';

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const dashboard = await study.StudyService.getDashboard(user.id);
    return NextResponse.json(dashboard);
  } catch (error: unknown) {
    console.error("Dashboard API Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
