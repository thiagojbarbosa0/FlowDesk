import { create } from 'zustand'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface UIState {
  sidebarOpen: boolean
  toasts: Toast[]
  toggleSidebar: () => void
  toast: (message: string, type?: Toast['type']) => void
}

/**
 * Zustand = SOMENTE estado de UI (sidebar, toasts).
 * Dados do servidor vivem no TanStack Query — nunca aqui.
 */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toast: (message, type = 'success') => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
}))
