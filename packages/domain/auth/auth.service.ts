import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma"; // Adjust path as needed based on your monorepo structure

/**
 * Validates the session against Supabase Auth server.
 * Use this instead of getSession() for security.
 */
export async function getServerUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // Read-only in server components
      },
    }
  );

  // ✅ FIX: Use getUser() instead of getSession()
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user;
}

export async function getAdminUser() {
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

  // ✅ FIX: Use getUser() to securely verify the token
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Check role in database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== "admin") return null;

  return dbUser;
}