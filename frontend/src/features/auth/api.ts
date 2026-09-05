import { api } from '@/lib/api'
import type { User } from '@/types/api'

export function loginRequest(payload: { email: string; password: string }) {
  return api.post<{ user: User; token: string }>('/login', payload).then((r) => r.data)
}

export function registerRequest(payload: {
  name: string
  email: string
  password: string
  password_confirmation: string
}) {
  return api.post<{ user: User; token: string }>('/register', payload).then((r) => r.data)
}

export function logoutRequest() {
  return api.post('/logout')
}

export function meRequest(): Promise<User | null> {
  if (!localStorage.getItem('flowdesk.token')) return Promise.resolve(null)
  return api.get<{ data: User }>('/user').then((r) => r.data.data)
}

export function forgotPasswordRequest(payload: { email: string }) {
  return api.post<{ message: string }>('/forgot-password', payload).then((r) => r.data)
}

export function resetPasswordRequest(payload: { token: string; email: string; password: string }) {
  return api.post<{ message: string }>('/reset-password', payload).then((r) => r.data)
}
