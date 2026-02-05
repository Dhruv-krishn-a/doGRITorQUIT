import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { plans } from "@domain";

// Note: params key is now 'id' because the folder is named [id]
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ Fix: Await params and use 'id'
  const { id } = await params; 
  const { date } = await req.json();

  try {
    // Pass 'id' as the planId to the domain service
    await plans.insertPlanDay(user.id, id, date);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Insert Day Error:", err);
    return NextResponse.json({ error: "Failed to insert day" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ Fix: Await params and use 'id'
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  try {
    // Pass 'id' as the planId to the domain service
    await plans.deletePlanDay(user.id, id, date);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete Day Error:", err);
    return NextResponse.json({ error: "Failed to delete day" }, { status: 500 });
  }
}