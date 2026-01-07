import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { analytics } from "@domain";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX 1: Pass 'user.id' (string), not the full user object
    const data = await analytics.getAnalyticsData(user.id);
    
    return NextResponse.json(data);
  } catch (err) {
    // ✅ FIX 2: Remove 'any' and check type safely
    console.error("Analytics Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}