import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { habits } from "@domain";

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, content } = await req.json();
    await habits.upsertDailyNote(userId, new Date(date), content);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}