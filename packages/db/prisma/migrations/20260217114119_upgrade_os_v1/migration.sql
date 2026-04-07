-- AlterTable
ALTER TABLE "study_tracks" ADD COLUMN     "dailyAllocationMinutes" INTEGER,
ADD COLUMN     "estimatedCompletionDate" TIMESTAMP(3),
ADD COLUMN     "remainingMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDurationMinutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "study_units" ADD COLUMN     "durationSeconds" INTEGER DEFAULT 0,
ADD COLUMN     "lastWatchedAt" TIMESTAMP(3),
ADD COLUMN     "notes" JSONB,
ADD COLUMN     "totalWatchedSeconds" INTEGER DEFAULT 0,
ADD COLUMN     "watchPercentage" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "study_unit_sessions" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_unit_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_unit_sessions_userId_startedAt_idx" ON "study_unit_sessions"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "study_unit_sessions" ADD CONSTRAINT "study_unit_sessions_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "study_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
