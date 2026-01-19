import { NextResponse } from "next/server";
// Use the import path that works for your project structure. 
// If you have a specific server auth file, use that.
import { getServerUser } from "@/lib/auth-server"; 
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getServerUser();
    
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Select fields from the 'profile' relation
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        tier: true,
        createdAt: true,
        // We fetch the profile relation here
        profile: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ FIX: Flatten the response
    // The frontend expects { name: "...", ... } not { profile: { name: "..." } }
    const formattedUser = {
      id: dbUser.id,
      email: dbUser.email,
      tier: dbUser.tier,
      createdAt: dbUser.createdAt,
      name: dbUser.profile?.name || null,
      avatarUrl: dbUser.profile?.avatarUrl || null,
    };

    return NextResponse.json(formattedUser);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Auth Me Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}