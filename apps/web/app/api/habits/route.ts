// apps/web/app/api/habits/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { habits } from "@domain";

export async function GET(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "Start and End dates required" }, { status: 400 });
    }

    const data = await habits.getHabitData(user.id, new Date(start), new Date(end));
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Habits Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const newHabit = await habits.createHabit(user.id, body);
    
    return NextResponse.json(newHabit);
  } catch (err) {
    console.error("POST Habit Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}