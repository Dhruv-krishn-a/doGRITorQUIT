// apps/web/app/api/auth/sync-user/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
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

    const supabaseUser = session.user;
    const userEmail = supabaseUser.email;
    
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Upsert is safer and cleaner than Find -> Create -> Catch Error
    const user = await prisma.user.upsert({
        where: { id: supabaseUser.id },
        update: {
            email: userEmail,
            name: supabaseUser.user_metadata?.name || undefined,
        },
        create: {
            id: supabaseUser.id,
            email: userEmail,
            name: supabaseUser.user_metadata?.name || userEmail.split('@')[0],
        }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync user", 
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}