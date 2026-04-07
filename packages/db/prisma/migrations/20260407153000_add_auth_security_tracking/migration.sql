CREATE TABLE IF NOT EXISTS "auth_login_attempts" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "ip" TEXT,
  "count" INTEGER NOT NULL DEFAULT 1,
  "firstAttemptAt" TIMESTAMP(3) NOT NULL,
  "lastAttemptAt" TIMESTAMP(3) NOT NULL,
  "lastAlertAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_login_attempts_key_key" ON "auth_login_attempts"("key");
CREATE INDEX IF NOT EXISTS "auth_login_attempts_email_idx" ON "auth_login_attempts"("email");

CREATE TABLE IF NOT EXISTS "auth_known_devices" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "locationHint" TEXT,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_known_devices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "auth_known_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_known_devices_userId_fingerprint_key" ON "auth_known_devices"("userId", "fingerprint");
CREATE INDEX IF NOT EXISTS "auth_known_devices_userId_idx" ON "auth_known_devices"("userId");
