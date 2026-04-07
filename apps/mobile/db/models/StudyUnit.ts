import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class StudyUnit extends Model {
  static table = 'study_units'

  @text('track_id') trackId!: string
  @text('title') title!: string
  @text('status') status!: string
  @field('order_index') orderIndex!: number
  @field('duration_minutes') durationMinutes?: number
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
