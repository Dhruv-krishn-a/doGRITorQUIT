import { NextRequest, NextResponse } from "next/server";
import { study } from "@gritorquit/domain";
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
  } catch (error: unknown) {
    console.error("Failed to fetch track summary:", error);
    return NextResponse.json({ error: "Failed to fetch track summary" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { trackId } = await params;

  try {
    const body = await req.json();
    const updatedTrack = await study.StudyService.updateTrack(user.id, trackId, body);
    return NextResponse.json(updatedTrack);
  } catch (error: unknown) {
    console.error("Failed to update track:", error);
    return NextResponse.json({ error: "Failed to update track" }, { status: 500 });
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
  } catch (error: unknown) {
    console.error("Failed to delete track:", error);
    return NextResponse.json({ error: "Failed to delete track" }, { status: 500 });
  }
}
