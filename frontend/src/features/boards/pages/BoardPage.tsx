import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, MessageSquare, Plus, Trash2 } from 'lucide-react'
import {
  useBoard,
  useCreateCard,
  useCreateColumn,
  useDeleteColumn,
  useMoveCard,
  useUpdateColumn,
} from '../hooks'
import { CardDetailDialog } from '../components/CardDetailDialog'
import { AvatarGroup, Button, Input } from '@/components/ui'
import { ErrorState, PageSpinner } from '@/components/States'
import { cn, formatDate, isOverdue, priorityDot } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import type { BoardColumn, CardLight } from '@/types/api'

function CardMini({ card, onOpen }: { card: CardLight; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card:${card.id}`,
    data: { type: 'card', cardId: card.id, columnId: card.column_id },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        'cursor-pointer rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-40',
      )}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((l) => (
            <span
              key={l.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: l.color ?? '#64748b' }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}
      <p className="mb-2 text-sm font-medium text-slate-800">{card.title}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', priorityDot[card.priority])} />
          {card.due_date && (
            <span className={cn(isOverdue(card.due_date) && 'font-medium text-red-600')}>
              {formatDate(card.due_date)}
            </span>
          )}
          {(card.comments_count ?? 0) > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" /> {card.comments_count}
            </span>
          )}
        </div>
        <AvatarGroup users={card.assignees} />
      </div>
    </div>
  )
}

function ColumnView({
  column,
  boardId,
  onOpenCard,
}: {
  column: BoardColumn
  boardId: number
  onOpenCard: (id: number) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}`, data: { type: 'column', columnId: column.id } })
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(column.name)
  const createCard = useCreateCard(boardId)
  const updateColumn = useUpdateColumn(boardId)
  const deleteColumn = useDeleteColumn(boardId)
  const toast = useUIStore((s) => s.toast)

  function submitCard() {
    const value = title.trim()
    if (!value) {
      setAdding(false)
      return
    }
    createCard.mutate(
      { columnId: column.id, title: value },
      {
        onSuccess: () => {
          setTitle('')
          setAdding(false)
        },
      },
    )
  }

  function submitRename() {
    setRenaming(false)
    const value = name.trim()
    if (!value || value === column.name) {
      setName(column.name)
      return
    }
    updateColumn.mutate({ id: column.id, name: value })
  }

  function handleDelete() {
    if (!confirm(`Excluir a coluna "${column.name}"?`)) return
    deleteColumn.mutate(column.id, {
      onError: (err) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível excluir a coluna.', 'error'),
    })
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-slate-100">
      <div className="flex items-center justify-between px-3 py-2">
        {renaming ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            className="h-7 py-1 text-sm"
          />
        ) : (
          <h3 className="cursor-text text-sm font-semibold text-slate-700" onClick={() => setRenaming(true)}>
            {column.name} <span className="font-normal text-slate-400">({column.cards.length})</span>
          </h3>
        )}
        <button onClick={handleDelete} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <SortableContext items={column.cards.map((c) => `card:${c.id}`)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn('flex min-h-[40px] flex-1 flex-col gap-2 px-2 pb-2', isOver && 'bg-indigo-50/60')}
        >
          {column.cards.map((card) => (
            <CardMini key={card.id} card={card} onOpen={() => onOpenCard(card.id)} />
          ))}
        </div>
      </SortableContext>

      <div className="p-2">
        {adding ? (
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="Título do card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCard()
                if (e.key === 'Escape') setAdding(false)
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={submitCard} loading={createCard.isPending}>
                Adicionar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-200"
          >
            <Plus className="h-4 w-4" /> Adicionar card
          </button>
        )}
      </div>
    </div>
  )
}

export function BoardPage() {
  const boardId = Number(useParams().boardId)
  const { data: board, isLoading, isError, refetch } = useBoard(boardId)
  const moveCard = useMoveCard(boardId)
  const createColumn = useCreateColumn(boardId)
  const [activeCard, setActiveCard] = useState<CardLight | null>(null)
  const [openCardId, setOpenCardId] = useState<number | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [columnName, setColumnName] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const cardsIndex = useMemo(() => {
    const map = new Map<number, CardLight>()
    board?.columns.forEach((col) => col.cards.forEach((c) => map.set(c.id, c)))
    return map
  }, [board])

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { cardId?: number } | undefined
    if (data?.cardId) setActiveCard(cardsIndex.get(data.cardId) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over || !board) return

    const activeData = active.data.current as { cardId: number; columnId: number }
    const overData = over.data.current as { type: 'card' | 'column'; cardId?: number; columnId: number } | undefined
    if (!overData) return

    const sourceColumn = board.columns.find((c) => c.id === activeData.columnId)
    if (!sourceColumn) return

    const targetColumnId = overData.columnId
    const targetColumn = board.columns.find((c) => c.id === targetColumnId)
    if (!targetColumn) return

    // Índice calculado sobre a lista de destino SEM o card ativo,
    // espelhando a semântica do backend (ver MoveCardAction).
    const targetCardsWithoutActive = targetColumn.cards.filter((c) => c.id !== activeData.cardId)
    const position =
      overData.type === 'column'
        ? targetCardsWithoutActive.length
        : Math.max(0, targetCardsWithoutActive.findIndex((c) => c.id === overData.cardId))

    moveCard.mutate({ cardId: activeData.cardId, columnId: targetColumnId, position })
  }

  function submitColumn() {
    const value = columnName.trim()
    if (!value) {
      setAddingColumn(false)
      return
    }
    createColumn.mutate(
      { name: value },
      {
        onSuccess: () => {
          setColumnName('')
          setAddingColumn(false)
        },
      },
    )
  }

  if (isLoading) return <PageSpinner />
  if (isError || !board) return <div className="p-6"><ErrorState message="Não foi possível carregar o quadro." onRetry={refetch} /></div>

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          {board.workspace_id && (
            <Link
              to={`/p/${board.project_id}`}
              className="mb-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao projeto
            </Link>
          )}
          <h1 className="text-xl font-bold text-slate-800">{board.name}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full items-start gap-4">
            {board.columns.map((col) => (
              <ColumnView key={col.id} column={col} boardId={boardId} onOpenCard={setOpenCardId} />
            ))}

            <div className="w-72 shrink-0">
              {addingColumn ? (
                <div className="space-y-2 rounded-lg bg-slate-100 p-3">
                  <Input
                    autoFocus
                    placeholder="Nome da coluna"
                    value={columnName}
                    onChange={(e) => setColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitColumn()
                      if (e.key === 'Escape') setAddingColumn(false)
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitColumn} loading={createColumn.isPending}>
                      Adicionar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingColumn(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="flex w-full items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" /> Adicionar coluna
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="w-72 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-sm font-medium text-slate-800">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {openCardId && (
        <CardDetailDialog
          cardId={openCardId}
          boardId={boardId}
          workspaceId={board.workspace_id}
          onClose={() => setOpenCardId(null)}
        />
      )}
    </div>
  )
}
