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
import { PasswordInput } from '@/components/ui/password-input'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { passwordMatchSchema } from '@/validation/passwordMatchSchema'
import { registerUser } from './actions'
import Image from 'next/image'

const formSchema = z
  .object({
    email: z.email('Invalid email address'),
  })
  .and(passwordMatchSchema)

function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await registerUser({
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    })

    if (response?.error) {
      form.setError('email', {
        message: response?.message,
      })
    }
  }

  return (
    <main className='flex justify-center items-center min-h-screen'>
      {form.formState.isSubmitSuccessful ? (
        <Card className='w-87.5'>
          <CardHeader>
            <CardTitle className='text-center'>
              Your account has been created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className='w-full'
            >
              <Link href='/login'>Login to your account</Link>
            </Button>
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
              Register
            </CardTitle>
            <CardDescription>Register for a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id='register-form'
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
                  <Controller
                    name='password'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='password'>Password</FieldLabel>
                        <PasswordInput
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='passwordConfirm'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='passwordConfirm'>
                          Confirm Password
                        </FieldLabel>
                        <PasswordInput
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field orientation='responsive'>
                    <Button
                      type='submit'
                      form='register-form'
                      className='cursor-pointer'
                    >
                      Register
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
          <CardFooter className='flex-col'>
            <div className='text-muted-foreground text-sm'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='underline'
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}

export default Register
