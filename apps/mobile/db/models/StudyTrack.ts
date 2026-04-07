import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class StudyTrack extends Model {
  static table = 'study_tracks'

  @text('title') title!: string
  @text('type') type!: string
  @text('status') status!: string
  @field('progress_percentage') progressPercentage!: number
  @text('user_id') userId!: string
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
