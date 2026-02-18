// apps/web/app/api/study/units/route.ts
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { StudyService } from '@domain/study';

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const unit = await StudyService.createUnit(user.id, body);
    return NextResponse.json({ unit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
