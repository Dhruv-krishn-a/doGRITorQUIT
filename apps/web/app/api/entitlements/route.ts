import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server"; 
// ✅ FIX: Import the correct functions from your domain package
import { fetchUserEntitlements, getAIUsageStats } from "@domain/billing/entitlements"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Call 'fetchUserEntitlements' (New Name)
    // We also fetch usage stats in parallel for the UI
    const [entitlements, usage] = await Promise.all([
      fetchUserEntitlements(user.id),
      getAIUsageStats(user.id)
    ]);

    // Return combined data
    return NextResponse.json({
      ...entitlements,
      usage, // { used: 5, limit: 10, remaining: 5 }
    });

  } catch (error) {
    console.error("[Entitlements API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}