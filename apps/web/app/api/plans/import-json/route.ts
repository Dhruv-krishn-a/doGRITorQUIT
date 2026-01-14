// apps/web/app/api/plans/import-json/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { plans, billing } from "@domain"; 

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await billing.assertPlanCreationAllowed(user.id);
    } catch (err) {
      // ✅ FIX: Use a safe type assertion instead of 'any'
      const errorObj = err as { code?: string; message?: string };

      if (errorObj?.code === "ENTITLEMENT_LIMIT") {
        return NextResponse.json({ error: errorObj.message }, { status: 403 });
      }
      throw err;
    }

    const body = await req.json();
    const { planName, tasks, startDate } = body ?? {};

    const createdPlan = await plans.importPlanJson(user.id, planName, tasks, startDate);

    return NextResponse.json(createdPlan, { status: 201 });
  } catch (error) {
    console.error("Import JSON error:", error);
    
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}