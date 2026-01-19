import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { plans } from "@domain";
import { getServerUser } from "@/lib/auth-server";

// Initialize a standard client for verifying tokens
// We use the standard client here because we are validating a raw 'Bearer' token string
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    let userId: string | null = null;

    // ----------------------------------------------------------------
    // 1. AUTH STRATEGY: CHECK HEADER (Mobile)
    // ----------------------------------------------------------------
    const authHeader = request.headers.get("Authorization");
    
    if (authHeader) {
      // Extract token: "Bearer eyJhbG..."
      const token = authHeader.replace("Bearer ", "");
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
      }
    }

    // ----------------------------------------------------------------
    // 2. AUTH STRATEGY: CHECK COOKIES (Web / Fallback)
    // ----------------------------------------------------------------
    if (!userId) {
      const webUser = await getServerUser();
      if (webUser) {
        userId = webUser.id;
      }
    }

    // ----------------------------------------------------------------
    // 3. IF STILL NO USER -> 401 UNAUTHORIZED
    // ----------------------------------------------------------------
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid Bearer token or session." },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------------
    // 4. FETCH DATA (Using Shared Domain Logic)
    // ----------------------------------------------------------------
    const userPlans = await plans.listPlansForUser(userId);

    return NextResponse.json(userPlans);

  } catch (error) {
    console.error("[API] Get Plans Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}