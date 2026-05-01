import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { name, bio, timezone } = await req.json();

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { name, bio, timezone },
      create: { userId: user.id, name, bio, timezone },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return new Response("Internal Error", { status: 500 });
  }
}
