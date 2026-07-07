import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'completed', type: 'boolean' },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string', isOptional: true },
        { name: 'date', type: 'number', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'plan_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'habits',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'active', type: 'boolean' },
        { name: 'order', type: 'number' },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'habit_logs',
      columns: [
        { name: 'habit_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'completed', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'study_tracks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'progress_percentage', type: 'number' },
        { name: 'daily_allocation_minutes', type: 'number', isOptional: true },
        { name: 'estimated_completion_date', type: 'number', isOptional: true },
        { name: 'remaining_minutes', type: 'number', isOptional: true },
        { name: 'metadata', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'study_units',
      columns: [
        { name: 'track_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'order_index', type: 'number' },
        { name: 'duration_minutes', type: 'number', isOptional: true },
        { name: 'actual_time_spent_minutes', type: 'number', isOptional: true },
        { name: 'priority', type: 'string', isOptional: true },
        { name: 'difficulty', type: 'number', isOptional: true },
        { name: 'started_at', type: 'number', isOptional: true },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'metadata', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'title', type: 'string', isOptional: true },
        { name: 'content', type: 'string', isOptional: true },
        { name: 'category', type: 'string' },
        { name: 'metadata', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
