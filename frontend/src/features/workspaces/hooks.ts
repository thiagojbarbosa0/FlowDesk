import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import type { Role } from '@/types/api'
import {
  addMemberRequest,
  createLabelRequest,
  createWorkspaceRequest,
  deleteLabelRequest,
  deleteWorkspaceRequest,
  getDashboardRequest,
  getWorkspaceRequest,
  listActivitiesRequest,
  listLabelsRequest,
  listMembersRequest,
  listWorkspacesRequest,
  removeMemberRequest,
  updateLabelRequest,
  updateMemberRoleRequest,
  updateWorkspaceRequest,
} from './api'

export function useWorkspaces() {
  return useQuery({ queryKey: qk.workspaces, queryFn: listWorkspacesRequest })
}

export function useWorkspace(id: number) {
  return useQuery({ queryKey: qk.workspace(id), queryFn: () => getWorkspaceRequest(id), enabled: !!id })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWorkspaceRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.workspaces }),
  })
}

export function useUpdateWorkspace(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string }) => updateWorkspaceRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workspaces })
      qc.invalidateQueries({ queryKey: qk.workspace(id) })
    },
  })
}

export function useDeleteWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkspaceRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.workspaces }),
  })
}

export function useMembers(workspaceId: number) {
  return useQuery({
    queryKey: qk.members(workspaceId),
    queryFn: () => listMembersRequest(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useAddMember(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { email: string; role: Role }) => addMemberRequest(workspaceId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(workspaceId) }),
  })
}

export function useUpdateMemberRole(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) =>
      updateMemberRoleRequest(workspaceId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(workspaceId) }),
  })
}

export function useRemoveMember(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => removeMemberRequest(workspaceId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(workspaceId) }),
  })
}

export function useLabels(workspaceId: number) {
  return useQuery({
    queryKey: qk.labels(workspaceId),
    queryFn: () => listLabelsRequest(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useCreateLabel(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) => createLabelRequest(workspaceId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.labels(workspaceId) }),
  })
}

export function useUpdateLabel(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; name?: string; color?: string }) =>
      updateLabelRequest(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.labels(workspaceId) }),
  })
}

export function useDeleteLabel(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteLabelRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.labels(workspaceId) }),
  })
}

export function useDashboard(workspaceId: number) {
  return useQuery({
    queryKey: qk.dashboard(workspaceId),
    queryFn: () => getDashboardRequest(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useActivities(workspaceId: number) {
  return useQuery({
    queryKey: qk.activities(workspaceId),
    queryFn: () => listActivitiesRequest(workspaceId),
    enabled: !!workspaceId,
  })
}
