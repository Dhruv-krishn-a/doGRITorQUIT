CREATE TABLE IF NOT EXISTS "mobile_sync_deletions" (
  "id" BIGSERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tableName" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "deletedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "tableName", "recordId")
);

CREATE INDEX IF NOT EXISTS "mobile_sync_deletions_userId_deletedAt_idx"
  ON "mobile_sync_deletions" ("userId", "deletedAt");

CREATE OR REPLACE FUNCTION "mobile_sync_log_delete"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'study_units' THEN
    SELECT st."userId"
      INTO v_user_id
      FROM "study_tracks" st
     WHERE st."id" = OLD."trackId"
     LIMIT 1;
  ELSE
    v_user_id := OLD."userId";
  END IF;

  IF v_user_id IS NULL THEN
    RETURN OLD;
  END IF;

  INSERT INTO "mobile_sync_deletions" ("userId", "tableName", "recordId", "deletedAt")
  VALUES (v_user_id, TG_TABLE_NAME, OLD."id", NOW())
  ON CONFLICT ("userId", "tableName", "recordId")
  DO UPDATE SET "deletedAt" = EXCLUDED."deletedAt";

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS "mobile_sync_delete_tasks" ON "tasks";
CREATE TRIGGER "mobile_sync_delete_tasks"
AFTER DELETE ON "tasks"
FOR EACH ROW EXECUTE FUNCTION "mobile_sync_log_delete"();

DROP TRIGGER IF EXISTS "mobile_sync_delete_habits" ON "habits";
CREATE TRIGGER "mobile_sync_delete_habits"
AFTER DELETE ON "habits"
FOR EACH ROW EXECUTE FUNCTION "mobile_sync_log_delete"();

DROP TRIGGER IF EXISTS "mobile_sync_delete_habit_logs" ON "habit_logs";
CREATE TRIGGER "mobile_sync_delete_habit_logs"
AFTER DELETE ON "habit_logs"
FOR EACH ROW EXECUTE FUNCTION "mobile_sync_log_delete"();

DROP TRIGGER IF EXISTS "mobile_sync_delete_study_tracks" ON "study_tracks";
CREATE TRIGGER "mobile_sync_delete_study_tracks"
AFTER DELETE ON "study_tracks"
FOR EACH ROW EXECUTE FUNCTION "mobile_sync_log_delete"();

DROP TRIGGER IF EXISTS "mobile_sync_delete_study_units" ON "study_units";
CREATE TRIGGER "mobile_sync_delete_study_units"
AFTER DELETE ON "study_units"
FOR EACH ROW EXECUTE FUNCTION "mobile_sync_log_delete"();

DROP TRIGGER IF EXISTS "mobile_sync_delete_notes" ON "notes";
CREATE TRIGGER "mobile_sync_delete_notes"
AFTER DELETE ON "notes"
FOR EACH ROW EXECUTE FUNCTION "mobile_sync_log_delete"();
