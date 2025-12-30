// apps/cms/lib/prisma.ts

/**
 * ⚠️ TEMPORARY COMPATIBILITY FILE
 * 
 * DO NOT create PrismaClient in apps/*
 * This file only re-exports the shared client
 * so existing imports don't break during migration.
 */

export { prisma } from "../../../lib/prisma";
