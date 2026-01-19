import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getServerUser();
    
    const isAuthenticated = !!user;

    return NextResponse.json({
      authenticated: isAuthenticated,
      userId: user?.id || null, 
      timestamp: new Date().toISOString(),
      message: isAuthenticated ? "User is authenticated" : "User is not authenticated"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      error: message,
    }, { status: 500 });
  }
}