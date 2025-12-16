// apps/web/app/api/public/content/[type]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { entryService } from "@domain/cms";
import { createServerClient } from "@supabase/ssr";
import { getUserEntitlements } from "@domain/billing/entitlements";

export async function GET(_req: Request, { params }: { params: { type: string } }) {
  try {
    const { type } = params;
    const url = new URL((_req as any).url || "http://localhost");
    const slug = url.searchParams.get("slug") || undefined;
    const locale = url.searchParams.get("locale") || undefined;

    if (slug) {
      const entry = await entryService.getPublishedBySlug(type, slug, locale as any);
      if (!entry) return NextResponse.json(null, { status: 404 });

      if (entry.requiresTier) {
        // read cookies to optionally get logged in user
        const cookieStore = await cookies();
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          cookies: { getAll() { return cookieStore.getAll(); }, setAll() { /* no-op */ } }
        });
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
          return NextResponse.json({ entry, accessible: false });
        }

        const ent = await getUserEntitlements(userId);
        const tierReq = entry.requiresTier; // e.g., "PRO"
        // Check if user's product or tier satisfies required tier
        let accessible = false;
        if (ent.product?.key) {
          // allow if product key matches or product is PRO/TEAM mapping (depends on your product keys)
          accessible = ent.product.key === tierReq || ent.product.key === "PRO" || ent.product.key === "TEAM";
        }
        if (!accessible && ent.tierFallback) {
          accessible = ent.tierFallback === tierReq || ent.tierFallback === "PRO" || ent.tierFallback === "TEAM";
        }

        return NextResponse.json({ entry, accessible });
      }

      return NextResponse.json({ entry, accessible: true });
    }

    const entries = await entryService.listPublishedByType(type, locale);
    return NextResponse.json(entries);
  } catch (err: any) {
    console.error("/api/public/content error", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
