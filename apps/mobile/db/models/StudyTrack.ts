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

export default class StudyTrack extends Model {
  static table = 'study_tracks'

  @text('title') title!: string
  @text('type') type!: string
  @text('status') status!: string
  @field('progress_percentage') progressPercentage!: number
  @field('daily_allocation_minutes') dailyAllocationMinutes?: number
  @date('estimated_completion_date') estimatedCompletionDate?: number
  @field('remaining_minutes') remainingMinutes?: number
  @json('metadata', sanitizeMetadata) metadata?: any
  @text('user_id') userId!: string
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
