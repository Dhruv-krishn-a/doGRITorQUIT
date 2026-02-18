import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@planner/db"; // Direct DB access for simple update
import { getServerUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ unitId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { unitId } = await params;
  const { notes } = await req.json();

  try {
    await prisma.unit.update({
      where: { id: unitId },
      data: { notes }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  }
}
