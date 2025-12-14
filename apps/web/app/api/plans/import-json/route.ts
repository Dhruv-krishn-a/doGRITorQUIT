// apps/web/app/api/plans/import-json/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // FIX: await cookies()
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
             try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUserId = session.user.id;
    const userEmail = session.user.email;

    if (!supabaseUserId || !userEmail) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    }

    // Check if user exists in our database, create if not
    let user = await prisma.user.findUnique({
      where: { id: supabaseUserId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: supabaseUserId,
          email: userEmail,
          name: session.user.user_metadata?.name || userEmail.split('@')[0],
        }
      });
    }

    const body = await req.json();
    const { planName, tasks } = body;

    if (!planName) {
      return NextResponse.json({ error: "Missing planName" }, { status: 400 });
    }
    
    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "Bad tasks payload" }, { status: 400 });
    }

    // Use a transaction to ensure all tasks are created or none
    const created = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: { 
          userId: user.id, // Use the Prisma user ID
          title: planName 
        },
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
            userId: user.id, // Use the Prisma user ID
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
  } catch (error: any) {
    console.error("Import JSON error:", error);
    
    // More specific error handling
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Database constraint violation. Please ensure your account is properly set up." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}