// packages/domain/auth/auth.service.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma"; 
import { cache } from "react";
import { unstable_cache } from "next/cache";

// Cached helper to fetch user from DB
const getCachedUser = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } });
  },
  ["user-profile-v1"], 
  { revalidate: 300, tags: ["user"] } 
);

/**
 * Get the current authenticated user (Standard User)
 */
export const getServerUser = cache(async () => {
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


export const getAdminUser = cache(async () => {
  const user = await getServerUser();
  if (!user || user.role !== "admin") return null;
  return user;
});