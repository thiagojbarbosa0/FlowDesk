import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tag, Trash2, UserPlus, X } from 'lucide-react'
import {
  useAssignCard,
  useAttachLabel,
  useCard,
  useCreateComment,
  useDeleteCard,
  useDetachLabel,
  useUnassignCard,
  useUpdateCard,
} from '../hooks'
import { useLabels, useMembers } from '@/features/workspaces/hooks'
import { commentSchema, type CommentForm } from '@/lib/schemas'
import { Avatar, Button, Select, Spinner, Textarea } from '@/components/ui'
import { cn, formatDateTime, priorityLabel } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import type { Priority } from '@/types/api'

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent']

export function CardDetailDialog({
  cardId,
  boardId,
  workspaceId,
  onClose,
}: {
  cardId: number
  boardId: number
  workspaceId?: number
  onClose: () => void
}) {
  const { data: card, isLoading } = useCard(cardId)
  const { data: members } = useMembers(workspaceId ?? 0)
  const { data: labels } = useLabels(workspaceId ?? 0)
  const updateCard = useUpdateCard(boardId, cardId)
  const deleteCard = useDeleteCard(boardId)
  const assignCard = useAssignCard(boardId, cardId)
  const unassignCard = useUnassignCard(boardId, cardId)
  const attachLabel = useAttachLabel(boardId, cardId)
  const detachLabel = useDetachLabel(boardId, cardId)
  const createComment = useCreateComment(cardId)
  const toast = useUIStore((s) => s.toast)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showAssignPicker, setShowAssignPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description ?? '')
    }
  }, [card])

  const commentForm = useForm<CommentForm>({ resolver: zodResolver(commentSchema), defaultValues: { body: '' } })

  function handleClose() {
    onClose()
  }

  function saveTitle() {
    const value = title.trim()
    if (!card || !value || value === card.title) {
      setTitle(card?.title ?? '')
      return
    }
    updateCard.mutate({ title: value })
  }

  function saveDescription() {
    if (!card || description === (card.description ?? '')) return
    updateCard.mutate({ description: description || null })
  }

  function handleDelete() {
    if (!confirm('Excluir este card?')) return
    deleteCard.mutate(cardId, {
      onSuccess: () => {
        toast('Card excluído.')
        onClose()
      },
    })
  }

  const availableMembers = members?.filter((m) => !card?.assignees.some((a) => a.id === m.user.id)) ?? []
  const availableLabels = labels?.filter((l) => !card?.labels.some((cl) => cl.id === l.id)) ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !card ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                className="w-full flex-1 border-none text-lg font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-300 rounded"
              />
              <div className="flex items-center gap-1">
                <button onClick={handleDelete} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={handleClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Prioridade</label>
                  <Select
                    value={card.priority}
                    onChange={(e) => updateCard.mutate({ priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {priorityLabel[p]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Vencimento</label>
                  <input
                    type="date"
                    value={card.due_date ? card.due_date.slice(0, 10) : ''}
                    onChange={(e) => updateCard.mutate({ due_date: e.target.value || null })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-1 block text-xs font-medium text-slate-500">Descrição</label>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={saveDescription}
                  placeholder="Adicione uma descrição..."
                />
              </div>

              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-500">Responsáveis</label>
                  {workspaceId && (
                    <button
                      onClick={() => setShowAssignPicker((v) => !v)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Adicionar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.assignees.map((u) => (
                    <span
                      key={u.id}
                      className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2 text-xs"
                    >
                      <Avatar user={u} />
                      {u.name}
                      <button onClick={() => unassignCard.mutate(u.id)} className="text-slate-400 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {card.assignees.length === 0 && <p className="text-xs text-slate-400">Ninguém atribuído.</p>}
                </div>
                {showAssignPicker && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableMembers.map((m) => (
                      <button
                        key={m.user.id}
                        onClick={() => {
                          assignCard.mutate(m.user.id)
                          setShowAssignPicker(false)
                        }}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        {m.user.name}
                      </button>
                    ))}
                    {availableMembers.length === 0 && (
                      <p className="text-xs text-slate-400">Todos os membros já foram atribuídos.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-500">Etiquetas</label>
                  {workspaceId && (
                    <button
                      onClick={() => setShowLabelPicker((v) => !v)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                    >
                      <Tag className="h-3.5 w-3.5" /> Adicionar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((l) => (
                    <span
                      key={l.id}
                      className="flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: l.color ?? '#64748b' }}
                    >
                      {l.name}
                      <button onClick={() => detachLabel.mutate(l.id)} className="text-white/80 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {card.labels.length === 0 && <p className="text-xs text-slate-400">Nenhuma etiqueta.</p>}
                </div>
                {showLabelPicker && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableLabels.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          attachLabel.mutate(l.id)
                          setShowLabelPicker(false)
                        }}
                        className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: l.color ?? '#64748b' }}
                      >
                        {l.name}
                      </button>
                    ))}
                    {availableLabels.length === 0 && (
                      <p className="text-xs text-slate-400">Sem etiquetas disponíveis no workspace.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Comentários {card.comments_count ? `(${card.comments_count})` : ''}
                </label>
                <form
                  onSubmit={commentForm.handleSubmit((values) =>
                    createComment.mutate(values.body, { onSuccess: () => commentForm.reset() }),
                  )}
                  className="mb-4 flex gap-2"
                >
                  <input
                    {...commentForm.register('body')}
                    placeholder="Escreva um comentário..."
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Button type="submit" size="sm" loading={createComment.isPending}>
                    Enviar
                  </Button>
                </form>

                <div className="space-y-3">
                  {(card.comments ?? []).map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar user={c.author} className="mt-0.5 h-6 w-6" />
                      <div className={cn('flex-1 rounded-md bg-slate-50 px-3 py-2')}>
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-700">{c.author.name}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTime(c.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-600">{c.body}</p>
                      </div>
                    </div>
                  ))}
                  {(card.comments ?? []).length === 0 && (
                    <p className="text-xs text-slate-400">Nenhum comentário ainda.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
