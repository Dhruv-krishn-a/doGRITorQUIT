import { prisma } from "@planner/db";

/**
 * PURE DOMAIN: No cookies, no headers.
 * Just checks if a specific User ID has admin privileges.
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  return user?.role === "admin";
}

export async function getAdminUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "admin") return null;
  return user;
}