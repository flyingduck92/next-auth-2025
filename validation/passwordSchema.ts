import * as z from 'zod'

export const passwordSchema = z
  .string()
  .min(5, 'Password must be at least 5 characters')
