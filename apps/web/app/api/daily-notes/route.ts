// apps/web/app/api/daily-notes/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { habits } from "@domain";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, content } = await req.json();

    await habits.upsertDailyNote(user.id, new Date(date), content);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Daily Note Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}