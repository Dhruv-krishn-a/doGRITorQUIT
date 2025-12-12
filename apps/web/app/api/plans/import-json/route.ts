import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/authHelper";

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { planName, tasks } = body;

    if (!planName) return NextResponse.json({ error: "Missing planName" }, { status: 400 });
    if (!Array.isArray(tasks)) return NextResponse.json({ error: "Bad tasks payload" }, { status: 400 });

    // Use a transaction to ensure all tasks are created or none
    const created = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: { userId, title: planName },
      });

      for (const row of tasks) {
        // 1. Map basic fields
        const title = row["Task Title"] || row.title || "Untitled";
        const notes = row["Notes"] || row["Description"] || row.description || null;
        
        // Date is pre-calculated by frontend, but we safely parse it
        const dateStr = row["Date"] || row["date"] || null;
        const date = dateStr ? new Date(dateStr) : null;
        
        const priority = row["Priority"] || null;

        // 2. Handle Duration (Convert "2" hours -> 120 minutes)
        const expectedHours = row["Expected Hours"] || row["Estimated Time (min)"];
        let estimatedMinutes = 0;
        if (expectedHours) {
            const val = Number(expectedHours);
            // If value is small (<10), assume hours (e.g., 2 hours). If large (e.g. 120), assume minutes.
            estimatedMinutes = val < 10 ? Math.round(val * 60) : Math.round(val);
        }

        const task = await tx.task.create({
          data: {
            planId: plan.id,
            userId,
            title,
            description: notes,
            date: date,
            priority,
            estimatedMinutes: estimatedMinutes || null,
            status: "Pending",
          },
        });

        // 3. Parse Subtasks (semicolon separated)
        const subtasksRaw = row["Subtasks"] || row.subtasks || "";
        if (subtasksRaw) {
          const subtasks = String(subtasksRaw)
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean);

          for (const st of subtasks) {
            await tx.subtask.create({
              data: { taskId: task.id, title: st },
            });
          }
        }

        // 4. Parse Tags (semicolon separated)
        const tagsRaw = row["Tags"] || row.tags || "";
        if (tagsRaw) {
          const tags = String(tagsRaw)
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean);

          for (const tagName of tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
            await tx.taskTag.create({ data: { taskId: task.id, tagId: tag.id } });
          }
        }
      }

      return plan;
    }, {
      maxWait: 5000, 
      timeout: 15000 // Increase timeout for large imports
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Import JSON error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}