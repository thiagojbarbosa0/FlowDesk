import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { User } from '@/types/api'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }
>(({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  >
    {loading ? <Spinner className="h-4 w-4" /> : null}
    {children}
  </button>
))
Button.displayName = 'Button'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-600">
      {children}
    </label>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5 animate-spin text-indigo-600', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  )
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {children}
    </span>
  )
}

const AVATAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-600']

export function Avatar({ user, className }: { user: User; className?: string }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = AVATAR_COLORS[user.id % AVATAR_COLORS.length]
  return (
    <span
      title={user.name}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white',
        color,
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function AvatarGroup({ users, max = 3 }: { users: User[]; max?: number }) {
  if (users.length === 0) return null
  const shown = users.slice(0, max)
  return (
    <span className="flex -space-x-1">
      {shown.map((u) => (
        <Avatar key={u.id} user={u} className="ring-2 ring-white" />
      ))}
      {users.length > max && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-[10px] font-semibold text-white ring-2 ring-white">
          +{users.length - max}
        </span>
      )}
    </span>
  )
}
