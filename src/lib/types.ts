export const STATUSES = ['applied', 'interviewing', 'offer', 'rejected'] as const
export type Status = (typeof STATUSES)[number]

export interface Application {
  id: string
  user_id: string
  company: string
  position: string
  status: Status
  applied_on: string
  notes: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  application_id: string
  title: string
  due_date: string | null
  done: boolean
  created_at: string
}
