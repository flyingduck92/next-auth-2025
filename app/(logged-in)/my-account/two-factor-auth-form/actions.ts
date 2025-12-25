'use server'

import { auth } from '@/auth'
import db from '@/db/drizzle'
import { users } from '@/db/usersSchema'
import { eq } from 'drizzle-orm'
import { authenticator } from 'otplib'

export const get2FASecret = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: true,
      message: 'Unauthorized',
    }
  }

  const [user] = await db
    .select({
      twoFactorSecret: users.twoFactorSecret,
    })
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!user) {
    return {
      error: true,
      message: 'User not found',
    }
  }

  // if available use 2FASecret
  let twoFactorSecret = user.twoFactorSecret

  // if not available generate 2FASecret
  if (!twoFactorSecret) {
    twoFactorSecret = authenticator.generateSecret()
    await db
      .update(users)
      .set({ twoFactorSecret })
      .where(eq(users.id, session.user.id))
  }

  return {
    twoFactorSecret: authenticator.keyuri(
      session?.user?.email || '',
      'Next-Auth-2025',
      twoFactorSecret
    ),
  }
}

export const activate2FA = async (token: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: true,
      message: 'Unauthorized',
    }
  }

  const [user] = await db
    .select({
      twoFactorSecret: users.twoFactorSecret,
    })
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!user) {
    return {
      error: true,
      message: 'User not found',
    }
  }

  if (user.twoFactorSecret) {
    const tokenValid = authenticator.check(token, user.twoFactorSecret)

    if (!tokenValid) {
      return {
        error: true,
        message: 'Invalid OTP',
      }
    }

    await db
      .update(users)
      .set({ twoFactorActivated: true })
      .where(eq(users.id, session.user.id))
  }
}

export const disabled2FA = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: true,
      message: 'Unauthorized',
    }
  }

  await db
    .update(users)
    .set({ twoFactorActivated: false, twoFactorSecret: null })
    .where(eq(users.id, session.user.id))
}
