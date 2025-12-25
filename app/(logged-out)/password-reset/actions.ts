'use server'

import { auth } from '@/auth'
import db from '@/db/drizzle'
import { passwordResetTokens } from '@/db/passwordResetTokensSchema'
import { users } from '@/db/usersSchema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { mailer } from '@/lib/email'

async function resetPassword(email: string) {
  const session = await auth()

  if (!!session?.user?.id) {
    return {
      error: true,
      message: "You're already logged in",
    }
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))

  if (!user) {
    return
  }

  const passwordResetToken = randomBytes(32).toString('hex')
  const one_hour = 3600000 // 60 * 60 * 1000
  const tokenExpiry = new Date(Date.now() + one_hour) // 1 hour limit

  await db
    .insert(passwordResetTokens)
    .values({
      userId: user.id,
      token: passwordResetToken,
      tokenExpiry,
    })
    .onConflictDoUpdate({
      target: passwordResetTokens.userId,
      set: {
        token: passwordResetToken,
        tokenExpiry,
      },
    })

  const resetLink = `${process.env.SITE_BASE_URL}/update-password?token=${passwordResetToken}`
  await mailer.sendMail({
    from: 'do-not-reply@flyingduck92.my.id',
    subject: 'Your password reset request',
    to: email,
    html: `Hey, ${email}!<br><br>
    Your requested to reset your password.<br>
    Here's your password reset link.<br>
    This link will expired in 1 hour:<br>
    <a href="${resetLink}">${resetLink}</a>
    `,
  })
}

export default resetPassword
