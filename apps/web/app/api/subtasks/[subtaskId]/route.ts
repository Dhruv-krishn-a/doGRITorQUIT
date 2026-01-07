import { NextResponse } from "next/server";
// ✅ FIX 1: Use standard auth helper
import { getServerUser } from "@/lib/auth";
import { plans } from "@domain";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subtaskId } = await params;
    const { completed } = await req.json();

    // ✅ FIX 2: Use user.id
    const updated = await plans.toggleSubtask(user.id, subtaskId, completed);
    
    return NextResponse.json(updated);
  } catch (err) {
    // ✅ FIX 3: Remove 'any' and handle type safety
    console.error("Subtask Toggle Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}