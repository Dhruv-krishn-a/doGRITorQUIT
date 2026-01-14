// apps/web/app/api/public/content/[type]/route.ts
import { NextResponse } from "next/server";
import { cms, billing } from "@domain"; 
import { getServerUser } from "@/lib/auth"; 

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ type: string }> } 
) {
  try {
    const { type } = await params;
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || undefined;
    const locale = url.searchParams.get("locale") || undefined;

    if (slug) {
      const entry = await cms.getPublishedBySlug(type, slug, locale);
      
      if (!entry) return NextResponse.json(null, { status: 404 });

      if (entry.requiresTier) {
        const user = await getServerUser();
        const userId = user?.id;

        if (!userId) {
          return NextResponse.json({ entry, accessible: false });
        }

        const ent = await billing.getUserEntitlements(userId);
        const tierReq = entry.requiresTier; // e.g., "PRO"

        let accessible = false;
        
        if (ent.product?.key) {
           accessible = ent.product.key === tierReq || ent.product.key.includes("PRO") || ent.product.key.includes("TEAM");
        }
        
        if (!accessible && ent.tierFallback) {
          accessible = ent.tierFallback === tierReq || ent.tierFallback === "PRO" || ent.tierFallback === "TEAM";
        }

        return NextResponse.json({ entry, accessible });
      }

      return NextResponse.json({ entry, accessible: true });
    }

    const entries = await cms.listPublishedByType(type, locale);
    return NextResponse.json(entries);

  } catch (err) {
    console.error("/api/public/content error", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}