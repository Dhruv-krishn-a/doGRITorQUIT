import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class UnitSession extends Model {
  static table = 'unit_sessions'

  @text('unit_id') unitId!: string
  @text('user_id') userId!: string
  @date('started_at') startedAt!: number
  @date('ended_at') endedAt?: number
  @field('watched_seconds') watchedSeconds!: number
  @field('is_paused') isPaused!: boolean
  @readonly @date('created_at') createdAt!: number
}
