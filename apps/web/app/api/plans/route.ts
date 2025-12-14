// apps/web/app/api/plans/route.ts
import { NextResponse } from "next/server";
import { plans as planDomain } from "@domain";
import { getServerUserId } from "@/lib/authHelper";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await planDomain.listPlansForUser(userId);
    return NextResponse.json(plans);
  } catch (err: any) {
    console.error("[GET /api/plans] domain error:", err);
    const status = err.code === "ENTITLEMENT_LIMIT" ? 403 : 500;
    return NextResponse.json({ error: err.message || "Internal" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body?.title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

    const plan = await planDomain.createPlanForUser(userId, {
      title: body.title,
      description: body.description ?? null,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/plans] domain error:", err);
    const status = err.code === "ENTITLEMENT_LIMIT" ? 403 : 500;
    return NextResponse.json({ error: err.message || "Internal" }, { status });
  }
}
