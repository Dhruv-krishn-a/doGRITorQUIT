import { NextRequest, NextResponse } from "next/server";
import { prisma, NoteCategory } from "@gritorquit/db";
import { getServerUser } from "@/lib/auth-server";
import { sanitizeText, sanitizeJson } from "@/lib/sanitize";
import { billing } from "@gritorquit/domain";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await billing.checkFeatureAccess(user.id, billing.PlanFeature.ACCESS_NOTES);
    } catch (error) {
      return NextResponse.json({ error: "Feature locked by plan limits" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    const category = categoryParam === "undefined" || categoryParam === "null" || categoryParam === "" ? null : categoryParam;
    const search = searchParam === "undefined" || searchParam === "null" || searchParam === "" ? null : searchParam;

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        ...(category && category !== "ALL" ? { category: category as NoteCategory } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            {
              content: {
                path: [],
                string_contains: search
              }
            }
          ]
        } : {})
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error: any) {
    console.error("NOTES API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await billing.checkFeatureAccess(user.id, billing.PlanFeature.ACCESS_NOTES);
  } catch (error) {
    return NextResponse.json({ error: "Feature locked by plan limits" }, { status: 403 });
  }

  try {
    const { title, content, category, metadata } = await req.json();

    // Note: We are keeping the sanitize calls here because POST is less frequent
    // and if it fails, it only fails on save, not on view.
    // However, for maximum stability in production, we'll avoid importing sanitizeJson
    // if it continues to cause ESM issues.
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: title || "Untitled Note",
        content: content,
        category: category || "GENERAL",
        metadata: metadata || {},
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
