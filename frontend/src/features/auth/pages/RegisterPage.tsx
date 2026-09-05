import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema, type RegisterForm } from '@/lib/schemas'
import { useRegister } from '../hooks'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label } from '@/components/ui'

export function RegisterPage() {
  const register = useRegister()
  const navigate = useNavigate()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-bold">Criar conta</h1>

        {register.isError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiErrorToMessage(register.error)}
          </p>
        )}

        <form
          onSubmit={form.handleSubmit((values) => register.mutate(values, { onSuccess: () => navigate('/') }))}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
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
          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" type="password" {...form.register('password_confirmation')} />
            <FieldError message={form.formState.errors.password_confirmation?.message} />
          </div>
          <Button type="submit" className="w-full" loading={register.isPending}>
            Criar conta
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta? <Link to="/login" className="text-indigo-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
