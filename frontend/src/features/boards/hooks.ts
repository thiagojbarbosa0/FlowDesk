import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import type { BoardData } from '@/types/api'
import {
  assignCardRequest,
  attachLabelRequest,
  createBoardRequest,
  createCardRequest,
  createColumnRequest,
  createCommentRequest,
  createProjectRequest,
  deleteBoardRequest,
  deleteCardRequest,
  deleteColumnRequest,
  deleteProjectRequest,
  detachLabelRequest,
  getBoardRequest,
  getCardRequest,
  getProjectRequest,
  listBoardsRequest,
  listCommentsRequest,
  listProjectsRequest,
  moveCardRequest,
  unassignCardRequest,
  updateBoardRequest,
  updateCardRequest,
  updateColumnRequest,
  updateProjectRequest,
} from './api'

// ---- Projects ----
export function useProjects(workspaceId: number) {
  return useQuery({
    queryKey: qk.projects(workspaceId),
    queryFn: () => listProjectsRequest(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useProject(id: number) {
  return useQuery({ queryKey: qk.project(id), queryFn: () => getProjectRequest(id), enabled: !!id })
}

export function useCreateProject(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createProjectRequest(workspaceId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects(workspaceId) }),
  })
}

export function useUpdateProject(id: number, workspaceId?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string }) => updateProjectRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.project(id) })
      if (workspaceId) qc.invalidateQueries({ queryKey: qk.projects(workspaceId) })
    },
  })
}

export function useDeleteProject(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProjectRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects(workspaceId) }),
  })
}

// ---- Boards ----
export function useBoards(projectId: number) {
  return useQuery({
    queryKey: qk.boards(projectId),
    queryFn: () => listBoardsRequest(projectId),
    enabled: !!projectId,
  })
}

export function useBoard(id: number) {
  return useQuery({ queryKey: qk.board(id), queryFn: () => getBoardRequest(id), enabled: !!id })
}

export function useCreateBoard(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string }) => createBoardRequest(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.boards(projectId) }),
  })
}

export function useUpdateBoard(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string }) => updateBoardRequest(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.board(id) }),
  })
}

export function useDeleteBoard(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBoardRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.boards(projectId) }),
  })
}

// ---- Columns ----
export function useCreateColumn(boardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string }) => createColumnRequest(boardId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.board(boardId) }),
  })
}

export function useUpdateColumn(boardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateColumnRequest(id, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.board(boardId) }),
  })
}

export function useDeleteColumn(boardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteColumnRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.board(boardId) }),
  })
}

// ---- Cards ----
export function useCreateCard(boardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      columnId,
      ...payload
    }: {
      columnId: number
      title: string
      description?: string
      priority?: string
      due_date?: string
    }) => createCardRequest(columnId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.board(boardId) }),
  })
}

export function useCard(id: number) {
  return useQuery({ queryKey: qk.card(id), queryFn: () => getCardRequest(id), enabled: !!id })
}

export function useUpdateCard(boardId: number, cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateCardRequest>[1]) => updateCardRequest(cardId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
    },
  })
}

export function useDeleteCard(boardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCardRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.board(boardId) }),
  })
}

/**
 * Move de card com atualização otimista do board (drag-and-drop fluido).
 * Em caso de erro, o cache é revertido para o snapshot anterior.
 */
export function useMoveCard(boardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, columnId, position }: { cardId: number; columnId: number; position: number }) =>
      moveCardRequest(cardId, { column_id: columnId, position }),
    onMutate: async ({ cardId, columnId, position }) => {
      await qc.cancelQueries({ queryKey: qk.board(boardId) })
      const previous = qc.getQueryData<BoardData>(qk.board(boardId))

      if (previous) {
        const next: BoardData = structuredClone(previous)
        let moving = null
        for (const col of next.columns) {
          const idx = col.cards.findIndex((c) => c.id === cardId)
          if (idx !== -1) {
            ;[moving] = col.cards.splice(idx, 1)
            break
          }
        }
        if (moving) {
          moving.column_id = columnId
          const target = next.columns.find((c) => c.id === columnId)
          if (target) {
            target.cards.splice(Math.min(position, target.cards.length), 0, moving)
          }
        }
        qc.setQueryData(qk.board(boardId), next)
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.board(boardId), context.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.board(boardId) }),
  })
}

export function useAssignCard(boardId: number, cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => assignCardRequest(cardId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
    },
  })
}

export function useUnassignCard(boardId: number, cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => unassignCardRequest(cardId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
    },
  })
}

export function useAttachLabel(boardId: number, cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (labelId: number) => attachLabelRequest(cardId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
    },
  })
}

export function useDetachLabel(boardId: number, cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (labelId: number) => detachLabelRequest(cardId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
    },
  })
}

// ---- Comments ----
export function useComments(cardId: number) {
  return useQuery({ queryKey: qk.comments(cardId), queryFn: () => listCommentsRequest(cardId), enabled: !!cardId })
}

export function useCreateComment(cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => createCommentRequest(cardId, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.comments(cardId) })
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
    },
  })
}
