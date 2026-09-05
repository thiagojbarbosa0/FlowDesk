import { api } from '@/lib/api'
import type { BoardColumn, BoardData, CardDetail, Comment, Paginated, Project } from '@/types/api'

// ---- Projects ----
export function listProjectsRequest(workspaceId: number) {
  return api.get<Paginated<Project>>(`/workspaces/${workspaceId}/projects`).then((r) => r.data)
}

export function createProjectRequest(workspaceId: number, payload: { name: string; description?: string }) {
  return api.post<{ data: Project }>(`/workspaces/${workspaceId}/projects`, payload).then((r) => r.data.data)
}

export function getProjectRequest(id: number) {
  return api.get<{ data: Project }>(`/projects/${id}`).then((r) => r.data.data)
}

export function updateProjectRequest(id: number, payload: { name?: string; description?: string }) {
  return api.put<{ data: Project }>(`/projects/${id}`, payload).then((r) => r.data.data)
}

export function deleteProjectRequest(id: number) {
  return api.delete(`/projects/${id}`)
}

// ---- Boards ----
export function listBoardsRequest(projectId: number) {
  return api.get<Paginated<BoardData>>(`/projects/${projectId}/boards`).then((r) => r.data)
}

export function createBoardRequest(projectId: number, payload: { name: string }) {
  return api.post<{ data: BoardData }>(`/projects/${projectId}/boards`, payload).then((r) => r.data.data)
}

export function getBoardRequest(id: number) {
  return api.get<{ data: BoardData }>(`/boards/${id}`).then((r) => r.data.data)
}

export function updateBoardRequest(id: number, payload: { name: string }) {
  return api.put<{ data: BoardData }>(`/boards/${id}`, payload).then((r) => r.data.data)
}

export function deleteBoardRequest(id: number) {
  return api.delete(`/boards/${id}`)
}

// ---- Columns ----
export function createColumnRequest(boardId: number, payload: { name: string }) {
  return api.post<{ data: BoardColumn }>(`/boards/${boardId}/columns`, payload).then((r) => r.data.data)
}

export function updateColumnRequest(id: number, payload: { name?: string }) {
  return api.put<{ data: BoardColumn }>(`/columns/${id}`, payload).then((r) => r.data.data)
}

export function deleteColumnRequest(id: number) {
  return api.delete(`/columns/${id}`)
}

// ---- Cards ----
export function createCardRequest(
  columnId: number,
  payload: { title: string; description?: string; priority?: string; due_date?: string },
) {
  return api.post<{ data: CardDetail }>(`/columns/${columnId}/cards`, payload).then((r) => r.data.data)
}

export function getCardRequest(id: number) {
  return api.get<{ data: CardDetail }>(`/cards/${id}`).then((r) => r.data.data)
}

export function updateCardRequest(
  id: number,
  payload: Partial<{ title: string; description: string | null; priority: string; due_date: string | null }>,
) {
  return api.put<{ data: CardDetail }>(`/cards/${id}`, payload).then((r) => r.data.data)
}

export function deleteCardRequest(id: number) {
  return api.delete(`/cards/${id}`)
}

export function moveCardRequest(id: number, payload: { column_id: number; position: number }) {
  return api.post<{ data: BoardData }>(`/cards/${id}/move`, payload).then((r) => r.data.data)
}

export function assignCardRequest(cardId: number, userId: number) {
  return api.post<{ data: CardDetail }>(`/cards/${cardId}/assignees`, { user_id: userId }).then((r) => r.data.data)
}

export function unassignCardRequest(cardId: number, userId: number) {
  return api.delete<{ data: CardDetail }>(`/cards/${cardId}/assignees/${userId}`).then((r) => r.data.data)
}

export function attachLabelRequest(cardId: number, labelId: number) {
  return api.post<{ data: CardDetail }>(`/cards/${cardId}/labels`, { label_id: labelId }).then((r) => r.data.data)
}

export function detachLabelRequest(cardId: number, labelId: number) {
  return api.delete<{ data: CardDetail }>(`/cards/${cardId}/labels/${labelId}`).then((r) => r.data.data)
}

// ---- Comments ----
export function listCommentsRequest(cardId: number) {
  return api.get<Paginated<Comment>>(`/cards/${cardId}/comments`).then((r) => r.data)
}

export function createCommentRequest(cardId: number, payload: { body: string }) {
  return api.post<{ data: Comment }>(`/cards/${cardId}/comments`, payload).then((r) => r.data.data)
}
