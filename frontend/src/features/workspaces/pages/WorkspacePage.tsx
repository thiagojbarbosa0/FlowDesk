import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import { useCreateLabel, useDeleteLabel, useLabels, useWorkspace } from '../hooks'
import { useCreateProject, useDeleteProject, useProjects } from '@/features/boards/hooks'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { projectSchema, labelSchema, type ProjectForm, type LabelForm } from '@/lib/schemas'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label, Textarea } from '@/components/ui'
import { Dialog } from '@/components/Dialog'
import { EmptyState, ErrorState, PageSpinner } from '@/components/States'
import { useUIStore } from '@/stores/uiStore'

const LABEL_COLORS = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#0891b2', '#ef4444', '#64748b']

function LabelsPanel({ workspaceId }: { workspaceId: number }) {
  const { data: labels } = useLabels(workspaceId)
  const createLabel = useCreateLabel(workspaceId)
  const deleteLabel = useDeleteLabel(workspaceId)
  const form = useForm<LabelForm>({ resolver: zodResolver(labelSchema), defaultValues: { name: '', color: LABEL_COLORS[0] } })

  function onSubmit(values: LabelForm) {
    createLabel.mutate(values, { onSuccess: () => form.reset({ name: '', color: values.color }) })
  }

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-slate-700">Etiquetas do workspace</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {labels?.map((l) => (
          <span
            key={l.id}
            className="flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: l.color ?? '#64748b' }}
          >
            {l.name}
            <button onClick={() => deleteLabel.mutate(l.id)} className="text-white/80 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {(labels?.length ?? 0) === 0 && <p className="text-xs text-slate-400">Nenhuma etiqueta criada ainda.</p>}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="label-name">Nova etiqueta</Label>
          <Input id="label-name" placeholder="Ex.: Bug" className="w-40" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div className="flex gap-1.5 pb-2">
          {LABEL_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => form.setValue('color', c)}
              className="h-6 w-6 rounded-full ring-offset-2 transition-shadow"
              style={{ backgroundColor: c, boxShadow: form.watch('color') === c ? `0 0 0 2px ${c}` : undefined }}
              aria-label={c}
            />
          ))}
        </div>
        <Button type="submit" size="sm" loading={createLabel.isPending}>
          Adicionar
        </Button>
      </form>
    </div>
  )
}

export function WorkspacePage() {
  const workspaceId = Number(useParams().workspaceId)
  const { data: workspace } = useWorkspace(workspaceId)
  const { data, isLoading, isError, refetch } = useProjects(workspaceId)
  const [open, setOpen] = useState(false)
  const create = useCreateProject(workspaceId)
  const remove = useDeleteProject(workspaceId)
  const toast = useUIStore((s) => s.toast)

  const form = useForm<ProjectForm>({ resolver: zodResolver(projectSchema), defaultValues: { name: '', description: '' } })

  function onSubmit(values: ProjectForm) {
    create.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
        toast('Projeto criado com sucesso.')
      },
    })
  }

  function handleDelete(id: number) {
    if (!confirm('Excluir este projeto? Todos os quadros associados serão removidos.')) return
    remove.mutate(id, { onSuccess: () => toast('Projeto excluído.') })
  }

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceTabs workspaceId={workspaceId} name={workspace?.name} />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Projetos</h2>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Novo projeto
          </Button>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar os projetos." onRetry={refetch} />
        ) : (data?.data.length ?? 0) === 0 ? (
          <EmptyState
            title="Nenhum projeto ainda"
            description="Crie um projeto para começar a organizar seus quadros Kanban."
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Criar projeto
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <Link to={`/p/${p.id}`} className="block">
                  <h3 className="mb-1 font-semibold text-slate-800">{p.name}</h3>
                  {p.description && <p className="mb-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>}
                  <p className="text-xs text-slate-400">{p.boards_count ?? 0} quadro(s)</p>
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="absolute right-3 top-3 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  aria-label="Excluir projeto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <LabelsPanel workspaceId={workspaceId} />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo projeto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {create.isError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorToMessage(create.error)}</p>
          )}
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Website institucional" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea id="description" rows={3} {...form.register('description')} />
            <FieldError message={form.formState.errors.description?.message} />
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
