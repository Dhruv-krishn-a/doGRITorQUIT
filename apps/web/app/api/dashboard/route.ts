import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { dashboard } from "@domain";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await dashboard.getDashboardStats(userId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}