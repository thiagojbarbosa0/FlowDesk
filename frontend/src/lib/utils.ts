import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | null): string | null {
  if (!value) return null
  return format(parseISO(value), 'dd MMM', { locale: ptBR })
}

export function formatDateTime(value?: string | null): string | null {
  if (!value) return null
  return format(parseISO(value), "dd MMM 'às' HH:mm", { locale: ptBR })
}

export function isOverdue(due?: string | null): boolean {
  return !!due && isPast(parseISO(due))
}

export const priorityLabel: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export const priorityDot: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

export const roleLabel: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}
