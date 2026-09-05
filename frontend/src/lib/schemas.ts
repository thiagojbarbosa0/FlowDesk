import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  })

export const workspaceSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100),
})

export const projectSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
  description: z.string().max(2000).optional(),
})

export const boardSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
})

export const columnSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(60),
})

export const cardSchema = z.object({
  title: z.string().min(2, 'Informe um título').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional(),
})

export const commentSchema = z.object({
  body: z.string().min(1, 'Escreva um comentário').max(5000),
})

export const inviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['admin', 'member', 'viewer']),
})

export const labelSchema = z.object({
  name: z.string().min(1, 'Informe o nome').max(50),
  color: z.string().max(20).optional(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
export type WorkspaceForm = z.infer<typeof workspaceSchema>
export type ProjectForm = z.infer<typeof projectSchema>
export type BoardForm = z.infer<typeof boardSchema>
export type ColumnForm = z.infer<typeof columnSchema>
export type CardForm = z.infer<typeof cardSchema>
export type CommentForm = z.infer<typeof commentSchema>
export type InviteForm = z.infer<typeof inviteSchema>
export type LabelForm = z.infer<typeof labelSchema>
