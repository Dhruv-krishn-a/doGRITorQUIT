import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { plans } from "@domain";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tasks = await plans.getAllTasksForUser(userId);
    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}