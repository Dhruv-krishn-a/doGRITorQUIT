// apps/web/app/api/study/units/[unitId]/move/route.ts
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { StudyService } from '@domain/study';

export async function POST(req: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { unitId } = await params;
    const { toStatus, positionIndex } = await req.json();
    const unit = await StudyService.updateUnit(user.id, unitId, {
      status: toStatus,
      orderIndex: positionIndex,
    });
    return NextResponse.json({ unit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
