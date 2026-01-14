// apps/web/lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";
import { cache } from "react"; // ✅ IMPORT THIS

// Removed the global 'userCache' Map as it is ineffective in Serverless

/**
 * ✅ WRAP WITH REACT CACHE
 * This ensures the DB query runs only once per request,
 * even if getServerUser is called in 10 different components.
 */
export const getServerUser = cache(async (): Promise<PrismaUser | null> => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, 
      },
    }
  );

  // 1. Check Supabase Session
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

  if (error || !supabaseUser) return null;

  // 2. Fetch User from Prisma
  // We select only needed fields if possible, but finding unique is fast.
  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  // 3. Auto-create if missing (Sync logic)
  if (!user) {
    try {
      return await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
        },
      });
    } catch {
      return prisma.user.findUnique({ where: { id: supabaseUser.id } });
    }
  }

  return user;
});