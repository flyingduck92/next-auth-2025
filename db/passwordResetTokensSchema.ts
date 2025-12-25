import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { users } from './usersSchema'

export const passwordResetTokens = pgTable('password_reset_token', {
  id: uuid('id')
    .$defaultFn(() => uuidv7())
    .notNull()
    .primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .unique(),
  token: text('token'),
  tokenExpiry: timestamp('token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
})
