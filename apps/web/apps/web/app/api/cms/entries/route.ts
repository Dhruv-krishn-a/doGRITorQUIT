// apps/web/app/api/cms/entries/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { entryService } from "@domain/cms";

async function getServerUser(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() { /* no-op */ } }
  });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  let user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    user = await prisma.user.create({ data: { id: session.user.id, email: session.user.email ?? "", name: session.user.user_metadata?.name ?? null } });
  }
  return user;
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const user = await getServerUser(cookieStore);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entries = await prisma.entry.findMany({ where: {}, orderBy: { updatedAt: "desc" }, take: 50 });
    return NextResponse.json(entries);
  } catch (err: any) {
    console.error("GET /api/cms/entries", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const user = await getServerUser(cookieStore);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { contentType, title, slug, data, locale, requiresTier } = body;
    if (!contentType) return NextResponse.json({ error: "Missing contentType" }, { status: 400 });

    const created = await entryService.createDraft(user.id, contentType, { title, slug, data, locale, requiresTier });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/cms/entries", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
