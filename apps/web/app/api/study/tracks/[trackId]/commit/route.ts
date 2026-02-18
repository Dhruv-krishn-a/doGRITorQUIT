import { NextRequest, NextResponse } from "next/server";
import { study } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ trackId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { trackId } = await params;
  const body = await req.json();
  const { dailyAllocationMinutes, targetDate } = body;

  try {
    const track = await study.StudyService.commitTrack(user.id, trackId, { dailyAllocationMinutes, targetDate });
    return NextResponse.json({ track });
  } catch (error) {
    return NextResponse.json({ error: "Failed to commit track" }, { status: 500 });
  }
}
