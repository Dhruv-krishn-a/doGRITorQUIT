import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { StudyService } from '@gritorquit/domain/study';

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const reflection = await StudyService.saveWeeklyReflection(user.id, body);
    return NextResponse.json({ reflection });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('FEATURE_LOCKED')) {
      return NextResponse.json({ error: "Weekly Reflections are locked on your current plan." }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
