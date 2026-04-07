import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Habit extends Model {
  static table = 'habits'

  @text('title') title!: string
  @text('icon') icon?: string
  @text('color') color?: string
  @field('active') active!: boolean
  @field('order') order!: number
  @text('user_id') userId!: string
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
