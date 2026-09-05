import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { useMe } from '@/features/auth/hooks'
import { WorkspacesPage } from '@/features/workspaces/pages/WorkspacesPage'
import { WorkspacePage } from '@/features/workspaces/pages/WorkspacePage'
import { MembersPage } from '@/features/workspaces/pages/MembersPage'
import { DashboardPage } from '@/features/workspaces/pages/DashboardPage'
import { ProjectPage } from '@/features/boards/pages/ProjectPage'
import { BoardPage } from '@/features/boards/pages/BoardPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'

function Guard({ authRequired }: { authRequired: boolean }) {
  const { data, isLoading } = useMe()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const authenticated = Boolean(data)

  if (authRequired && !authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!authRequired && authenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <Guard authRequired={false} />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <Guard authRequired />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <WorkspacesPage /> },
          { path: '/w/:workspaceId', element: <WorkspacePage /> },
          { path: '/w/:workspaceId/members', element: <MembersPage /> },
          { path: '/w/:workspaceId/dashboard', element: <DashboardPage /> },
          { path: '/p/:projectId', element: <ProjectPage /> },
          { path: '/b/:boardId', element: <BoardPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])
