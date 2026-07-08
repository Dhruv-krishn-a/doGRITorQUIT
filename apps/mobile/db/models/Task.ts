import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text, json } from '@nozbe/watermelondb/decorators'

const sanitizeMetadata = (raw: any) => {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

export default class Task extends Model {
  static table = 'tasks'

  @text('title') title!: string
  @text('description') description?: string
  @field('completed') completed!: boolean
  @text('status') status!: string
  @text('priority') priority?: string
  @date('date') date?: number
  @date('due_date') dueDate?: number
  @text('plan_id') planId?: string
  @text('user_id') userId!: string
  @field('estimated_minutes') estimatedMinutes?: number
  @field('time_spent_minutes') timeSpentMinutes?: number
  @json('metadata', sanitizeMetadata) metadata?: any
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
