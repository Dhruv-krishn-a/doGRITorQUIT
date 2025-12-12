import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

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
          include: { subtasks: true, tags: { include: { tag: true } } },
          orderBy: { date: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data for frontend
    const out = plans.map((p) => ({
      ...p,
      tasks: p.tasks.map((t) => ({
        ...t,
        tags: t.tags?.map((tt) => tt.tag.name) ?? [],
      })),
    }));

    return NextResponse.json(out);
  } catch (error) {
    console.error("GET /api/plans error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, startDate, endDate } = body;

    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

    const plan = await prisma.plan.create({
      data: {
        userId,
        title,
        description: description ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}