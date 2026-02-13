//apps/web/app/api/plans/[id]/toggle-status/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { TaskStatus, PlanStatus } from "@prisma/client"; 

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action } = await request.json(); // 'PAUSE' or 'RESUME'

    // 1. Fetch Plan with specific fields
    const plan = await prisma.plan.findUnique({
      where: { id, userId: user.id },
      // We specifically select status/pausedAt to ensure TS knows they exist
      select: { id: true, status: true, pausedAt: true }
    });

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    // --- PAUSE LOGIC ---
    if (action === "PAUSE") {
      // Prevent double pausing
      if (plan.status === PlanStatus.paused) {
        return NextResponse.json({ success: true, status: PlanStatus.paused });
      }

      await prisma.plan.update({
        where: { id },
        data: {
          status: PlanStatus.paused, 
          pausedAt: new Date(),
        }
      });
      
      return NextResponse.json({ success: true, status: PlanStatus.paused });
    }

    // --- RESUME LOGIC (Time Shift) ---
    if (action === "RESUME") {
      // If not paused, just ensure active and return
      if (plan.status !== PlanStatus.paused || !plan.pausedAt) {
        await prisma.plan.update({ 
            where: { id }, 
            data: { status: PlanStatus.active, pausedAt: null }
        });
        return NextResponse.json({ success: true, status: PlanStatus.active });
      }

      // 1. Calculate Shift Duration
      const now = new Date();
      const pausedAt = new Date(plan.pausedAt);
      const timeDiffMs = now.getTime() - pausedAt.getTime();
      const daysShift = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24));

      // 2. Transaction: Update Plan + Shift Tasks
      await prisma.$transaction(async (tx) => {
        // A. Set Plan to Active
        await tx.plan.update({
          where: { id },
          data: { status: PlanStatus.active, pausedAt: null }
        });

        // B. Shift ONLY incomplete tasks
        const pendingTasks = await tx.task.findMany({
          where: { 
            planId: id, 
            status: { 
                // Using TaskStatus enum here ensures type safety
                notIn: [TaskStatus.completed, TaskStatus.archived] 
            },
            date: { not: null } // Only shift tasks that have a date assigned
          }
        });

        // C. Update dates
        for (const task of pendingTasks) {
          if (task.date) {
            const newDate = new Date(task.date);
            newDate.setDate(newDate.getDate() + daysShift);
            
            await tx.task.update({
              where: { id: task.id },
              data: { date: newDate }
            });
          }
        }
      });

      return NextResponse.json({ 
          success: true, 
          status: PlanStatus.active, 
          daysShifted: daysShift 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Toggle Plan Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}