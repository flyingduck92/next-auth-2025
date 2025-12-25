import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const users = pgTable('users', {
  id: uuid('id')
    .$defaultFn(() => uuidv7())
    .notNull()
    .primaryKey(),
  email: text('email').unique(),
  password: text('password'),
  twoFactorSecret: text('2fa_secret'),
  twoFactorActivated: boolean('2fa_activated').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
})
