import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@gritorquit/db";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@gritorquit/domain";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await billing.checkFeatureAccess(user.id, billing.PlanFeature.ACCESS_NOTES);
  } catch (error) {
    return NextResponse.json({ error: "Feature locked by plan limits" }, { status: 403 });
  }

  const { noteId } = await params;

  try {
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await billing.checkFeatureAccess(user.id, billing.PlanFeature.ACCESS_NOTES);
  } catch (error) {
    return NextResponse.json({ error: "Feature locked by plan limits" }, { status: 403 });
  }

  const { noteId } = await params;

  try {
    const data = await req.json();
    const existingNote = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
      select: { id: true },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id: existingNote.id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        content: data.content !== undefined ? data.content : undefined,
        category: data.category,
        metadata: data.metadata !== undefined ? data.metadata : undefined,
      },
    });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await billing.checkFeatureAccess(user.id, billing.PlanFeature.ACCESS_NOTES);
  } catch (error) {
    return NextResponse.json({ error: "Feature locked by plan limits" }, { status: 403 });
  }

  const { noteId } = await params;

  try {
    const existingNote = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
      select: { id: true },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: existingNote.id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
