import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPasswordSchema, type ResetPasswordForm } from '@/lib/schemas'
import { useResetPassword } from '../hooks'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label } from '@/components/ui'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reset = useResetPassword()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <p className="text-sm text-red-600">Link inválido ou expirado.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-bold">Definir nova senha</h1>

        {reset.isError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiErrorToMessage(reset.error)}
          </p>
        )}

        <form
          onSubmit={form.handleSubmit((values) =>
            reset.mutate({ token, email, password: values.password }, { onSuccess: () => navigate('/login') }),
          )}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" {...form.register('password')} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" type="password" {...form.register('password_confirmation')} />
            <FieldError message={form.formState.errors.password_confirmation?.message} />
          </div>
          <Button type="submit" className="w-full" loading={reset.isPending}>
            Redefinir senha
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="text-indigo-600 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
