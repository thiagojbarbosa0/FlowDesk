import { useParams } from 'react-router-dom'
import { AlertTriangle, ListChecks, TrendingUp, Users2 } from 'lucide-react'
import { useActivities, useDashboard, useWorkspace } from '../hooks'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { EmptyState, ErrorState, PageSpinner } from '@/components/States'
import { formatDateTime, priorityLabel } from '@/lib/utils'
import type { Priority } from '@/types/api'

const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low']

const ACTION_LABEL: Record<string, string> = {
  card_created: 'criou o card',
  card_updated: 'atualizou o card',
  card_moved: 'moveu o card',
  card_assigned: 'atribuiu o card',
  card_unassigned: 'removeu atribuição do card',
  label_attached: 'adicionou etiqueta ao card',
  comment_created: 'comentou no card',
  board_created: 'criou o quadro',
  project_created: 'criou o projeto',
  workspace_created: 'criou o workspace',
  member_added: 'adicionou um membro',
  member_removed: 'removeu um membro',
  member_role_changed: 'alterou o papel de um membro',
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const workspaceId = Number(useParams().workspaceId)
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: dashboard, isLoading, isError, refetch } = useDashboard(workspaceId)
  const { data: activities } = useActivities(workspaceId)

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceTabs workspaceId={workspaceId} name={workspace?.name} />

      <div className="flex-1 space-y-8 p-6">
        {isLoading ? (
          <PageSpinner />
        ) : isError || !dashboard ? (
          <ErrorState message="Não foi possível carregar o dashboard." onRetry={refetch} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard icon={<ListChecks className="h-5 w-5" />} label="Cards no total" value={dashboard.total} />
              <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Cards atrasados" value={dashboard.overdue} />
              <StatCard
                icon={<Users2 className="h-5 w-5" />}
                label="Colaboradores com cards"
                value={dashboard.by_assignee.length}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Por prioridade</h3>
                <div className="space-y-3">
                  {PRIORITY_ORDER.map((p) => {
                    const count = dashboard.by_priority[p] ?? 0
                    const pct = dashboard.total > 0 ? Math.round((count / dashboard.total) * 100) : 0
                    return (
                      <div key={p}>
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>{priorityLabel[p]}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <TrendingUp className="h-4 w-4" /> Cards por projeto
                </h3>
                {dashboard.by_project.length === 0 ? (
                  <p className="text-sm text-slate-400">Sem dados ainda.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {dashboard.by_project.map((p) => (
                      <li key={p.id} className="flex justify-between border-b border-slate-50 pb-2 last:border-0">
                        <span className="text-slate-700">{p.name}</span>
                        <span className="font-medium text-slate-800">{p.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Cards por responsável</h3>
                {dashboard.by_assignee.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum card atribuído ainda.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    {dashboard.by_assignee.map((a) => (
                      <li key={a.id} className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
                        <span className="text-slate-700">{a.name}</span>
                        <span className="font-medium text-slate-800">{a.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Atividade recente</h3>
          {(activities?.data.length ?? 0) === 0 ? (
            <EmptyState title="Sem atividade ainda" description="As ações no workspace aparecerão aqui." />
          ) : (
            <ul className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
              {activities?.data.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-800">{a.user?.name ?? 'Alguém'}</span>{' '}
                    {ACTION_LABEL[a.action] ?? a.action}
                    <span className="ml-2 text-xs text-slate-400">{formatDateTime(a.created_at)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
