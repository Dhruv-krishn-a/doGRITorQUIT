// apps/web/lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma types for error handling

/**
 * Gets the current authenticated user.
 * If the user exists in Supabase but not in Prisma (first login),
 * it automatically creates the user record in Postgres.
 */
export async function getServerUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {} // We are in a Server Action/Component, so we don't set cookies here
      },
    }
  );

  // 1. Validate Session with Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
  
  if (error || !supabaseUser?.id || !supabaseUser.email) {
    return null;
  }

  // 2. Fetch User from Prisma DB
  let user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  // 3. User Sync (If missing in DB, create them now)
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          // Fallback name logic
          name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0], 
        },
      });
    } catch (err) {
      // ✅ FIX: Use strict type check for Prisma errors
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        // Race condition: User created by parallel request, just fetch it again
        user = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
      } else {
        // Log unexpected errors
        console.error("Failed to sync user:", err);
      }
    }
  }

  return user;
}