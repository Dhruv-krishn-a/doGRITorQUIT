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

export default class StudyUnit extends Model {
  static table = 'study_units'

  @text('track_id') trackId!: string
  @text('title') title!: string
  @text('status') status!: string
  @field('order_index') orderIndex!: number
  @field('duration_minutes') durationMinutes?: number
  @field('actual_time_spent_minutes') actualTimeSpentMinutes?: number
  @text('priority') priority?: string
  @field('difficulty') difficulty?: number
  @date('started_at') startedAt?: number
  @date('completed_at') completedAt?: number
  @json('metadata', sanitizeMetadata) metadata?: any
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
