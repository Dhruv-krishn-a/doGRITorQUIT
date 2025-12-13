// apps/web/app/api/plans/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

// GET /api/plans - List all plans for the current user
export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: { date: "asc" },
          include: { 
            subtasks: true, 
            tags: { include: { tag: true } } 
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data for frontend
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      tasks: plan.tasks.map((task) => ({
        ...task,
        tags: task.tags?.map((taskTag) => taskTag.tag.name) ?? [],
      })),
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error("GET /api/plans failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new plan
export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

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
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}