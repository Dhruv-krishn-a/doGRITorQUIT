// apps/web/app/api/tasks/[taskId]/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { plans } from "@domain";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();

    // Handle "Time Log" special case
    if (typeof body.addMinutes === 'number') {
      const updated = await plans.addTimeSpent(user.id, taskId, body.addMinutes);
      return NextResponse.json(updated);
    }

    // Handle Standard Update
    const updated = await plans.updateTask(user.id, taskId, body);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { plan: true }
    });

    if (!task || !task.plan || task.plan.userId !== user.id) {
       return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}