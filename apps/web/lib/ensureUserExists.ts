import { prisma } from "@gritorquit/db";

export async function ensureUserExists(
  supabaseUserId: string,
  email: string,
  name?: string,
  avatarUrl?: string
) {
  console.log(`[ensureUserExists] Starting for ${email}`);
  try {
    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { id: supabaseUserId },
      create: {
        id: supabaseUserId,
        email,
        tier: "Free Tier",
      },
      update: { email },
    });

    // 2. Upsert Profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: supabaseUserId },
      create: {
        userId: supabaseUserId,
        name: name || email.split("@")[0],
        avatarUrl: avatarUrl,
      },
      update: {
        // Only update these if new values are provided
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
      },
    });

    console.log(`[ensureUserExists] Success for ${email}`);
    return { ...user, name: profile.name };
  } catch (error) {
    console.error("[ensureUserExists] DB Error:", error);
    throw error;
  }
}