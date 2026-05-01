import { NextRequest, NextResponse } from "next/server";
import { prisma, NoteCategory } from "@gritorquit/db";
import { getServerUser } from "@/lib/auth-server";
import { sanitizeText, sanitizeJson } from "@/lib/sanitize";
import { billing } from "@gritorquit/domain";

export async function GET(req: NextRequest) {
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

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        ...(category && category !== "ALL" ? { category: category as NoteCategory } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            // Tiptap schema search: Check if content is a string containing the text
            {
              content: {
                string_contains: search
              }
            }
          ]
        } : {})
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
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

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: sanitizeText(title || "Untitled Note"),
        content: sanitizeJson(content),
        category: category || "GENERAL",
        metadata: sanitizeJson(metadata || {}),
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
