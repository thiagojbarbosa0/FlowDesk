import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Plus, Users2 } from 'lucide-react'
import { useCreateWorkspace, useWorkspaces } from '../hooks'
import { workspaceSchema, type WorkspaceForm } from '@/lib/schemas'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label } from '@/components/ui'
import { Dialog } from '@/components/Dialog'
import { EmptyState, ErrorState, PageSpinner } from '@/components/States'
import { useUIStore } from '@/stores/uiStore'
import { roleLabel } from '@/lib/utils'

export function WorkspacesPage() {
  const { data, isLoading, isError, refetch } = useWorkspaces()
  const [open, setOpen] = useState(false)
  const create = useCreateWorkspace()
  const toast = useUIStore((s) => s.toast)

  const form = useForm<WorkspaceForm>({ resolver: zodResolver(workspaceSchema), defaultValues: { name: '' } })

  function onSubmit(values: WorkspaceForm) {
    create.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
        toast('Workspace criado com sucesso.')
      },
    })
  }

  if (isLoading) return <PageSpinner />
  if (isError) return <div className="p-6"><ErrorState message="Não foi possível carregar seus workspaces." onRetry={refetch} /></div>

  const workspaces = data?.data ?? []

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Seus workspaces</h1>
          <p className="text-sm text-slate-500">Organize projetos e quadros em times.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <EmptyState
          title="Nenhum workspace ainda"
          description="Crie o primeiro workspace para começar a organizar seus projetos."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Criar workspace
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/w/${ws.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="mb-1 font-semibold text-slate-800">{ws.name}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{ws.projects_count ?? 0} projeto(s)</span>
                <span className="flex items-center gap-1">
                  <Users2 className="h-3.5 w-3.5" /> {ws.members_count ?? 0}
                </span>
                {ws.role && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5">{roleLabel[ws.role]}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo workspace">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {create.isError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorToMessage(create.error)}</p>
          )}
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Marketing" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending}>
              Criar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
