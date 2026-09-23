export type TaskStatus = "To do" | "In Progress" | "Done"

export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  "To do",
  "In Progress",
  "Done",
]

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  "To do": "#d48806",
  "In Progress": "#0958d9",
  Done: "#389e0d",
}

export type TaskPriority = "Urgent" | "High" | "Medium" | "Low"

export const TASK_PRIORITY_OPTIONS: TaskPriority[] = [
  "Urgent",
  "High",
  "Medium",
  "Low",
]

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  Urgent: "#531dab",
  High: "#cf1322",
  Medium: "#389e0d",
  Low: "#d48806",
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  followerId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type TaskInput = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  followerId: string | null
  tags: string[]
}

export interface TaskComment {
  id: string
  parentId: string | null
  createdBy: string
  createdAt: string
  content: string
}

export interface TaskAttachment {
  name: string
  url: string
  size: number
  contentType: string | null
}
