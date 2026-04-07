-- CreateEnum
CREATE TYPE "StudyStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('video', 'article', 'pdf', 'github', 'other');

-- DropForeignKey
ALTER TABLE "entries" DROP CONSTRAINT "entries_createdById_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_userId_fkey";

-- CreateTable
CREATE TABLE "study_playlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "channelName" TEXT,
    "channelId" TEXT,
    "totalVideos" INTEGER NOT NULL DEFAULT 0,
    "completedVideos" INTEGER NOT NULL DEFAULT 0,
    "status" "StudyStatus" NOT NULL DEFAULT 'in_progress',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playlistId" TEXT,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "channelName" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "StudyStatus" NOT NULL DEFAULT 'not_started',
    "progressSec" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "notes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_resources" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'other',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_playlists_userId_youtubeId_key" ON "study_playlists"("userId", "youtubeId");

-- CreateIndex
CREATE INDEX "study_videos_userId_status_idx" ON "study_videos"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "study_videos_userId_youtubeId_playlistId_key" ON "study_videos"("userId", "youtubeId", "playlistId");

-- CreateIndex
CREATE INDEX "study_resources_videoId_idx" ON "study_resources"("videoId");

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_playlists" ADD CONSTRAINT "study_playlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_videos" ADD CONSTRAINT "study_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_videos" ADD CONSTRAINT "study_videos_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "study_playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_resources" ADD CONSTRAINT "study_resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_resources" ADD CONSTRAINT "study_resources_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "study_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
