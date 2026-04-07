import { NextRequest, NextResponse } from "next/server";
import { prisma, NoteCategory } from "@gritorquit/db";
import { getServerUser } from "@/lib/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { unitId } = await params;

  try {
    // 1. Try to find the centralized Note linked to this unit
    const note = await prisma.note.findFirst({
      where: {
        userId: user.id,
        metadata: {
          string_contains: unitId
        }
      }
    });

    if (note) {
      return NextResponse.json({ notes: note.content, title: note.title });
    }

    // 2. Fallback to legacy Unit.notes if no centralized note found
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        track: {
          userId: user.id,
        },
      },
      select: { notes: true, title: true }
    });

    if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

    // Try to parse legacy notes if they were JSON, otherwise return as-is
    let parsedNotes = unit.notes;
    try {
      if (typeof unit.notes === 'string' && (unit.notes.startsWith('{') || unit.notes.startsWith('['))) {
        parsedNotes = JSON.parse(unit.notes);
      }
    } catch {
      // Not JSON, return as string
    }

    return NextResponse.json({ notes: parsedNotes, title: unit.title });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ unitId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { unitId } = await params;
  const { notes, title } = await req.json();

  try {
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        track: {
          userId: user.id,
        },
      },
      include: { track: true }
    });
    if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

    const categoryMap: Record<string, string> = {
      'PLAYLIST': 'YOUTUBE',
      'COURSE': 'COURSE',
      'PROJECT': 'PROJECT'
    };
    const category = (categoryMap[unit.track.type] || 'GENERAL') as NoteCategory;

    // 3. Find or Create the centralized Note
    // We use metadata to link to the specific unitId
    const existingNote = await prisma.note.findFirst({
      where: {
        userId: user.id,
        metadata: {
          string_contains: unitId
        }
      }
    });

    if (existingNote) {
      await prisma.note.update({
        where: { id: existingNote.id },
        data: {
          content: notes,
          title: title || unit.title || existingNote.title,
          updatedAt: new Date(),
          metadata: {
            ...(existingNote.metadata as Record<string, unknown> || {}),
            sourceTitle: unit.title,
            trackTitle: unit.track.title
          }
        }
      });
    } else {
      await prisma.note.create({
        data: {
          userId: user.id,
          title: title || unit.title,
          content: notes,
          category,
          metadata: {
            unitId,
            trackId: unit.trackId,
            source: 'STUDY_SESSION',
            sourceTitle: unit.title,
            trackTitle: unit.track.title
          }
        }
      });
    }

    await prisma.unit.update({
      where: { id: unitId },
      data: { notes: typeof notes === 'string' ? notes : JSON.stringify(notes) }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to save notes:", error);
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  }
}
