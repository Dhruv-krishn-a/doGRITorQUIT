import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { today } from "@gritorquit/domain";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await today.getUnifiedToday(user.id);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Unified Today API Error:", error);
    return NextResponse.json({ error: "Failed to fetch today's data" }, { status: 500 });
  }
}
