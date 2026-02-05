//apps/web/app/api/subtasks/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { createSubtask } from "@planner/domain/plans/service";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // Expecting: { taskId: string, title: string }
  try {
    const subtask = await createSubtask(user.id, body.taskId, body.title);
    return NextResponse.json(subtask);
  } catch (err) {
    console.error("Create Subtask Error:", err);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}