// lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { User as PrismaUser } from "@prisma/client";
import { cache } from "react";
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } });
  },
  ["user-profile-v1"], // Base Key
  { revalidate: 300, tags: ["user"] } // Cache for 5 minutes
);

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

  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) return null;

  return getCachedUser(session.user.id);
});