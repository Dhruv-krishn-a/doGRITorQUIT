import { NextRequest, NextResponse } from "next/server";
import { study } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ unitId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { unitId } = await params;

  try {
    const session = await study.StudyService.startUnitSession(user.id, unitId);
    return NextResponse.json({ sessionId: session.id, startedAt: session.startedAt });
  } catch (error: unknown) {
    console.error("Failed to start session:", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
