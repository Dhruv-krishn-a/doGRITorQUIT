import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
// ✅ FIX 1: Import specific function (ensure this is exported in packages/domain/cms/index.ts)
import { createDraft } from "@domain/cms";

// ✅ FIX 2: Define correct type for awaited cookies
type CookieStore = Awaited<ReturnType<typeof cookies>>;

async function getServerUser(cookieStore: CookieStore) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
    {
      cookies: { 
        getAll() { return cookieStore.getAll(); }, 
        setAll() { /* no-op */ } 
      }
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  let user = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  if (!user) {
    user = await prisma.user.create({ 
      data: { 
        id: session.user.id, 
        email: session.user.email ?? "", 
        name: session.user.user_metadata?.name ?? null 
      } 
    });
  }
  return user;
}

// ✅ FIX 3: Removed unused 'req' parameter
export async function GET() {
  try {
    // ✅ FIX 4: Await cookies() before using
    const cookieStore = await cookies();
    const user = await getServerUser(cookieStore);
    
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
    // ✅ FIX 5: Remove 'any' and handle error safely
    console.error("GET /api/cms/entries error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const user = await getServerUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contentType, title, slug, data, locale, requiresTier } = body;
    
    if (!contentType) {
      return NextResponse.json({ error: "Missing contentType" }, { status: 400 });
    }

    // ✅ FIX 6: Use the named export
    const created = await createDraft(
      user.id, 
      contentType, 
      { title, slug, data, locale, requiresTier }
    );
    
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/entries error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}