import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TOKEN_KEY } from '@/lib/api'
import { qk } from '@/lib/queryKeys'
import {
  forgotPasswordRequest, loginRequest, logoutRequest, meRequest,
  registerRequest, resetPasswordRequest,
} from './api'

export function useMe() {
  return useQuery({ queryKey: qk.me, queryFn: meRequest, retry: false, staleTime: 60_000 })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token)
      qc.setQueryData(qk.me, data.user)
    },
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token)
      qc.setQueryData(qk.me, data.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      localStorage.removeItem(TOKEN_KEY)
      qc.clear() // cache de server state é descartado no logout
    },
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPasswordRequest })
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPasswordRequest })
}
