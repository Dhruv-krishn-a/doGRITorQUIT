import {
  schemaMigrations,
  addColumns,
  createTable,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: "tasks",
          columns: [
            { name: "estimated_minutes", type: "number", isOptional: true },
            { name: "time_spent_minutes", type: "number", isOptional: true },
            { name: "metadata", type: "string", isOptional: true },
          ],
        }),
        createTable({
          name: "subtasks",
          columns: [
            { name: "task_id", type: "string", isIndexed: true },
            { name: "title", type: "string" },
            { name: "completed", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "unit_sessions",
          columns: [
            { name: "unit_id", type: "string", isIndexed: true },
            { name: "user_id", type: "string", isIndexed: true },
            { name: "started_at", type: "number", isIndexed: true },
            { name: "ended_at", type: "number", isOptional: true },
            { name: "watched_seconds", type: "number" },
            { name: "is_paused", type: "boolean" },
            { name: "created_at", type: "number" },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: "notes",
          columns: [{ name: "metadata", type: "string", isOptional: true }],
        }),
      ],
    },
  ],
});
