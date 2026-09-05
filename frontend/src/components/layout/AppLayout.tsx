import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, LayoutGrid, LogOut, Menu, X } from 'lucide-react'
import { useMe, useLogout } from '@/features/auth/hooks'
import { useWorkspaces } from '@/features/workspaces/hooks'
import { useNotifications } from '@/features/notifications/hooks'
import { useUIStore } from '@/stores/uiStore'
import { cn, roleLabel } from '@/lib/utils'
import { Toaster } from '@/components/Toaster'
import { Avatar, Badge, Button } from '@/components/ui'

export function AppLayout() {
  const { data: me } = useMe()
  const { data: workspaces } = useWorkspaces()
  const { data: notifications } = useNotifications()
  const logout = useLogout()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const unread = notifications?.meta?.unread_count ?? 0

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white lg:static',
          sidebarOpen ? 'flex' : 'hidden lg:flex',
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <LayoutGrid className="h-5 w-5 text-indigo-600" /> FlowDesk
          </div>
          <button className="lg:hidden" onClick={toggleSidebar}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Workspaces
          </p>
          {workspaces?.data.map((ws) => (
            <NavLink
              key={ws.id}
              to={`/w/${ws.id}`}
              className={({ isActive }) =>
                cn(
                  'mb-1 block rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50',
                )
              }
            >
              <span className="flex items-center justify-between">
                {ws.name}
                {ws.role && (
                  <Badge className="bg-slate-100 text-slate-500">{roleLabel[ws.role]}</Badge>
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          {me && (
            <div className="mb-2 flex items-center gap-2 px-2 text-sm">
              <Avatar user={me} className="h-8 w-8" />
              <div className="min-w-0">
                <p className="truncate font-medium">{me.name}</p>
                <p className="truncate text-xs text-slate-500">{me.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login') })}
          >
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <button className="lg:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </button>
          <div />
          <button
            className="relative rounded-md p-2 hover:bg-slate-100"
            onClick={() => navigate('/notifications')}
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {unread > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  )
}
