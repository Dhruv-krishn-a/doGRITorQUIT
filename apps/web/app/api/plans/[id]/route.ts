// apps/web/app/api/plans/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

// GET /api/plans/[id] - Get a single plan with tasks
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const plan = await prisma.plan.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        tasks: {
          include: { 
            subtasks: true, 
            tags: { include: { tag: true } } 
          },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Transform data for frontend
    const formattedPlan = {
      ...plan,
      tasks: plan.tasks.map((task) => ({
        ...task,
        tags: task.tags?.map((taskTag) => taskTag.tag.name) ?? [],
      })),
    };

    return NextResponse.json(formattedPlan);
  } catch (error) {
    console.error("GET /api/plans/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] - Delete a plan and its tasks
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify plan belongs to user
    const plan = await prisma.plan.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Delete plan (Prisma cascade will delete tasks, subtasks, tags)
    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/plans/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}