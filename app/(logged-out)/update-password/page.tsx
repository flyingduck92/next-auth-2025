import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import db from '@/db/drizzle'
import { passwordResetTokens } from '@/db/passwordResetTokensSchema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import UpdatePasswordForm from './update-password-forn'

async function UpdatePassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  let tokenIsValid = false

  const searchParamsValues = await searchParams
  const { token } = searchParamsValues
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
  }

  return (
    <main className='flex justify-center items-center min-h-screen'>
      <Card className='w-87.5 gap-2'>
        <CardHeader>
          <CardTitle>
            {tokenIsValid ? 'Update Password' : 'Invalid Password Reset Link'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokenIsValid ? (
            <UpdatePasswordForm token={token ?? ''} />
          ) : (
            <Link
              href='/password-reset'
              className='underline'
            >
              Request another password reset link
            </Link>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default UpdatePassword
