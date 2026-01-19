// ✅ Import from the shared package, not a local file
import { prisma } from "@planner/db";

export async function ensureUserExists(supabaseUserId: string, email: string, name?: string) {
  try {
    const user = await prisma.user.upsert({
      where: { id: supabaseUserId },
      // 1. CREATE: Create User + Nested Profile
      create: {
        id: supabaseUserId,
        email,
        tier: "Free Tier", // Set default tier
        profile: {
          create: {
            name: name || email.split("@")[0], // Fallback to email prefix if no name
          },
        },
      },
      // 2. UPDATE: Update Email + Nested Profile Name
      update: {
        email,
        profile: {
          upsert: {
            create: { name: name || email.split("@")[0] },
            update: { name: name || undefined }, // Only update if name is provided
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Flatten the result so the UI gets a simple object with { ..., name: "Dhruv" }
    return {
      ...user,
      name: user.profile?.name,
    };
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
}