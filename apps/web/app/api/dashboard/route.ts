import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { dashboard } from "@domain";

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await dashboard.getDashboardStats(user.id);
    
    return NextResponse.json(data);
  } catch (err) {
    // ✅ FIX: Remove 'any' and handle safe error extraction
    console.error("Dashboard API Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}