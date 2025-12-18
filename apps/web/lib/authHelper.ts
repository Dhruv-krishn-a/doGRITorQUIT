import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { prisma } from './prisma';

export async function getServerUserId(): Promise<string | null> {
  try {
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
            }
          },
        },
      }
    );

    // SECURITY FIX: Use getUser() instead of getSession()
    // getUser() validates the token with Supabase Auth server
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    
    if (error || !supabaseUser?.id) {
      return null;
    }

    const supabaseUserId = supabaseUser.id;
    const userEmail = supabaseUser.email;

    if (!userEmail) return null;

    // Check if user exists in our database, create if not
    let user = await prisma.user.findUnique({
      where: { id: supabaseUserId }
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: supabaseUserId,
            email: userEmail,
            name: supabaseUser.user_metadata?.name || userEmail.split('@')[0],
          }
        });
      } catch (err: any) {
        // Handle race condition if P2002 (Unique constraint)
        if (err.code === 'P2002') { 
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

    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    
    if (error || !supabaseUser?.id || !supabaseUser.email) {
      return null;
    }

    let user = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
          }
        });
      } catch (err: any) {
        // Fallback if user was created in parallel
        if (err.code === 'P2002') {
           user = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
        }
      }
    }

    return user;
  } catch (error) {
    console.error('[getServerUser] Error:', error);
    return null;
  }
}