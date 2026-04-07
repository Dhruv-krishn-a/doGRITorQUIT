import { NextRequest, NextResponse } from "next/server";
import { study } from "@gritorquit/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trackId } = await params;

  try {
    const result = await study.StudyService.syncPlaylist(user.id, trackId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Failed to sync track:", error);
    const message = error instanceof Error ? error.message : "Failed to sync track";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
