import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginSchema, type LoginForm } from '@/lib/schemas'
import { useLogin } from '../hooks'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label } from '@/components/ui'

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-1 text-xl font-bold">Entrar no FlowDesk</h1>
        <p className="mb-6 text-sm text-slate-500">Gestão de projetos colaborativa com Kanban.</p>

        {login.isError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiErrorToMessage(login.error)}
          </p>
        )}

        <form
          onSubmit={form.handleSubmit((values) =>
            login.mutate(values, { onSuccess: () => navigate(location.state?.from ?? '/') }),
          )}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...form.register('password')} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" loading={login.isPending}>
            Entrar
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-slate-500">
          <Link to="/register" className="text-indigo-600 hover:underline">Cadastre-se</Link>
          <Link to="/forgot-password" className="text-indigo-600 hover:underline">Esqueci a senha</Link>
        </div>
        <p className="mt-4 rounded bg-slate-50 p-2 text-center text-xs text-slate-500">
          Demo: <code>owner@flowdesk.test</code> / <code>password</code>
        </p>
      </div>
    </div>
  )
}
