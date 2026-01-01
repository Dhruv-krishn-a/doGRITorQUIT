import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { habits } from "@domain";

export async function GET(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "Start and End dates required" }, { status: 400 });
    }

    const data = await habits.getHabitData(userId, new Date(start), new Date(end));
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const newHabit = await habits.createHabit(userId, body);
    
    return NextResponse.json(newHabit);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}