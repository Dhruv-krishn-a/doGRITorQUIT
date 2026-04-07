import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@gritorquit/domain"; // Imports your pure logic

export async function getAdminUser() {
  const cookieStore = await cookies();

  // 1. Get the User ID from the HTTP Cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in server components
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  // 2. Verify Admin Status via Database (Domain Layer)
  // This function in your domain should do: prisma.user.findUnique({ where: { id: userId, role: 'admin' } })
  const adminUser = await auth.getAdminUserById(user.id);

  return adminUser;
}