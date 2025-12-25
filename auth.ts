import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import db from '@/db/drizzle'
import { users } from '@/db/usersSchema'
import { eq } from 'drizzle-orm'
import { compare } from 'bcryptjs'
import { authenticator } from 'otplib'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: 'NextAuth',
      credentials: {
        email: {},
        password: {},
        token: {},
      },
      async authorize(credentials) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials?.email as string))

        if (!user) {
          throw new Error('Incorrect credentials 1')
        } else {
          const passwordCorrect = await compare(
            credentials?.password as string,
            user.password!
          )

          if (!passwordCorrect) {
            throw new Error('Incorrect credentials')
          }

          if (user.twoFactorActivated) {
            const tokenValid = authenticator.check(
              credentials.token as string,
              user.twoFactorSecret ?? ''
            )

            if (!tokenValid) {
              throw new Error('Incorrect OTP')
            }
          }
        }

        return {
          id: user.id.toString(),
          email: user.email,
        }
      },
    }),
  ],
})
