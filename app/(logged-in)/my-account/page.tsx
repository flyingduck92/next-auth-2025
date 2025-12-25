import { auth } from '@/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import db from '@/db/drizzle'
import { users } from '@/db/usersSchema'
import TwoFactorAuthForm from './two-factor-auth-form'
import { eq } from 'drizzle-orm'

async function MyAccount() {
  const session = await auth()

  const [user] = await db
    .select({
      twoFactorActivated: users.twoFactorActivated,
    })
    .from(users)
    .where(eq(users.id, session?.user?.id!))

  return (
    <Card className='w-87.5'>
      <CardHeader>
        <CardTitle>My Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Email</Label>
        <div className='text-muted-foreground mb-4'>{session?.user?.email}</div>
        <TwoFactorAuthForm
          twoFactorActivated={user.twoFactorActivated ?? false}
        />
      </CardContent>
    </Card>
  )
}

export default MyAccount
