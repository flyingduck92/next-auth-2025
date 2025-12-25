'use server'

import db from '@/db/drizzle'
import * as z from 'zod'
import { hash } from 'bcryptjs'
import { users } from '@/db/usersSchema'
import { passwordMatchSchema } from '@/validation/passwordMatchSchema'

export const registerUser = async ({
  email,
  password,
  passwordConfirm,
}: {
  email: string
  password: string
  passwordConfirm: string
}) => {
  const newUserSchema = z
    .object({
      email: z.email(),
    })
    .and(passwordMatchSchema)

  const newUserValidation = newUserSchema.safeParse({
    email,
    password,
    passwordConfirm,
  })

  if (!newUserValidation.success) {
    return {
      error: true,
      message:
        newUserValidation.error.issues[0]?.message ?? 'An error occurred',
    }
  }

  const saltRounds = 10
  const hashPassword = await hash(password, saltRounds)

  try {
    await db.insert(users).values({
      email,
      password: hashPassword,
    })
  } catch (err: any) {
    /*
     * if email already exists -> 23505 (unique_violation)
     * https://www.postgresql.org/docs/current/errcodes-appendix.html
     */
    if (err?.cause?.code === '23505') {
      return {
        error: true,
        message: `An account with this email is already registered.`,
      }
    }

    // if error happened
    return {
      error: true,
      message: 'An error occurred',
    }
  }
}
