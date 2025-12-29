'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import resetPassword from './actions'
import Image from 'next/image'

const formSchema = z.object({
  email: z.email('Invalid email address'),
})

function PasswordReset() {
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: decodeURIComponent(searchParams.get('email') ?? ''),
    },
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await resetPassword(data.email)

    if (response?.error) {
      form.setError('root', {
        message: response.message,
      })
    }
  }

  return (
    <main className='flex justify-center items-center min-h-screen'>
      {form.formState.isSubmitSuccessful ? (
        <Card className='w-87.5'>
          <CardHeader>
            <CardTitle>Email Sent</CardTitle>
          </CardHeader>
          <CardContent>
            If you have an account with us you will receive a password reset
            email at <br />
            do-not-reply@flyingduck92.my.id
          </CardContent>
        </Card>
      ) : (
        <Card className='w-87.5'>
          <CardHeader>
            <CardTitle>
              <div className='mb-4'>
                <Link href='/'>
                  <Image
                    className='dark:invert'
                    src='/next.svg'
                    alt='Next.js logo'
                    width={100}
                    height={20}
                    priority
                  />
                  <h2>NEXT-AUTH 2025</h2>
                </Link>
              </div>
              Reset Password
            </CardTitle>
            <CardDescription>
              Please enter valid email to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id='reset-password-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FieldSet disabled={form.formState.isSubmitting}>
                <FieldGroup className='flex flex-col gap-2'>
                  <Controller
                    name='email'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='email'>Email</FieldLabel>
                        <Input
                          {...field}
                          id='email'
                          aria-invalid={fieldState.invalid}
                          placeholder='john.doe@domain.com'
                          autoComplete='off'
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field orientation='responsive'>
                    {form.formState.errors.root?.message && (
                      <FieldError errors={[form.formState.errors.root]} />
                    )}
                    <Button
                      type='submit'
                      form='reset-password-form'
                      className='cursor-pointer'
                    >
                      Reset Password
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
          <CardFooter className='flex-col gap-2'>
            <div className='text-muted-foreground text-sm'>
              Have an account?{' '}
              <Link
                href='/login'
                className='underline'
              >
                Login to my account
              </Link>
            </div>
            <div className='text-muted-foreground text-sm'>
              Don't have an account?{' '}
              <Link
                href='/register'
                className='underline'
              >
                Register now
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}

export default PasswordReset
