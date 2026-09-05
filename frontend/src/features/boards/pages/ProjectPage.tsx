import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LayoutGrid, Plus, Trash2 } from 'lucide-react'
import { useBoards, useCreateBoard, useDeleteBoard, useProject } from '../hooks'
import { boardSchema, type BoardForm } from '@/lib/schemas'
import { apiErrorToMessage } from '@/lib/api'
import { Button, FieldError, Input, Label } from '@/components/ui'
import { Dialog } from '@/components/Dialog'
import { EmptyState, ErrorState, PageSpinner } from '@/components/States'
import { useUIStore } from '@/stores/uiStore'

export function ProjectPage() {
  const projectId = Number(useParams().projectId)
  const { data: project } = useProject(projectId)
  const { data, isLoading, isError, refetch } = useBoards(projectId)
  const [open, setOpen] = useState(false)
  const create = useCreateBoard(projectId)
  const remove = useDeleteBoard(projectId)
  const toast = useUIStore((s) => s.toast)

  const form = useForm<BoardForm>({ resolver: zodResolver(boardSchema), defaultValues: { name: '' } })

  function onSubmit(values: BoardForm) {
    create.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
        toast('Quadro criado com sucesso.')
      },
    })
  }

  function handleDelete(id: number) {
    if (!confirm('Excluir este quadro? Todas as colunas e cards serão removidos.')) return
    remove.mutate(id, { onSuccess: () => toast('Quadro excluído.') })
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          {project && (
            <Link
              to={`/w/${project.workspace_id}`}
              className="mb-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao workspace
            </Link>
          )}
          <h1 className="text-xl font-bold text-slate-800">{project?.name ?? 'Projeto'}</h1>
          {project?.description && <p className="text-sm text-slate-500">{project.description}</p>}
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo quadro
        </Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <ErrorState message="Não foi possível carregar os quadros." onRetry={refetch} />
      ) : (data?.data.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhum quadro ainda"
          description="Crie um quadro Kanban para começar a organizar as tarefas do projeto."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Criar quadro
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((b) => (
            <div
              key={b.id}
              className="group relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link to={`/b/${b.id}`} className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">{b.name}</h3>
              </Link>
              <button
                onClick={() => handleDelete(b.id)}
                className="absolute right-3 top-3 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                aria-label="Excluir quadro"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo quadro">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {create.isError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorToMessage(create.error)}</p>
          )}
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Sprint 1" {...form.register('name')} />
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
