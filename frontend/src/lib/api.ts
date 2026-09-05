import axios, { AxiosError } from 'axios'

export const TOKEN_KEY = 'flowdesk.token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 em qualquer chamada => sessão inválida => volta ao login.
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

/** Extrai a mensagem mais amigável possível de um erro da API (422 etc). */
export function apiErrorToMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first?.[0]) return first[0]
    }
    return data?.message ?? 'Erro de comunicação com o servidor.'
  }
  return 'Ocorreu um erro inesperado.'
}
