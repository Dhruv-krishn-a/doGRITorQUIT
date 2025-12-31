// apps/web/app/api/plans/import-json/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { plans, billing } from "@domain"; 

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await billing.assertPlanCreationAllowed(userId);
    } catch (err: any) {
      if (err?.code === "ENTITLEMENT_LIMIT") {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      throw err;
    }

    const body = await req.json();
    // ✅ Extract startDate
    const { planName, tasks, startDate } = body ?? {};

    // ✅ Pass startDate to service
    const createdPlan = await plans.importPlanJson(userId, planName, tasks, startDate);

    return NextResponse.json(createdPlan, { status: 201 });
  } catch (error: any) {
    console.error("Import JSON error:", error);
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}