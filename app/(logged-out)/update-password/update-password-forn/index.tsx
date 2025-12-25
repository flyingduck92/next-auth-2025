'use client'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { passwordMatchSchema } from '@/validation/passwordMatchSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { updatePassword } from './actions'
import Link from 'next/link'

const formSchema = passwordMatchSchema

type TokenProps = {
  token: string
}

function UpdatePasswordForm({ token }: TokenProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const { password, passwordConfirm } = data

    const response = await updatePassword({
      token,
      password,
      passwordConfirm,
    })

    // if token invalid exists, reload the page
    if (response?.tokenInvalid) {
      window.location.reload()
    }

    if (response?.error) {
      form.setError('root', {
        message: response.message,
      })
    } else {
      toast.success('Password changed', {
        description: 'Your password has been updated.',
      })
      form.reset()
    }
  }

  return form.formState.isSubmitSuccessful ? (
    <div>
      Your password has been updated!
      <Link
        className='underline block'
        href='/login'
      >
        Click here to login to your account
      </Link>
    </div>
  ) : (
    <form
      id='update-password-form'
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldSet disabled={form.formState.isSubmitting}>
        <FieldGroup className='flex flex-col gap-2'>
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='password'>New Password</FieldLabel>
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
                  New Password Confirm
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
            {form.formState.errors.root?.message && (
              <FieldError errors={[form.formState.errors.root]} />
            )}
            <Button
              type='submit'
              form='update-password-form'
              className='cursor-pointer'
            >
              Update Password
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export default UpdatePasswordForm
