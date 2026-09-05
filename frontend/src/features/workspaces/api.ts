import { api } from '@/lib/api'
import type { Activity, Dashboard, Label, Member, Paginated, Role, Workspace } from '@/types/api'

export function listWorkspacesRequest() {
  return api.get<Paginated<Workspace>>('/workspaces').then((r) => r.data)
}

export function createWorkspaceRequest(payload: { name: string }) {
  return api.post<{ data: Workspace }>('/workspaces', payload).then((r) => r.data.data)
}

export function getWorkspaceRequest(id: number) {
  return api.get<{ data: Workspace }>(`/workspaces/${id}`).then((r) => r.data.data)
}

export function updateWorkspaceRequest(id: number, payload: { name: string }) {
  return api.put<{ data: Workspace }>(`/workspaces/${id}`, payload).then((r) => r.data.data)
}

export function deleteWorkspaceRequest(id: number) {
  return api.delete(`/workspaces/${id}`)
}

export function listMembersRequest(workspaceId: number) {
  return api.get<{ data: Member[] }>(`/workspaces/${workspaceId}/members`).then((r) => r.data.data)
}

export function addMemberRequest(workspaceId: number, payload: { email: string; role: Role }) {
  return api.post<{ data: Member }>(`/workspaces/${workspaceId}/members`, payload).then((r) => r.data.data)
}

export function updateMemberRoleRequest(workspaceId: number, userId: number, role: Role) {
  return api
    .put<{ data: Member }>(`/workspaces/${workspaceId}/members/${userId}`, { role })
    .then((r) => r.data.data)
}

export function removeMemberRequest(workspaceId: number, userId: number) {
  return api.delete(`/workspaces/${workspaceId}/members/${userId}`)
}

export function listLabelsRequest(workspaceId: number) {
  return api.get<{ data: Label[] }>(`/workspaces/${workspaceId}/labels`).then((r) => r.data.data)
}

export function createLabelRequest(workspaceId: number, payload: { name: string; color?: string }) {
  return api.post<{ data: Label }>(`/workspaces/${workspaceId}/labels`, payload).then((r) => r.data.data)
}

export function updateLabelRequest(labelId: number, payload: { name?: string; color?: string }) {
  return api.put<{ data: Label }>(`/labels/${labelId}`, payload).then((r) => r.data.data)
}

export function deleteLabelRequest(labelId: number) {
  return api.delete(`/labels/${labelId}`)
}

export function getDashboardRequest(workspaceId: number) {
  return api.get<Dashboard>(`/workspaces/${workspaceId}/dashboard`).then((r) => r.data)
}

export function listActivitiesRequest(workspaceId: number) {
  return api.get<Paginated<Activity>>(`/workspaces/${workspaceId}/activities`).then((r) => r.data)
}
