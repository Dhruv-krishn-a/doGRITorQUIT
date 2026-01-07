// apps/web/app/api/subtasks/[subtaskId]/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { plans } from "@domain";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subtaskId } = await params;
    const { completed } = await req.json();

    const updated = await plans.toggleSubtask(userId, subtaskId, completed);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}