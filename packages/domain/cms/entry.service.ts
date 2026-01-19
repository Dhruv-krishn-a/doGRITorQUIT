// packages/domain/cms/entry.service.ts
import { prisma } from "@planner/db";

// ✅ ADD: Get a single published entry by slug
export async function getPublishedBySlug(typeKey: string, slug: string, locale?: string) {
  return prisma.entry.findFirst({
    where: {
      contentType: { key: typeKey },
      slug,
      status: "published",
      ...(locale ? { locale } : {}), 
    },
    include: {
      contentType: true,
    }
  });
}

// ✅ ADD: List all published entries for a type
export async function listPublishedByType(typeKey: string, locale?: string) {
  return prisma.entry.findMany({
    where: {
      contentType: { key: typeKey },
      status: "published",
      ...(locale ? { locale } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
        id: true,
        title: true,
        slug: true,
        data: true,
        createdAt: true,
        requiresTier: true
    }
  });
}

// Existing write operation
export async function createDraft(
  creatorId: string, 
  contentTypeKey: string, 
  input: { title?: string; slug?: string; data: any; locale?: string; requiresTier?: string }
) {
  let ct = await prisma.contentType.findUnique({ where: { key: contentTypeKey } });
  
  if (!ct) {
    // Auto-create content type if missing (Developer Experience helper)
    ct = await prisma.contentType.create({ data: { key: contentTypeKey, name: contentTypeKey } });
  }

  return prisma.entry.create({
    data: {
      contentTypeId: ct.id,
      createdById: creatorId,
      status: "draft",
      data: input.data ?? {},
      title: input.title,
      slug: input.slug,
      locale: input.locale,
      requiresTier: input.requiresTier,
    },
  });
}