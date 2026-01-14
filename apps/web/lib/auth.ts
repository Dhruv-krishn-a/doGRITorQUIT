// apps/web/lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";
import { cache } from "react"; // ✅ Required for Server Components

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

  // 1. Check Session (Fast)
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    return null;
  }

  // 2. Fetch User (Optimized)
  // We DO NOT try to 'create' the user here. That is slow. 
  // We assume the user exists (created on login callback).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
});