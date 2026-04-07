import { NextRequest, NextResponse } from "next/server";
import { study } from "@gritorquit/domain";
import { getServerUser } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { trackId, energyLevel } = body;

  try {
    const result = await study.StudyService.planToday(user.id, trackId, energyLevel);
    return NextResponse.json(result);
  } catch (error) {
    // Actually using the variable by logging it
    console.error("[Study Plan API Error]:", error); 
    return NextResponse.json({ error: "Planning failed" }, { status: 500 });
  }
}