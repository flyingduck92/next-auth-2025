'use client'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { PasswordInput } from '@/components/ui/password-input'
import { passwordMatchSchema } from '@/validation/passwordMatchSchema'
import { passwordSchema } from '@/validation/passwordSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { changePassword } from './actions'
import { toast } from 'sonner'

const formSchema = z
  .object({
    currentPassword: passwordSchema,
  })
  .and(passwordMatchSchema)

export default function ChangePasswordForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const { currentPassword, password, passwordConfirm } = data

    const response = await changePassword({
      currentPassword,
      password,
      passwordConfirm,
    })

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

  return (
    <form
      id='change-password-form'
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldSet disabled={form.formState.isSubmitting}>
        <FieldGroup className='flex flex-col gap-2'>
          <Controller
            name='currentPassword'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='currentPassword'>
                  Current Password
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
              className='cursor-pointer'
              form='change-password-form'
            >
              Change Password
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
