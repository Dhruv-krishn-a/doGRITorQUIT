import { createHash, randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const FAILED_WINDOW_MS = 15 * 60 * 1000;
const FAILED_ALERT_COOLDOWN_MS = 30 * 60 * 1000;
const FAILED_THRESHOLD = 5;

function nowMs() {
  return Date.now();
}

function parseForwardedFor(value: string | null) {
  if (!value) return null;
  const ip = value.split(",")[0]?.trim();
  return ip || null;
}

export function extractRequestContext(headers: Headers) {
  const ip =
    parseForwardedFor(headers.get("x-forwarded-for")) ||
    headers.get("x-real-ip") ||
    null;
  const userAgent = headers.get("user-agent");
  const locationHint = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || null;
  const language = headers.get("accept-language") || "";
  const deviceId = headers.get("x-device-id") || "";
  const seed = [ip || "", userAgent || "", language, deviceId].join("|");
  const fingerprint = createHash("sha256").update(seed).digest("hex");

  return {
    ip,
    userAgent,
    locationHint,
    fingerprint,
  };
}

export async function registerFailedLoginAttempt(email: string, ip: string | null) {
  const key = `${email.toLowerCase()}|${ip ?? "unknown"}`;
  const currentTime = new Date();
  const currentMs = nowMs();

  const existingRows = await prisma.$queryRaw<
    Array<{ count: number; firstAttemptAt: Date; lastAlertAt: Date | null }>
  >(
    Prisma.sql`
      SELECT "count", "firstAttemptAt", "lastAlertAt"
      FROM "auth_login_attempts"
      WHERE "key" = ${key}
      LIMIT 1
    `
  );
  const existing = existingRows[0] ?? null;

  if (!existing || currentMs - existing.firstAttemptAt.getTime() > FAILED_WINDOW_MS) {
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "auth_login_attempts"
          ("id", "key", "email", "ip", "count", "firstAttemptAt", "lastAttemptAt", "createdAt", "updatedAt")
        VALUES
          (${randomUUID()}, ${key}, ${email.toLowerCase()}, ${ip}, 1, ${currentTime}, ${currentTime}, ${currentTime}, ${currentTime})
        ON CONFLICT ("key")
        DO UPDATE SET
          "email" = EXCLUDED."email",
          "ip" = EXCLUDED."ip",
          "count" = 1,
          "firstAttemptAt" = EXCLUDED."firstAttemptAt",
          "lastAttemptAt" = EXCLUDED."lastAttemptAt",
          "updatedAt" = EXCLUDED."updatedAt"
      `
    );
    return { shouldAlert: false, count: 1 };
  }

  const nextCount = existing.count + 1;
  const shouldAlert =
    nextCount >= FAILED_THRESHOLD &&
    (!existing.lastAlertAt || currentMs - existing.lastAlertAt.getTime() > FAILED_ALERT_COOLDOWN_MS);

  if (shouldAlert) {
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "auth_login_attempts"
        SET
          "count" = ${nextCount},
          "lastAttemptAt" = ${currentTime},
          "lastAlertAt" = ${currentTime},
          "updatedAt" = ${currentTime}
        WHERE "key" = ${key}
      `
    );
  } else {
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "auth_login_attempts"
        SET
          "count" = ${nextCount},
          "lastAttemptAt" = ${currentTime},
          "updatedAt" = ${currentTime}
        WHERE "key" = ${key}
      `
    );
  }

  return { shouldAlert, count: nextCount };
}

export async function clearFailedLoginAttempts(email: string, ip: string | null) {
  const key = `${email.toLowerCase()}|${ip ?? "unknown"}`;
  await prisma.$executeRaw(
    Prisma.sql`
      DELETE FROM "auth_login_attempts"
      WHERE "key" = ${key}
    `
  );
}

export async function markAndCheckNewDevice(
  userId: string,
  fingerprint: string,
  meta?: {
    ip?: string | null;
    userAgent?: string | null;
    locationHint?: string | null;
  }
) {
  const existingRows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id"
      FROM "auth_known_devices"
      WHERE "userId" = ${userId} AND "fingerprint" = ${fingerprint}
      LIMIT 1
    `
  );
  const existing = existingRows[0] ?? null;

  const now = new Date();

  if (existing) {
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "auth_known_devices"
        SET
          "lastSeenAt" = ${now},
          "ip" = ${meta?.ip ?? null},
          "userAgent" = ${meta?.userAgent ?? null},
          "locationHint" = ${meta?.locationHint ?? null},
          "updatedAt" = ${now}
        WHERE "id" = ${existing.id}
      `
    );
    return false;
  }

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "auth_known_devices"
        ("id", "userId", "fingerprint", "ip", "userAgent", "locationHint", "firstSeenAt", "lastSeenAt", "createdAt", "updatedAt")
      VALUES
        (${randomUUID()}, ${userId}, ${fingerprint}, ${meta?.ip ?? null}, ${meta?.userAgent ?? null}, ${meta?.locationHint ?? null}, ${now}, ${now}, ${now}, ${now})
    `
  );

  return true;
}
