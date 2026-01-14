// apps/web/lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";
import { cache } from "react";
import { unstable_cache } from "next/cache";

// 1. Internal DB Fetcher
const fetchUserFromDb = async (userId: string) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

// 2. Cached Layer (Revalidates every 10 mins)
const getCachedUser = unstable_cache(
  async (userId: string) => fetchUserFromDb(userId),
  ["user-profile"], 
  { revalidate: 600, tags: ["user"] }
);

// 3. Main Auth Function
// 'cache' dedupes requests in a single render. 'unstable_cache' persists across requests.
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

  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
  
  if (error || !supabaseUser) return null;

  // ✅ OPTIMIZATION: Return cached user data instantly
  return getCachedUser(supabaseUser.id);
});