// apps/web/app/api/tasks/[taskId]/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { plans } from "@domain";

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const body = await req.json();

    // Handle "Time Log" special case
    if (body.addMinutes) {
      const updated = await plans.addTimeSpent(userId, taskId, body.addMinutes);
      return NextResponse.json(updated);
    }

    // Handle Standard Update
    const updated = await plans.updateTask(userId, taskId, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { taskId } = await params;

    await plans.deleteTask(userId, taskId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}