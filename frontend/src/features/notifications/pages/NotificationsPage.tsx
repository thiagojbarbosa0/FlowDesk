import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks'
import { EmptyState, PageSpinner } from '@/components/States'
import { Button } from '@/components/ui'
import { cn, formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types/api'

function targetPath(n: Notification): string | null {
  if (n.data.board_id) return `/b/${n.data.board_id}`
  if (n.data.workspace_id) return `/w/${n.data.workspace_id}`
  return null
}

export function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const navigate = useNavigate()

  if (isLoading) return <PageSpinner />

  const notifications = data?.data ?? []
  const unread = data?.meta?.unread_count ?? 0

  function handleClick(n: Notification) {
    if (!n.read_at) markRead.mutate(n.id)
    const path = targetPath(n)
    if (path) navigate(path)
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Notificações</h1>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Nenhuma notificação" description="Você está em dia por aqui." />
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleClick(n)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50',
                  !n.read_at && 'bg-indigo-50/60',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    n.read_at ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600',
                  )}
                >
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block', !n.read_at && 'font-medium text-slate-800')}>{n.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{formatDateTime(n.created_at)}</span>
                </span>
                {!n.read_at && <Check className="mt-1 h-4 w-4 shrink-0 text-indigo-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
