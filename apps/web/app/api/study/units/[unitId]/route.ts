// apps/web/app/api/study/units/[unitId]/route.ts
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { StudyService } from '@domain/study';

export async function GET(req: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { unitId } = await params;
    const unit = await StudyService.getUnit(user.id, unitId);
    return NextResponse.json({ unit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { unitId } = await params;
    const body = await req.json();
    const unit = await StudyService.updateUnit(user.id, unitId, body);
    return NextResponse.json({ unit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
