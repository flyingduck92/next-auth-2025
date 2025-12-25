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
import { loginWithCredentials, preLoginCheck } from './actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'

const formSchema = z.object({
  email: z.email(),
  password: z.string(),
})

function Login() {
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // handle Login
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // prelogin-check
    const preLoginCheckResponse = await preLoginCheck({
      email: data.email,
      password: data.password,
    })

    if (preLoginCheckResponse.error) {
      form.setError('root', {
        message: preLoginCheckResponse.message,
      })
      return
    }

    // If 2FA twoFactorActivated => Show OTP Form
    if (preLoginCheckResponse.twoFactorActivated) {
      setStep(2)
    } else {
      // login with email-password
      const response = await loginWithCredentials({
        email: data.email,
        password: data.password,
      })
      if (response?.error) {
        form.setError('root', {
          message: response.message,
        })
      } else {
        router.push('/my-account')
      }
    }
  }

  // handle OTP
  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await loginWithCredentials({
      email: form.getValues('email'),
      password: form.getValues('password'),
      token: otp,
    })

    if (response?.error) {
      toast.error(response?.message)
    } else {
      router.push('/my-account')
    }
  }

  // get email value that can be passed to password reset
  const email = form.watch('email')

  return (
    <main className='flex justify-center items-center min-h-screen'>
      {step === 1 && (
        <Card className='w-87.5'>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id='login-form'
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
                          type='email'
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
                          id='password'
                          aria-invalid={fieldState.invalid}
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
                      form='login-form'
                      className='cursor-pointer'
                    >
                      Login
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
          <CardFooter className='flex-col gap-2'>
            <div className='text-muted-foreground text-sm'>
              Don't have an account?{' '}
              <Link
                href='/register'
                className='underline'
              >
                Register
              </Link>
            </div>
            <div className='text-muted-foreground text-sm'>
              Forgot Password?{' '}
              <Link
                href={`/password-reset${
                  email ? `?email=${encodeURIComponent(email)}` : ''
                }`}
                className='underline'
              >
                Reset my password
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
      {step === 2 && (
        <Card className='w-87.5'>
          <CardHeader>
            <CardTitle>One-Time Passcode</CardTitle>
            <CardDescription>
              Enter the one-time passcode for Next-Auth-2025 that displayed in
              your Google Authenticator App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleOTPSubmit}
              className='flex flex-col gap-2'
            >
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                disabled={otp.length !== 6}
                type='submit'
                className='disabled:cursor-not-allowed disabled:pointer-events-auto cursor-pointer'
              >
                Verify OTP
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

export default Login
