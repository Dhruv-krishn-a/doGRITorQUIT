// apps/web/app/api/plans/import-json/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { plans as planDomain } from "@domain";
import { 
  canUseAIGenerationForUser, 
  assertPlanCreationAllowed,
  incrementAIUsage,
  getMaxPlanDaysForUser // <--- Added this import
} from "@domain/billing/entitlements";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* read-only */ },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseUserId = session.user.id;
    const userEmail = session.user.email;
    if (!supabaseUserId || !userEmail) return NextResponse.json({ error: "Invalid user session" }, { status: 401 });

    // Ensure user exists in Prisma
    let user = await prisma.user.findUnique({ where: { id: supabaseUserId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: supabaseUserId,
          email: userEmail,
          name: session.user.user_metadata?.name || userEmail.split("@")[0],
        },
      });
    }

    // 1. Enforce Total Plan Limits (e.g. Max 3 plans)
    try {
      await assertPlanCreationAllowed(user.id);
    } catch (err: any) {
      if (err?.code === "ENTITLEMENT_LIMIT") {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      throw err;
    }
    
    const body = await req.json();
    const { planName, tasks, isAI } = body ?? {};

    if (!planName) return NextResponse.json({ error: "Missing planName" }, { status: 400 });
    if (!Array.isArray(tasks)) return NextResponse.json({ error: "Bad tasks payload" }, { status: 400 });

    // 2. Enforce Plan Duration Limits (Max Days)
    const maxDaysAllowed = await getMaxPlanDaysForUser(user.id);
    
    if (tasks.length > 0) {
      // Calculate duration based on earliest and latest task dates
      const dates = tasks
        .map((t: any) => t.Date || t.date)
        .filter(Boolean)
        .map((d: string) => new Date(d).getTime());

      if (dates.length > 0) {
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const diffTime = Math.abs(maxDate - minDate);
        // +1 to include start day (e.g. Mon-Mon is 1 day span)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

        if (diffDays > maxDaysAllowed) {
          return NextResponse.json({ 
            error: `Plan exceeds your limit of ${maxDaysAllowed} days. Please upgrade to create longer plans.` 
          }, { status: 403 });
        }
      }
    }

    // 3. Enforce AI Limits
    if (isAI) {
      const allowed = await canUseAIGenerationForUser(user.id);
      if (!allowed) {
        return NextResponse.json({ 
          error: "AI generation limit reached for this billing cycle. Please upgrade." 
        }, { status: 403 });
      }
    }

    // 4. Create the Plan
    const createdPlan = await planDomain.importPlanJson(user.id, planName, tasks);

    // 5. Increment usage count if this was an AI plan
    if (isAI) {
      await incrementAIUsage(user.id);
    }

    return NextResponse.json(createdPlan, { status: 201 });

  } catch (error: any) {
    console.error("Import JSON error:", error);

    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Database constraint violation. Please ensure your account is properly set up." }, { status: 400 });
    }
    if (error?.code === "ENTITLEMENT_LIMIT") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Internal Server Error", details: error.message || String(error) }, { status: 500 });
  }
}