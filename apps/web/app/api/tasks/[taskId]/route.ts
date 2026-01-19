import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server"; // ✅ New Auth Server Helper
import { updateTask, addTimeSpent } from "@planner/domain/plans/service";
import { completeTask, deleteTask } from "@planner/domain/tasks/service"; // ✅ Import the "Engine"

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

    // 1. Handle "Time Log" special case
    if (typeof body.addMinutes === 'number') {
      const updated = await addTimeSpent(user.id, taskId, body.addMinutes);
      return NextResponse.json(updated);
    }

    // 2. Handle Completion (CRITICAL: Must use Manual Engine)
    // We check if the user is marking it as completed/done
    if (body.completed === true || body.status === "completed") {
      const updated = await completeTask(user.id, taskId);
      return NextResponse.json(updated);
    }

    // 3. Handle Standard Update (Title, Description, etc.)
    const updated = await updateTask(user.id, taskId, body);
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

    // ✅ FIXED: Use Domain Service instead of raw Prisma.
    // This ensures Plan.totalTasks is decremented correctly.
    await deleteTask(user.id, taskId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete Error", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}