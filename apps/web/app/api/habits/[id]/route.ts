// apps/web/app/api/habits/[id]/route.ts
import { NextResponse } from "next/server";
// ✅ FIX 1: Use standard auth helper
import { getServerUser } from "@/lib/auth-server";
import { habits } from "@gritorquit/domain";

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // ✅ FIX 2: Use 'user.id'
    await habits.deleteHabit(user.id, id);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    // ✅ FIX 3: Remove 'any' and handle type safety
    console.error("Delete Habit Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}