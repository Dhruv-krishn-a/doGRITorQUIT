import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { getAllTasksForUser, createTask } from "@planner/domain/plans/service";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tasks = await getAllTasksForUser(user.id);
    return NextResponse.json(tasks);
  } catch {
    // Removed unused 'err' variable
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    console.log("[POST Task] Body:", body); 

    // Pass body directly (including subtasks array if present)
    const task = await createTask(user.id, body.planId, {
        ...body,
        subtasks: body.subtasks || []
    });
    
    return NextResponse.json(task);
  } catch (err) {
    console.error("[POST Task] Create Task Error:", err);
    return NextResponse.json(
        { error: "Failed to create task", details: err instanceof Error ? err.message : String(err) }, 
        { status: 500 }
    );
  }
}