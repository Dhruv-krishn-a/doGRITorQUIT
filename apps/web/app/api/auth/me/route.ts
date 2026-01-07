import { NextResponse } from "next/server";
// ✅ FIX 1: Import from the consolidated auth file
import { getServerUser } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ✅ FIX 2: Use getServerUser which returns the full user object
    const authUser = await getServerUser();
    
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Refetching to ensure we strictly select only public fields
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (err) {
    // ✅ FIX 3: Remove 'any' and handle type safety
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}