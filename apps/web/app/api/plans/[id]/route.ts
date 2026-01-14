// apps/web/app/api/plans/[id]/route.ts
import { NextResponse } from "next/server";
// ✅ FIX 1: Use standard auth helper
import { getServerUser } from "@/lib/auth";
import { plans } from "@domain";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // ✅ FIX 2: Use user.id
    const plan = await plans.getPlanForUser(user.id, id);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    // ✅ FIX 3: Remove 'any' and handle type safety
    console.error("GET /api/plans/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // ✅ FIX 4: Use user.id
    const success = await plans.deletePlanForUser(user.id, id);

    if (!success) {
      return NextResponse.json({ error: "Plan not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // ✅ FIX 5: Remove 'any' and handle type safety
    console.error("DELETE /api/plans/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}