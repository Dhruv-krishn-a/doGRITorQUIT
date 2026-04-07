import { Model } from '@nozbe/watermelondb'
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators'

export default class HabitLog extends Model {
  static table = 'habit_logs'

  @text('habit_id') habitId!: string
  @text('user_id') userId!: string
  @date('date') date!: number
  @field('completed') completed!: boolean
  @readonly @date('created_at') createdAt!: number
}
