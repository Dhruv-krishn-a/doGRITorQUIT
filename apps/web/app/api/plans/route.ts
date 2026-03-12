//apps/web/app/api/plans/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { plans } from "@domain"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlans = await plans.listPlansForUser(user.id);
    return NextResponse.json({ plans: userPlans });
  } catch (err) {
    console.error("[GET /api/plans] ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // Log the received body to debug
    console.log("[POST /api/plans] Payload:", body);

    const { title, description, startDate, endDate } = body;

    const newPlan = await plans.createPlanForUser(user.id, {
      title,
      description,
      startDate,
      endDate
    });

    return NextResponse.json(newPlan);
  } catch (err) {
    console.error("[POST /api/plans] ERROR:", err);
    
    // ✅ FIX: Extract the actual error message
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorObj = err as { code?: string; message?: string };
    
    // Handle specific business logic errors
    if (errorObj.code === "ENTITLEMENT_LIMIT") {
        return NextResponse.json({ error: errorObj.message }, { status: 403 });
    }
    
    // ✅ Return the REAL error message to the frontend for debugging
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}