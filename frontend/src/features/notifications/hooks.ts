import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import {
  listNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from './api'

export function useNotifications() {
  return useQuery({ queryKey: qk.notifications, queryFn: listNotificationsRequest, refetchInterval: 30_000 })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  })
}
