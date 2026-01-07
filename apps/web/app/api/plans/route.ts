// apps/web/app/api/plans/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { plans } from "@domain"; // This calls your new package logic

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delegate logic to the domain package
    const userPlans = await plans.listPlansForUser(userId);

    return NextResponse.json(userPlans);
  } catch (err: any) {
    console.error("[GET /api/plans] ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch plans" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate } = body;

    // Delegate logic to the domain package
    const newPlan = await plans.createPlanForUser(userId, {
      title,
      description,
      startDate,
      endDate
    });

    return NextResponse.json(newPlan);
  } catch (err: any) {
    console.error("[POST /api/plans] ERROR:", err);
    // Handle specific domain errors (like limit reached)
    if (err.code === "ENTITLEMENT_LIMIT") {
        return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to create plan" }, 
      { status: 500 }
    );
  }
}