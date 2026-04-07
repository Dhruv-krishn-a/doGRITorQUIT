import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
// ✅ FIX: Import directly to avoid barrel file issues
import { updateTaskFully, deleteTask } from "@gritorquit/domain/plans/service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { taskId } = await params;
    const body = await req.json();

    console.log(`[PATCH Task] Updating ${taskId}`, body); // Debug Log

    const updated = await updateTaskFully(user.id, taskId, body);
    
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH Task] Error:", err); // ✅ Log the actual error
    return NextResponse.json(
        { error: "Failed to update task", details: err instanceof Error ? err.message : String(err) }, 
        { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { taskId } = await params;
    console.log(`[DELETE Task] Removing ${taskId}`); // Debug Log

    await deleteTask(user.id, taskId);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE Task] Error:", err); // ✅ Log the actual error
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}