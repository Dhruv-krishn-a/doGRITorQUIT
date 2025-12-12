// apps/web/lib/userSync.ts
import { prisma } from "./prisma";

export async function ensureUserExists(supabaseUserId: string, email: string, name?: string) {
  try {
    // Use upsert to create or update user
    const user = await prisma.user.upsert({
      where: { id: supabaseUserId },
      update: {
        email,
        name: name || undefined,
      },
      create: {
        id: supabaseUserId,
        email,
        name: name || null,
      },
    });
    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
}