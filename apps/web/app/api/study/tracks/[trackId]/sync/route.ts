import { NextRequest, NextResponse } from "next/server";
import { study } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest,
  { params }: { params: { trackId: string } }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trackId } = params;

  try {
    const result = await study.StudyService.syncPlaylist(user.id, trackId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to sync track:", error);
    return NextResponse.json({ error: error.message || "Failed to sync track" }, { status: 500 });
  }
}
