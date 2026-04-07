// apps/web/app/api/habits/[id]/log/route.ts
import { NextResponse } from "next/server";
// ✅ FIX 1: Use standard auth helper
import { getServerUser } from "@/lib/auth-server";
import { habits } from "@gritorquit/domain";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { date, completed } = await req.json();

    await habits.toggleHabitLog(user.id, id, new Date(date), completed);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Habit Log Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}