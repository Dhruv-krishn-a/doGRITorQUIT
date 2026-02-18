import { NextRequest, NextResponse } from "next/server";
import { study } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server";

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ trackId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { trackId } = await params;

  try {
    const data = await study.StudyService.getTrackSummary(user.id, trackId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch track summary" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { trackId } = await params;

  try {
    await study.StudyService.deleteTrack(user.id, trackId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete track" }, { status: 500 });
  }
}
