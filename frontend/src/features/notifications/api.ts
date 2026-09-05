import { api } from '@/lib/api'
import type { Notification, Paginated } from '@/types/api'

export function listNotificationsRequest() {
  return api.get<Paginated<Notification>>('/notifications').then((r) => r.data)
}

export function markNotificationReadRequest(id: number) {
  return api.post<{ data: Notification }>(`/notifications/${id}/read`).then((r) => r.data)
}

export function markAllNotificationsReadRequest() {
  return api.post('/notifications/read-all')
}
