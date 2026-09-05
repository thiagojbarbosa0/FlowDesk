export type Role = 'owner' | 'admin' | 'member' | 'viewer'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface User {
  id: number
  name: string
  email: string
}

export interface Workspace {
  id: number
  name: string
  owner_id: number
  role?: Role
  projects_count?: number
  members_count?: number
  created_at: string
}

export interface Member {
  id: number
  role: Role
  user: User
  created_at: string
}

export interface Project {
  id: number
  workspace_id: number
  name: string
  description: string | null
  boards_count?: number
  created_at: string
}

export interface Label {
  id: number
  workspace_id: number
  name: string
  color: string | null
}

export interface CardLight {
  id: number
  column_id: number
  title: string
  priority: Priority
  due_date: string | null
  position: number
  labels: Label[]
  assignees: User[]
  comments_count?: number
}

export interface BoardColumn {
  id: number
  board_id: number
  name: string
  position: number
  cards: CardLight[]
}

export interface BoardData {
  id: number
  name: string
  project_id: number
  workspace_id?: number
  columns: BoardColumn[]
}

export interface Comment {
  id: number
  card_id: number
  body: string
  author: User
  created_at: string
}

export interface CardDetail {
  id: number
  column_id: number
  board_id?: number
  title: string
  description: string | null
  priority: Priority
  due_date: string | null
  position: number
  created_by: number
  creator?: User
  assignees: User[]
  labels: Label[]
  comments?: Comment[]
  comments_count?: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  type: string
  title: string
  data: { card_id?: number; board_id?: number; workspace_id?: number }
  read_at: string | null
  created_at: string
}

export interface Activity {
  id: number
  action: string
  entity_type: string
  entity_id: number
  metadata: Record<string, unknown>
  user: User | null
  created_at: string
}

export interface Dashboard {
  total: number
  overdue: number
  by_priority: Partial<Record<Priority, number>>
  by_assignee: { id: number; name: string; total: number }[]
  by_project: { id: number; name: string; total: number }[]
}

export interface Paginated<T> {
  data: T[]
  meta?: { current_page?: number; last_page?: number; total?: number; unread_count?: number }
}
