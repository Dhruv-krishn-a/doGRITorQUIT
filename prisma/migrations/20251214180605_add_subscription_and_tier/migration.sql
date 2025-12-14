-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO', 'TEAM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomer" VARCHAR(191),
    "stripeSubId" VARCHAR(191),
    "priceId" TEXT,
    "status" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubId_key" ON "subscriptions"("stripeSubId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomer_idx" ON "subscriptions"("stripeCustomer");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubId_idx" ON "subscriptions"("stripeSubId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
