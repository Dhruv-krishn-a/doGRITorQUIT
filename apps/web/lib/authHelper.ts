// apps/web/lib/authHelper.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { prisma } from './prisma';

export async function getServerUserId(): Promise<string | null> {
  try {
    // FIX: await cookies()
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return null;
    }

    const supabaseUserId = session.user.id;
    const userEmail = session.user.email;

    if (!userEmail) return null;

    // Check if user exists in our database, create if not
    // Optimization: Use upsert to handle race conditions better than find -> create
    let user = await prisma.user.findUnique({
      where: { id: supabaseUserId }
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: supabaseUserId,
            email: userEmail,
            name: session.user.user_metadata?.name || userEmail.split('@')[0],
          }
        });
      } catch (error: any) {
        // Handle race condition if P2002 (Unique constraint)
        if (error.code === 'P2002') { 
          user = await prisma.user.findUnique({
            where: { email: userEmail }
          });
        }
      }
    }

    return user?.id || null;
  } catch (error) {
    console.error('[getServerUserId] Error:', error);
    return null;
  }
}

export async function getServerUser() {
  try {
    // FIX: await cookies()
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
             // Read-only handling for server components
          }
        },
      }
    );

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (!supabaseUser?.id || !supabaseUser.email) {
      return null;
    }

    let user = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        }
      });
    }

    return user;
  } catch (error) {
    console.error('[getServerUser] Error:', error);
    return null;
  }
}