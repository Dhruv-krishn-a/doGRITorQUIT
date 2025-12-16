// apps/web/app/api/plans/import-json/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { plans as planDomain } from "@domain";
import { canUseAIGenerationForUser } from "@domain/billing/entitlements";

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

    const body = await req.json();
    const { planName, tasks, isAI } = body ?? {};

    if (!planName) return NextResponse.json({ error: "Missing planName" }, { status: 400 });
    if (!Array.isArray(tasks)) return NextResponse.json({ error: "Bad tasks payload" }, { status: 400 });

    if (isAI) {
      const allowed = await canUseAIGenerationForUser(user.id);
      if (!allowed) {
        return NextResponse.json({ error: "Upgrade required to use AI plan generation" }, { status: 403 });
      }
    }

    const createdPlan = await planDomain.importPlanJson(user.id, planName, tasks);
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
