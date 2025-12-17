import { prisma } from "./prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  // CRITICAL: Only allow if role is admin
  if (user?.role !== "admin") return null;
  
  return user;
}