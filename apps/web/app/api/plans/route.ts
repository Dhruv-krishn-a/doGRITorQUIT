import { NextResponse } from "next/server";
// ✅ FIX 1: Use standard auth helper
import { getServerUser } from "@/lib/auth";
import { plans } from "@domain"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX 2: Use user.id
    const userPlans = await plans.listPlansForUser(user.id);

    return NextResponse.json(userPlans);
  } catch (err) {
    // ✅ FIX 3: Remove 'any' and handle safe logging
    console.error("[GET /api/plans] ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch plans" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate } = body;

    // ✅ FIX 4: Use user.id
    const newPlan = await plans.createPlanForUser(user.id, {
      title,
      description,
      startDate,
      endDate
    });

    return NextResponse.json(newPlan);
  } catch (err) {
    console.error("[POST /api/plans] ERROR:", err);
    
    // ✅ FIX 5: Safe type checking for domain errors
    const errorObj = err as { code?: string; message?: string };
    
    if (errorObj.code === "ENTITLEMENT_LIMIT") {
        return NextResponse.json({ error: errorObj.message }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: "Failed to create plan" }, 
      { status: 500 }
    );
  }
}