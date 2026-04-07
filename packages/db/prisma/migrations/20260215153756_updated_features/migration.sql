-- CreateEnum
CREATE TYPE "TrackType" AS ENUM ('PLAYLIST', 'COURSE', 'PROJECT', 'SKILL');

-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('VIDEO', 'LESSON', 'FEATURE', 'TASK', 'REVISION');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('BACKLOG', 'THIS_WEEK', 'TODAY', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "Effort" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "study_tracks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TrackType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TrackStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_units" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "UnitType" NOT NULL DEFAULT 'VIDEO',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "estimatedEffort" "Effort" NOT NULL DEFAULT 'MEDIUM',
    "durationMinutes" INTEGER,
    "actualTimeSpentMinutes" INTEGER DEFAULT 0,
    "status" "UnitStatus" NOT NULL DEFAULT 'BACKLOG',
    "confidenceRating" INTEGER,
    "difficultyRating" INTEGER,
    "lastCompletedAt" TIMESTAMP(3),
    "takeaways" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_daily_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "energyLevel" "EnergyLevel" NOT NULL,
    "totalTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "cognitiveLoadScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_daily_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_revision_schedules" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "nextRevisionAt" TIMESTAMP(3) NOT NULL,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "intervalLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_revision_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_weekly_reflections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "answers" JSONB NOT NULL,
    "moodScore" INTEGER,
    "stressLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_weekly_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_tracks_userId_idx" ON "study_tracks"("userId");

-- CreateIndex
CREATE INDEX "study_units_trackId_status_idx" ON "study_units"("trackId", "status");

-- CreateIndex
CREATE INDEX "study_daily_sessions_userId_date_idx" ON "study_daily_sessions"("userId", "date");

-- CreateIndex
CREATE INDEX "study_revision_schedules_unitId_nextRevisionAt_idx" ON "study_revision_schedules"("unitId", "nextRevisionAt");

-- CreateIndex
CREATE INDEX "study_weekly_reflections_userId_idx" ON "study_weekly_reflections"("userId");

-- AddForeignKey
ALTER TABLE "study_tracks" ADD CONSTRAINT "study_tracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_units" ADD CONSTRAINT "study_units_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "study_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_daily_sessions" ADD CONSTRAINT "study_daily_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_revision_schedules" ADD CONSTRAINT "study_revision_schedules_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "study_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_weekly_reflections" ADD CONSTRAINT "study_weekly_reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
