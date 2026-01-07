import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// ✅ FIX 1: Use standard auth helper (fixes cookie errors + redundant logic)
import { getServerUser } from "@/lib/auth";
// ✅ FIX 2: Import 'cms' namespace, then access 'createDraft' (or entryService if you renamed it)
import { cms } from "@domain"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.entry.findMany({ 
      where: {}, 
      orderBy: { updatedAt: "desc" }, 
      take: 50 
    });
    
    return NextResponse.json(entries);
  } catch (err) {
    // ✅ FIX 3: Safe error handling
    console.error("GET /api/cms/entries", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contentType, title, slug, data, locale, requiresTier } = body;
    
    if (!contentType) {
      return NextResponse.json({ error: "Missing contentType" }, { status: 400 });
    }

    const created = await cms.createDraft(
      user.id, 
      contentType, 
      { title, slug, data, locale, requiresTier }
    );
    
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    // ✅ FIX 5: Safe error handling
    console.error("POST /api/cms/entries", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}