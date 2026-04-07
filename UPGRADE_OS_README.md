# Upgrade OS - Rollout & Maintenance

## Rollout Plan
1. **Database Migration**:
   - Run `npx prisma migrate dev` to apply the new schema.
   - This adds `Track`, `Unit`, `DailySession`, `RevisionSchedule`, and `WeeklyReflection` models.
2. **Data Backfill**:
   - Run the backfill script: `BACKFILL_DRY_RUN=false npx ts-node scripts/backfill-study-to-tracks.ts`
   - Verify the results in the `backfill-log.json`.
3. **Deploy Backend**:
   - The new `StudyService` and API routes are now active.
4. **Deploy Frontend**:
   - New UI at `/study` replaces the old study room.

## Rollback Plan (Data)
If the backfill fails or produces incorrect data:
1. Identify the created IDs from `backfill-log.json`.
2. Delete the created `Track` and `Unit` records:
   ```sql
   DELETE FROM study_tracks WHERE id IN (...);
   -- Cascading delete will handle units and revisions
   ```

## Development Logic
### Cognitive Load Calculation
- **Base Weight**: Based on Effort (Low=1, Med=2, High=3)
- **Modality Penalty**: +1 for duration > 60m
- **Complexity Penalty**: +1 for difficulty >= 4
- **Retention Penalty**: +1 for low confidence (<= 2)
- **Revision Bonus**: 0.75x multiplier for revision tasks

### Fatigue & Burnout
- **Fatigue Score**: Combines missed days and high-load streaks.
- **Burnout Risk**: Triggered by persistent fatigue or frequent overload (Planned Load > 1.25x Baseline Capacity).
- **Suggested Mode**:
  - `LIGHT`: When fatigue is HIGH.
  - `NORMAL`: When overload risk is detected.
  - `FOCUS`: Optimal state for heavy learning.
