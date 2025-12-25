'use server'

import { auth } from '@/auth'
import db from '@/db/drizzle'
import { passwordMatchSchema } from '@/validation/passwordMatchSchema'
import { users } from '@/db/usersSchema'
import { passwordResetTokens } from '@/db/passwordResetTokensSchema'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'

type UpdatePasswordProps = {
  token: string
  password: string
  passwordConfirm: string
}

export async function updatePassword({
  token,
  password,
  passwordConfirm,
}: UpdatePasswordProps) {
  // Validate password first
  const passwordValidation = passwordMatchSchema.safeParse({
    password,
    passwordConfirm,
  })

  // if password not valid
  if (!passwordValidation.success) {
    return {
      error: true,
      message: passwordValidation.error.issues[0].message || 'An error occured',
    }
  }

  const session = await auth()
  if (session?.user?.id) {
    return {
      error: true,
      message: 'You are alread logged in, please logout first',
    }
  }

  let tokenIsValid = false
  if (token) {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))

    const now = Date.now()
    if (
      !!passwordResetToken?.tokenExpiry &&
      now < passwordResetToken?.tokenExpiry?.getTime()
    ) {
      tokenIsValid = true
    }

    if (!tokenIsValid) {
      return {
        error: true,
        message: 'Your token is invalid or has expired',
        tokenInvalid: true,
      }
    }

    const hashedPassword = await hash(password, 10)

    // update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, passwordResetToken.userId!))

    // delete record from passwordResetToken (after update password)
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, passwordResetToken.id))
  }
}
