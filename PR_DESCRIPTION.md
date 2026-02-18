# PR Description: Upgrade OS - Unified Skill Upgrade Command Center

## Summary
This PR replaces the existing YouTube-only StudyRoom with "Upgrade OS", a comprehensive skill tracking and cognitive management system. It introduces a new domain model focused on "Tracks" and "Units", integrated with energy-based planning and cognitive load tracking.

## Key Changes
- **Prisma Schema**: Added `Track`, `Unit`, `DailySession`, `RevisionSchedule`, and `WeeklyReflection` models.
- **Domain Service**: Implemented `StudyService` with logic for:
  - Cognitive load scoring (effort + duration + difficulty + confidence).
  - Fatigue and burnout risk detection.
  - Spaced repetition (Revision scheduling).
  - YouTube playlist ingestion.
- **API Routes**: Next.js 15+ compatible routes for Track/Unit CRUD, Kanban moves, and Dashboard metrics.
- **Frontend (Web)**:
  - **Tracks List**: Overview of all active skills and progress.
  - **Track Detail**: Kanban board with drag-and-drop, energy selector, and completion modal.
  - **Dashboard**: Streak tracking, fatigue level visualization, and overload alerts.
- **Backfill Script**: Automated migration from `StudyPlaylist`/`StudyVideo` to the new system.
- **Unit Tests**: business logic validation for fatigue and cognitive load.

## Rollout Strategy
1. Apply migrations.
2. Run backfill script (Dry run first).
3. Deploy API and Frontend.

## Dependencies
- `@hello-pangea/dnd` (Kanban drag & drop)
- `lucide-react` (Icons)
- `sonner` (Toasts)
