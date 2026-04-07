import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { prisma } from "@gritorquit/db";
import { auth } from "@/lib/auth";
import { verifyNativeAccessToken } from "@/lib/native-auth-token";

type ServerAuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
  } | null;
  app_metadata?: {
    provider?: string | null;
  } | null;
};

async function getUserFromLegacySupabaseToken(token: string): Promise<ServerAuthUser | null> {
  const cookieStore = await cookies();

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
            // Ignore in server-only contexts.
          }
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser(token);
  if (!data?.user?.id) return null;

  return {
    id: data.user.id,
    email: data.user.email,
    user_metadata: {
      full_name: (data.user.user_metadata as { full_name?: string } | undefined)?.full_name ?? null,
    },
    app_metadata: {
      provider: (data.user.app_metadata as { provider?: string } | undefined)?.provider ?? null,
    },
  };
}

export async function getServerUser(): Promise<ServerAuthUser | null> {
  const headerList = await headers();
  const authHeader = headerList.get("authorization");

  // 1) Native bearer token from Auth.js bridge
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    const nativePayload = await verifyNativeAccessToken(token);
    if (nativePayload?.sub) {
      return {
        id: nativePayload.sub,
        email: nativePayload.email ?? null,
        user_metadata: null,
        app_metadata: null,
      };
    }

    // 2) Compatibility fallback during migration (legacy Supabase access token)
    return await getUserFromLegacySupabaseToken(token);
  }

  // 3) First-party web session via Auth.js cookie
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      user_metadata: {
        full_name: session.user.name ?? null,
      },
      app_metadata: null,
    };
  }

  return null;
}

export async function getDbUser() {
  const authUser = await getServerUser();
  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  return dbUser;
}

export async function requireAdmin() {
  const dbUser = await getDbUser();
  if (!dbUser || dbUser.role !== "admin") {
    return null;
  }
  return dbUser;
}
