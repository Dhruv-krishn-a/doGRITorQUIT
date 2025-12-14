// apps/web/app/api/debug/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";

export async function GET() {
  try {
    const userId = await getServerUserId();
    
    return NextResponse.json({
      authenticated: !!userId,
      userId: userId,
      timestamp: new Date().toISOString(),
      message: userId ? "User is authenticated" : "User is not authenticated"
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}