import { NextRequest, NextResponse } from "next/server";
import { study } from "@planner/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { playlistUrl, targetDate } = await req.json();

  try {
    const track = await study.StudyService.importPlaylist(user.id, playlistUrl, targetDate);
    return NextResponse.json({ track });
  } catch (error: unknown) {
    console.error("Failed to import playlist:", error);
    const message = error instanceof Error ? error.message : "Failed to import playlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
