CREATE OR REPLACE FUNCTION "pull_changes"(last_pulled_at BIGINT DEFAULT 0)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id TEXT;
  v_since TIMESTAMPTZ;
  v_now_ms BIGINT;

  v_tasks_created JSONB;
  v_tasks_updated JSONB;
  v_tasks_deleted JSONB;

  v_habits_created JSONB;
  v_habits_updated JSONB;
  v_habits_deleted JSONB;

  v_habit_logs_created JSONB;
  v_habit_logs_updated JSONB;
  v_habit_logs_deleted JSONB;

  v_tracks_created JSONB;
  v_tracks_updated JSONB;
  v_tracks_deleted JSONB;

  v_units_created JSONB;
  v_units_updated JSONB;
  v_units_deleted JSONB;

  v_notes_created JSONB;
  v_notes_updated JSONB;
  v_notes_deleted JSONB;
BEGIN
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  v_since := TO_TIMESTAMP(COALESCE(last_pulled_at, 0)::DOUBLE PRECISION / 1000.0);
  v_now_ms := FLOOR(EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000)::BIGINT;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', t."id",
    'title', t."title",
    'description', t."description",
    'completed', t."completed",
    'status', t."status"::TEXT,
    'priority', t."priority"::TEXT,
    'date', CASE WHEN t."date" IS NULL THEN NULL ELSE FLOOR(EXTRACT(EPOCH FROM t."date") * 1000)::BIGINT END,
    'due_date', CASE WHEN t."dueDate" IS NULL THEN NULL ELSE FLOOR(EXTRACT(EPOCH FROM t."dueDate") * 1000)::BIGINT END,
    'plan_id', t."planId",
    'user_id', t."userId",
    'estimated_minutes', t."estimatedMinutes",
    'time_spent_minutes', t."timeSpentMinutes",
    'metadata', CASE WHEN t."metadata" IS NULL THEN NULL WHEN JSONB_TYPEOF(t."metadata") = 'string' THEN t."metadata" #>> '{}' ELSE t."metadata"::TEXT END,
    'created_at', FLOOR(EXTRACT(EPOCH FROM t."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM t."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_tasks_created
  FROM "tasks" t
  WHERE t."userId" = v_user_id
    AND t."createdAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', t."id",
    'title', t."title",
    'description', t."description",
    'completed', t."completed",
    'status', t."status"::TEXT,
    'priority', t."priority"::TEXT,
    'date', CASE WHEN t."date" IS NULL THEN NULL ELSE FLOOR(EXTRACT(EPOCH FROM t."date") * 1000)::BIGINT END,
    'due_date', CASE WHEN t."dueDate" IS NULL THEN NULL ELSE FLOOR(EXTRACT(EPOCH FROM t."dueDate") * 1000)::BIGINT END,
    'plan_id', t."planId",
    'user_id', t."userId",
    'estimated_minutes', t."estimatedMinutes",
    'time_spent_minutes', t."timeSpentMinutes",
    'metadata', CASE WHEN t."metadata" IS NULL THEN NULL WHEN JSONB_TYPEOF(t."metadata") = 'string' THEN t."metadata" #>> '{}' ELSE t."metadata"::TEXT END,
    'created_at', FLOOR(EXTRACT(EPOCH FROM t."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM t."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_tasks_updated
  FROM "tasks" t
  WHERE t."userId" = v_user_id
    AND t."updatedAt" > v_since
    AND t."createdAt" <= v_since;

  SELECT COALESCE(JSONB_AGG(d."recordId"), '[]'::JSONB)
  INTO v_tasks_deleted
  FROM "mobile_sync_deletions" d
  WHERE d."userId" = v_user_id
    AND d."tableName" = 'tasks'
    AND d."deletedAt" > v_since;

  IF COALESCE(last_pulled_at, 0) <= 0 THEN
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
      'id', h."id",
      'title', h."title",
      'icon', h."icon",
      'color', h."color",
      'active', h."active",
      'order', h."order",
      'user_id', h."userId",
      'created_at', FLOOR(EXTRACT(EPOCH FROM h."createdAt") * 1000)::BIGINT,
      'updated_at', FLOOR(EXTRACT(EPOCH FROM h."updatedAt") * 1000)::BIGINT
    )), '[]'::JSONB)
    INTO v_habits_created
    FROM "habits" h
    WHERE h."userId" = v_user_id;

    v_habits_updated := '[]'::JSONB;
  ELSE
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
      'id', h."id",
      'title', h."title",
      'icon', h."icon",
      'color', h."color",
      'active', h."active",
      'order', h."order",
      'user_id', h."userId",
      'created_at', FLOOR(EXTRACT(EPOCH FROM h."createdAt") * 1000)::BIGINT,
      'updated_at', FLOOR(EXTRACT(EPOCH FROM h."updatedAt") * 1000)::BIGINT
    )), '[]'::JSONB)
    INTO v_habits_created
    FROM "habits" h
    WHERE h."userId" = v_user_id
      AND h."createdAt" > v_since;

    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
      'id', h."id",
      'title', h."title",
      'icon', h."icon",
      'color', h."color",
      'active', h."active",
      'order', h."order",
      'user_id', h."userId",
      'created_at', FLOOR(EXTRACT(EPOCH FROM h."createdAt") * 1000)::BIGINT,
      'updated_at', FLOOR(EXTRACT(EPOCH FROM h."updatedAt") * 1000)::BIGINT
    )), '[]'::JSONB)
    INTO v_habits_updated
    FROM "habits" h
    WHERE h."userId" = v_user_id
      AND h."updatedAt" > v_since
      AND h."createdAt" <= v_since;
  END IF;

  SELECT COALESCE(JSONB_AGG(d."recordId"), '[]'::JSONB)
  INTO v_habits_deleted
  FROM "mobile_sync_deletions" d
  WHERE d."userId" = v_user_id
    AND d."tableName" = 'habits'
    AND d."deletedAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', hl."id",
    'habit_id', hl."habitId",
    'user_id', hl."userId",
    'date', FLOOR(EXTRACT(EPOCH FROM hl."date") * 1000)::BIGINT,
    'completed', hl."completed",
    'created_at', FLOOR(EXTRACT(EPOCH FROM hl."createdAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_habit_logs_created
  FROM "habit_logs" hl
  WHERE hl."userId" = v_user_id
    AND hl."createdAt" > v_since;

  v_habit_logs_updated := '[]'::JSONB;

  SELECT COALESCE(JSONB_AGG(d."recordId"), '[]'::JSONB)
  INTO v_habit_logs_deleted
  FROM "mobile_sync_deletions" d
  WHERE d."userId" = v_user_id
    AND d."tableName" = 'habit_logs'
    AND d."deletedAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', st."id",
    'title', st."title",
    'type', st."type"::TEXT,
    'status', st."status"::TEXT,
    'progress_percentage', ROUND(st."progressPercentage")::INT,
    'user_id', st."userId",
    'created_at', FLOOR(EXTRACT(EPOCH FROM st."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM st."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_tracks_created
  FROM "study_tracks" st
  WHERE st."userId" = v_user_id
    AND st."createdAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', st."id",
    'title', st."title",
    'type', st."type"::TEXT,
    'status', st."status"::TEXT,
    'progress_percentage', ROUND(st."progressPercentage")::INT,
    'user_id', st."userId",
    'created_at', FLOOR(EXTRACT(EPOCH FROM st."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM st."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_tracks_updated
  FROM "study_tracks" st
  WHERE st."userId" = v_user_id
    AND st."updatedAt" > v_since
    AND st."createdAt" <= v_since;

  SELECT COALESCE(JSONB_AGG(d."recordId"), '[]'::JSONB)
  INTO v_tracks_deleted
  FROM "mobile_sync_deletions" d
  WHERE d."userId" = v_user_id
    AND d."tableName" = 'study_tracks'
    AND d."deletedAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', su."id",
    'track_id', su."trackId",
    'title', su."title",
    'status', CASE WHEN su."status" = 'BACKLOG'::"UnitStatus" THEN 'PENDING' ELSE su."status"::TEXT END,
    'order_index', su."orderIndex",
    'duration_minutes', su."durationMinutes",
    'created_at', FLOOR(EXTRACT(EPOCH FROM su."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM su."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_units_created
  FROM "study_units" su
  JOIN "study_tracks" st ON st."id" = su."trackId"
  WHERE st."userId" = v_user_id
    AND su."createdAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', su."id",
    'track_id', su."trackId",
    'title', su."title",
    'status', CASE WHEN su."status" = 'BACKLOG'::"UnitStatus" THEN 'PENDING' ELSE su."status"::TEXT END,
    'order_index', su."orderIndex",
    'duration_minutes', su."durationMinutes",
    'created_at', FLOOR(EXTRACT(EPOCH FROM su."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM su."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_units_updated
  FROM "study_units" su
  JOIN "study_tracks" st ON st."id" = su."trackId"
  WHERE st."userId" = v_user_id
    AND su."updatedAt" > v_since
    AND su."createdAt" <= v_since;

  SELECT COALESCE(JSONB_AGG(d."recordId"), '[]'::JSONB)
  INTO v_units_deleted
  FROM "mobile_sync_deletions" d
  WHERE d."userId" = v_user_id
    AND d."tableName" = 'study_units'
    AND d."deletedAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', n."id",
    'title', n."title",
    'content',
      CASE
        WHEN n."content" IS NULL THEN NULL
        WHEN JSONB_TYPEOF(n."content") = 'string' THEN n."content" #>> '{}'
        ELSE n."content"::TEXT
      END,
    'category', n."category"::TEXT,
    'user_id', n."userId",
    'created_at', FLOOR(EXTRACT(EPOCH FROM n."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM n."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_notes_created
  FROM "notes" n
  WHERE n."userId" = v_user_id
    AND n."createdAt" > v_since;

  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'id', n."id",
    'title', n."title",
    'content',
      CASE
        WHEN n."content" IS NULL THEN NULL
        WHEN JSONB_TYPEOF(n."content") = 'string' THEN n."content" #>> '{}'
        ELSE n."content"::TEXT
      END,
    'category', n."category"::TEXT,
    'user_id', n."userId",
    'created_at', FLOOR(EXTRACT(EPOCH FROM n."createdAt") * 1000)::BIGINT,
    'updated_at', FLOOR(EXTRACT(EPOCH FROM n."updatedAt") * 1000)::BIGINT
  )), '[]'::JSONB)
  INTO v_notes_updated
  FROM "notes" n
  WHERE n."userId" = v_user_id
    AND n."updatedAt" > v_since
    AND n."createdAt" <= v_since;

  SELECT COALESCE(JSONB_AGG(d."recordId"), '[]'::JSONB)
  INTO v_notes_deleted
  FROM "mobile_sync_deletions" d
  WHERE d."userId" = v_user_id
    AND d."tableName" = 'notes'
    AND d."deletedAt" > v_since;

  RETURN JSONB_BUILD_OBJECT(
    'changes', JSONB_BUILD_OBJECT(
      'tasks', JSONB_BUILD_OBJECT('created', v_tasks_created, 'updated', v_tasks_updated, 'deleted', v_tasks_deleted),
      'habits', JSONB_BUILD_OBJECT('created', v_habits_created, 'updated', v_habits_updated, 'deleted', v_habits_deleted),
      'habit_logs', JSONB_BUILD_OBJECT('created', v_habit_logs_created, 'updated', v_habit_logs_updated, 'deleted', v_habit_logs_deleted),
      'study_tracks', JSONB_BUILD_OBJECT('created', v_tracks_created, 'updated', v_tracks_updated, 'deleted', v_tracks_deleted),
      'study_units', JSONB_BUILD_OBJECT('created', v_units_created, 'updated', v_units_updated, 'deleted', v_units_deleted),
      'notes', JSONB_BUILD_OBJECT('created', v_notes_created, 'updated', v_notes_updated, 'deleted', v_notes_deleted)
    ),
    'timestamp', v_now_ms
  );
END;
$$;

CREATE OR REPLACE FUNCTION "push_changes"(changes JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id TEXT;
  r JSONB;
  v_track_id TEXT;
BEGIN
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(
      COALESCE(changes->'tasks'->'created', '[]'::JSONB) || COALESCE(changes->'tasks'->'updated', '[]'::JSONB)
    )
  LOOP
    INSERT INTO "tasks" (
      "id", "planId", "userId", "title", "description", "date", "dueDate",
      "completed", "status", "priority", "estimatedMinutes", "timeSpentMinutes", "metadata", "createdAt", "updatedAt"
    ) VALUES (
      r->>'id',
      NULLIF(r->>'plan_id', ''),
      v_user_id,
      COALESCE(r->>'title', 'Untitled'),
      NULLIF(r->>'description', ''),
      CASE WHEN NULLIF(r->>'date', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'date')::DOUBLE PRECISION / 1000.0) END,
      CASE WHEN NULLIF(r->>'due_date', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'due_date')::DOUBLE PRECISION / 1000.0) END,
      COALESCE((r->>'completed')::BOOLEAN, FALSE),
      "mobile_map_task_status"(r->>'status'),
      "mobile_map_priority"(r->>'priority'),
      CASE WHEN NULLIF(r->>'estimated_minutes', '') IS NULL THEN NULL ELSE (r->>'estimated_minutes')::INT END,
      CASE WHEN NULLIF(r->>'time_spent_minutes', '') IS NULL THEN 0 ELSE (r->>'time_spent_minutes')::INT END,
      CASE WHEN NULLIF(r->>'metadata', '') IS NULL THEN NULL ELSE TO_JSONB(r->>'metadata') END,
      COALESCE(CASE WHEN NULLIF(r->>'created_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'created_at')::DOUBLE PRECISION / 1000.0) END, NOW()),
      COALESCE(CASE WHEN NULLIF(r->>'updated_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'updated_at')::DOUBLE PRECISION / 1000.0) END, NOW())
    )
    ON CONFLICT ("id") DO UPDATE SET
      "planId" = EXCLUDED."planId",
      "title" = EXCLUDED."title",
      "description" = EXCLUDED."description",
      "date" = EXCLUDED."date",
      "dueDate" = EXCLUDED."dueDate",
      "completed" = EXCLUDED."completed",
      "status" = EXCLUDED."status",
      "priority" = EXCLUDED."priority",
      "estimatedMinutes" = EXCLUDED."estimatedMinutes",
      "timeSpentMinutes" = EXCLUDED."timeSpentMinutes",
      "metadata" = EXCLUDED."metadata",
      "updatedAt" = NOW()
    WHERE "tasks"."userId" = v_user_id;

    DELETE FROM "mobile_sync_deletions"
    WHERE "userId" = v_user_id AND "tableName" = 'tasks' AND "recordId" = r->>'id';
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(COALESCE(changes->'tasks'->'deleted', '[]'::JSONB))
  LOOP
    DELETE FROM "tasks" WHERE "id" = r #>> '{}' AND "userId" = v_user_id;
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(
      COALESCE(changes->'habits'->'created', '[]'::JSONB) || COALESCE(changes->'habits'->'updated', '[]'::JSONB)
    )
  LOOP
    INSERT INTO "habits" (
      "id", "userId", "title", "icon", "color", "order", "active", "createdAt", "updatedAt"
    ) VALUES (
      r->>'id',
      v_user_id,
      COALESCE(r->>'title', 'Untitled'),
      NULLIF(r->>'icon', ''),
      NULLIF(r->>'color', ''),
      COALESCE((r->>'order')::INT, 0),
      COALESCE((r->>'active')::BOOLEAN, TRUE),
      COALESCE(CASE WHEN NULLIF(r->>'created_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'created_at')::DOUBLE PRECISION / 1000.0) END, NOW()),
      COALESCE(CASE WHEN NULLIF(r->>'updated_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'updated_at')::DOUBLE PRECISION / 1000.0) END, NOW())
    )
    ON CONFLICT ("id") DO UPDATE SET
      "title" = EXCLUDED."title",
      "icon" = EXCLUDED."icon",
      "color" = EXCLUDED."color",
      "order" = EXCLUDED."order",
      "active" = EXCLUDED."active",
      "updatedAt" = NOW()
    WHERE "habits"."userId" = v_user_id;

    DELETE FROM "mobile_sync_deletions"
    WHERE "userId" = v_user_id AND "tableName" = 'habits' AND "recordId" = r->>'id';
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(COALESCE(changes->'habits'->'deleted', '[]'::JSONB))
  LOOP
    DELETE FROM "habits" WHERE "id" = r #>> '{}' AND "userId" = v_user_id;
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(
      COALESCE(changes->'habit_logs'->'created', '[]'::JSONB) || COALESCE(changes->'habit_logs'->'updated', '[]'::JSONB)
    )
  LOOP
    INSERT INTO "habit_logs" (
      "id", "habitId", "userId", "date", "completed", "createdAt"
    ) VALUES (
      r->>'id',
      r->>'habit_id',
      v_user_id,
      TO_TIMESTAMP((r->>'date')::DOUBLE PRECISION / 1000.0),
      COALESCE((r->>'completed')::BOOLEAN, FALSE),
      COALESCE(CASE WHEN NULLIF(r->>'created_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'created_at')::DOUBLE PRECISION / 1000.0) END, NOW())
    )
    ON CONFLICT ("id") DO UPDATE SET
      "habitId" = EXCLUDED."habitId",
      "date" = EXCLUDED."date",
      "completed" = EXCLUDED."completed"
    WHERE "habit_logs"."userId" = v_user_id;

    DELETE FROM "mobile_sync_deletions"
    WHERE "userId" = v_user_id AND "tableName" = 'habit_logs' AND "recordId" = r->>'id';
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(COALESCE(changes->'habit_logs'->'deleted', '[]'::JSONB))
  LOOP
    DELETE FROM "habit_logs" WHERE "id" = r #>> '{}' AND "userId" = v_user_id;
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(
      COALESCE(changes->'study_tracks'->'created', '[]'::JSONB) || COALESCE(changes->'study_tracks'->'updated', '[]'::JSONB)
    )
  LOOP
    INSERT INTO "study_tracks" (
      "id", "userId", "type", "title", "status", "progressPercentage", "createdAt", "updatedAt"
    ) VALUES (
      r->>'id',
      v_user_id,
      "mobile_map_track_type"(r->>'type'),
      COALESCE(r->>'title', 'Untitled'),
      "mobile_map_track_status"(r->>'status'),
      COALESCE((r->>'progress_percentage')::DOUBLE PRECISION, 0),
      COALESCE(CASE WHEN NULLIF(r->>'created_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'created_at')::DOUBLE PRECISION / 1000.0) END, NOW()),
      NOW()
    )
    ON CONFLICT ("id") DO UPDATE SET
      "type" = EXCLUDED."type",
      "title" = EXCLUDED."title",
      "status" = EXCLUDED."status",
      "progressPercentage" = EXCLUDED."progressPercentage",
      "updatedAt" = NOW()
    WHERE "study_tracks"."userId" = v_user_id;

    DELETE FROM "mobile_sync_deletions"
    WHERE "userId" = v_user_id AND "tableName" = 'study_tracks' AND "recordId" = r->>'id';
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(COALESCE(changes->'study_tracks'->'deleted', '[]'::JSONB))
  LOOP
    DELETE FROM "study_tracks" WHERE "id" = r #>> '{}' AND "userId" = v_user_id;
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(
      COALESCE(changes->'study_units'->'created', '[]'::JSONB) || COALESCE(changes->'study_units'->'updated', '[]'::JSONB)
    )
  LOOP
    v_track_id := r->>'track_id';

    IF EXISTS (
      SELECT 1 FROM "study_tracks" st WHERE st."id" = v_track_id AND st."userId" = v_user_id
    ) THEN
      INSERT INTO "study_units" (
        "id", "trackId", "title", "status", "orderIndex", "durationMinutes", "createdAt", "updatedAt"
      ) VALUES (
        r->>'id',
        v_track_id,
        COALESCE(r->>'title', 'Untitled'),
        "mobile_map_unit_status"(r->>'status'),
        COALESCE((r->>'order_index')::INT, 0),
        CASE WHEN NULLIF(r->>'duration_minutes', '') IS NULL THEN NULL ELSE (r->>'duration_minutes')::INT END,
        COALESCE(CASE WHEN NULLIF(r->>'created_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'created_at')::DOUBLE PRECISION / 1000.0) END, NOW()),
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "trackId" = EXCLUDED."trackId",
        "title" = EXCLUDED."title",
        "status" = EXCLUDED."status",
        "orderIndex" = EXCLUDED."orderIndex",
        "durationMinutes" = EXCLUDED."durationMinutes",
        "updatedAt" = NOW()
      WHERE EXISTS (
        SELECT 1
        FROM "study_tracks" st
        WHERE st."id" = "study_units"."trackId"
          AND st."userId" = v_user_id
      );

      DELETE FROM "mobile_sync_deletions"
      WHERE "userId" = v_user_id AND "tableName" = 'study_units' AND "recordId" = r->>'id';
    END IF;
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(COALESCE(changes->'study_units'->'deleted', '[]'::JSONB))
  LOOP
    DELETE FROM "study_units" su
    WHERE su."id" = r #>> '{}'
      AND EXISTS (
        SELECT 1
        FROM "study_tracks" st
        WHERE st."id" = su."trackId"
          AND st."userId" = v_user_id
      );
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(
      COALESCE(changes->'notes'->'created', '[]'::JSONB) || COALESCE(changes->'notes'->'updated', '[]'::JSONB)
    )
  LOOP
    INSERT INTO "notes" (
      "id", "userId", "title", "content", "category", "createdAt", "updatedAt"
    ) VALUES (
      r->>'id',
      v_user_id,
      NULLIF(r->>'title', ''),
      CASE WHEN NULLIF(r->>'content', '') IS NULL THEN NULL ELSE TO_JSONB(r->>'content') END,
      "mobile_map_note_category"(r->>'category'),
      COALESCE(CASE WHEN NULLIF(r->>'created_at', '') IS NULL THEN NULL ELSE TO_TIMESTAMP((r->>'created_at')::DOUBLE PRECISION / 1000.0) END, NOW()),
      NOW()
    )
    ON CONFLICT ("id") DO UPDATE SET
      "title" = EXCLUDED."title",
      "content" = EXCLUDED."content",
      "category" = EXCLUDED."category",
      "updatedAt" = NOW()
    WHERE "notes"."userId" = v_user_id;

    DELETE FROM "mobile_sync_deletions"
    WHERE "userId" = v_user_id AND "tableName" = 'notes' AND "recordId" = r->>'id';
  END LOOP;

  FOR r IN
    SELECT value FROM JSONB_ARRAY_ELEMENTS(COALESCE(changes->'notes'->'deleted', '[]'::JSONB))
  LOOP
    DELETE FROM "notes" WHERE "id" = r #>> '{}' AND "userId" = v_user_id;
  END LOOP;
END;
$$;
