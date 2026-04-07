import { NextRequest, NextResponse } from "next/server";
import { study } from "@gritorquit/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sessionId } = await params;
  const { watchedSeconds } = await req.json();

  try {
    const unit = await study.StudyService.endUnitSession(user.id, sessionId, { watchedSeconds });
    return NextResponse.json({ unit });
  } catch (error: unknown) {
    console.error("Failed to end session:", error);
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
  }
}
