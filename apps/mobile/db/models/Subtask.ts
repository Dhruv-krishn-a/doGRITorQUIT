import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Subtask extends Model {
  static table = 'subtasks'

  @text('task_id') taskId!: string
  @text('title') title!: string
  @field('completed') completed!: boolean
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
