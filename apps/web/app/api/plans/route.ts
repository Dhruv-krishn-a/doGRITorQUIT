// apps/web/app/api/plans/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

// GET /api/plans - List all plans
export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: { date: "asc" },
          // Include tags and subtasks for the summary view if needed
          include: { 
            subtasks: true, 
            tags: { include: { tag: true } } 
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Flatten tags for the frontend
    const formattedPlans = plans.map((p) => ({
      ...p,
      tasks: p.tasks.map((t) => ({
        ...t,
        tags: t.tags.map((tt) => tt.tag.name),
      })),
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error("GET /api/plans failed:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: String(error) }),
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new empty plan (optional, for the "New Plan" button)
export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { title, description, startDate, endDate } = body;

    if (!title) return new NextResponse("Missing title", { status: 400 });

    const plan = await prisma.plan.create({
      data: {
        userId,
        title,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans failed:", error);
    return new NextResponse(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}