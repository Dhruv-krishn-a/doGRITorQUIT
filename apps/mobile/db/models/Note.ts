import { Model } from '@nozbe/watermelondb'
import { date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Note extends Model {
  static table = 'notes'

  @text('title') title?: string
  @text('content') content?: string
  @text('category') category!: string
  @text('user_id') userId!: string
  @text('metadata') metadata?: string
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
