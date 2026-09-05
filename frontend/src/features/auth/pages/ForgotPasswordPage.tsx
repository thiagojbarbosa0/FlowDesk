import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/lib/schemas'
import { useForgotPassword } from '../hooks'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label } from '@/components/ui'

export function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  const [sent, setSent] = useState(false)
  const form = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-1 text-xl font-bold">Recuperar senha</h1>
        <p className="mb-6 text-sm text-slate-500">Informe seu e-mail para receber o link de redefinição.</p>

        {sent ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Se o e-mail existir, um link de recuperação foi enviado.
          </p>
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => forgot.mutate(values, { onSuccess: () => setSent(true) }))}
            className="space-y-4"
          >
            {forgot.isError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorToMessage(forgot.error)}
              </p>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...form.register('email')} />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
            <Button type="submit" className="w-full" loading={forgot.isPending}>
              Enviar link
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="text-indigo-600 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
