-- CreateTable: auth_refresh_tokens
-- This table was added to schema.prisma but a migration was never generated.
-- Applying it now with IF NOT EXISTS to be safe.

CREATE TABLE IF NOT EXISTS "auth_refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "auth_refresh_tokens_token_key" ON "auth_refresh_tokens"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "auth_refresh_tokens_userId_idx" ON "auth_refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "auth_refresh_tokens_token_idx" ON "auth_refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT IF EXISTS "auth_refresh_tokens_userId_fkey";
ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "auth_refresh_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
