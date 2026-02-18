import { NextRequest, NextResponse } from "next/server";
import { study } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { playlistUrl } = await req.json();

  try {
    const track = await study.StudyService.importPlaylist(user.id, playlistUrl);
    return NextResponse.json({ track });
  } catch (error) {
    console.error("Failed to import playlist:", error);
    return NextResponse.json({ error: "Failed to import playlist" }, { status: 500 });
  }
}
