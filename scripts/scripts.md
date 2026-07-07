# Architecture of the `scripts/` folder

The `scripts/` folder contains standalone TypeScript utility scripts for database maintenance, data migration, seeding, and logic verification. These scripts are designed to be run manually or as part of a deployment process using `npx tsx`.

## File Descriptions

- **`backfill-stats.ts`**: Synchronizes plan counters (total/completed tasks, progress) and user statistics (total plans, tasks, active habits) in the database using Prisma.
- **`backfill-study-to-tracks.ts`**: A migration script that converts legacy `studyPlaylist` and `studyVideo` data into the new `Track` and `Unit` architecture. It includes a dry-run mode and logs migration results.
- **`init-free-tier.ts`**: Initializes the database with default "Free Tier" product and associated features (e.g., AI generation limits).
- **`seed-page-features.ts`**: Seeds the database with page-level access control features (e.g., access to tasks, analytics, and plans).
- **`sync-tiers.ts`**: (Assumed based on filename) Synchronizes subscription tiers and their associated features across the system.
- **`verify-logic.ts`**: Verifies core business logic, such as weight and XP calculations in the `StudyService` (from `packages/domain/study/service.ts`), using various test cases.

## Interactions and Communication

- **Database**: Most scripts interact directly with the database via the `PrismaClient` (either from `@prisma/client` or the shared `packages/db` package).
- **Domain Logic**: `verify-logic.ts` imports services from `packages/domain` to test and validate business rules independently of the main applications.
- **File System**: `backfill-study-to-tracks.ts` writes a `backfill-log.json` file to record migration outcomes.
- **Environment**: Several scripts (like `backfill-study-to-tracks.ts`) use environment variables to control their behavior (e.g., `BACKFILL_DRY_RUN`).
