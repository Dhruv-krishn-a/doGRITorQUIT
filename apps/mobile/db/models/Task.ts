import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

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
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
