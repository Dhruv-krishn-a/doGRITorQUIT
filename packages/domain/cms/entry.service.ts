//packages/domain/cms/entry.service.ts
/**
 * packages/domain/cms/entry.service.ts
 * Domain-level logic for CMS entries (CRUD + publish)
 */
import { prisma } from "@/lib/prisma";

/**
 * List published entries by content type key
 */
export async function listPublishedByType(contentTypeKey: string, locale?: string, limit = 20, offset = 0) {
  const ct = await prisma.contentType.findUnique({ where: { key: contentTypeKey } });
  if (!ct) return [];

  const where: any = { contentTypeId: ct.id, status: "published" };
  if (locale) where.locale = locale;

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });

  return entries;
}

/**
 * Get single published entry by slug
 */
export async function getPublishedBySlug(contentTypeKey: string, slug: string, locale?: string) {
  const ct = await prisma.contentType.findUnique({ where: { key: contentTypeKey } });
  if (!ct) return null;

  const where: any = { contentTypeId: ct.id, slug, status: "published" };
  if (locale) where.locale = locale;

  const entry = await prisma.entry.findFirst({ where });
  return entry;
}

/**
 * Create a draft entry
 */
export async function createDraft(creatorId: string, contentTypeKey: string, input: { title?: string; slug?: string; data: any; locale?: string; requiresTier?: string }) {
  let ct = await prisma.contentType.findUnique({ where: { key: contentTypeKey } });
  if (!ct) {
    ct = await prisma.contentType.create({ data: { key: contentTypeKey, name: contentTypeKey } });
  }

  const entry = await prisma.entry.create({
    data: {
      contentTypeId: ct.id,
      title: input.title ?? null,
      slug: input.slug ?? null,
      data: input.data ?? {},
      locale: input.locale ?? null,
      requiresTier: input.requiresTier ?? null,
      createdById: creatorId,
      status: "draft",
    },
  });

  return entry;
}

/**
 * Update an entry (stores a revision snapshot)
 */
export async function updateEntry(entryId: string, updaterId: string, patch: { title?: string; slug?: string; data?: any; requiresTier?: string }) {
  const current = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!current) throw new Error("Entry not found");

  // Save revision
  await prisma.revision.create({ data: { entryId: current.id, data: current.data, createdBy: updaterId } });

  const updated = await prisma.entry.update({
    where: { id: entryId },
    data: {
      title: patch.title ?? current.title,
      slug: patch.slug ?? current.slug,
      data: patch.data ?? current.data,
      requiresTier: patch.requiresTier ?? current.requiresTier,
    },
  });

  return updated;
}

/**
 * Publish an entry or schedule it if publishAt in future
 */
export async function publishEntry(entryId: string, publisherId: string, publishAt?: Date) {
  if (publishAt && publishAt.getTime() > Date.now()) {
    return prisma.entry.update({ where: { id: entryId }, data: { status: "scheduled", publishedAt: publishAt } });
  }

  const updated = await prisma.entry.update({ where: { id: entryId }, data: { status: "published", publishedAt: new Date() } });
  return updated;
}

/**
 * Delete entry
 */
export async function deleteEntry(entryId: string) {
  await prisma.entry.delete({ where: { id: entryId } });
  return true;
}
