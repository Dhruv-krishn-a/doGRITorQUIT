import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@gritorquit/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string, noteId: string }> }
) {
  try {
    const { projectId, noteId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!note) return new NextResponse("Note not found", { status: 404 });

    const previousVersionsCount = await prisma.blueprintVersion.count({
      where: { noteId: noteId }
    });

    const newVersion = await prisma.blueprintVersion.create({
      data: {
        noteId: noteId,
        contentSnapshot: note.content || {},
        versionNumber: previousVersionsCount + 1,
      }
    });

    return NextResponse.json(newVersion);
  } catch (error: any) {
    console.error("Seal note error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
