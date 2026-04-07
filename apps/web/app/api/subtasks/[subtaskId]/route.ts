//apps/web/app/api/subtasks/[subtaskId]/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { updateSubtask, deleteSubtask } from "@gritorquit/domain/plans/service";

// PATCH: Handles both toggling completion AND renaming (editing)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subtaskId } = await params;
    const body = await req.json();

    // Body can contain { completed: boolean } OR { title: string } OR both
    const updated = await updateSubtask(user.id, subtaskId, body);
    
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Subtask Update Error:", err);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

// DELETE: Handles removing a subtask
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subtaskId } = await params;

    await deleteSubtask(user.id, subtaskId);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subtask Delete Error:", err);
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}