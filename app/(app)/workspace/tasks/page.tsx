"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TaskAttachmentsSheet } from "@/features/workspace/tasks/components/task-attachments-sheet"
import { TaskCommentsSheet } from "@/features/workspace/tasks/components/task-comments-sheet"
import { TaskFormDialog } from "@/features/workspace/tasks/components/task-form-dialog"
import { TaskTable } from "@/features/workspace/tasks/components/task-table"
import {
  createTask,
  deleteTask,
  subscribeTasks,
  updateTask,
} from "@/features/workspace/tasks/services/task-service"
import type { Task, TaskInput } from "@/features/workspace/tasks/types"
import { subscribeUsers } from "@/features/users/services/user-service"
import type { UserProfile } from "@/features/users/types"

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [users, setUsers] = React.useState<UserProfile[]>([])
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [commentsTask, setCommentsTask] = React.useState<Task | null>(null)
  const [isAttachmentsOpen, setIsAttachmentsOpen] = React.useState(false)
  const [attachmentsTask, setAttachmentsTask] = React.useState<Task | null>(null)

  React.useEffect(() => {
    const unsubscribe = subscribeTasks(
      (data) => {
        setTasks(data)
        setIsLoading(false)
      },
      () => {
        toast.error("Không thể tải danh sách công việc.")
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [])

  React.useEffect(() => {
    const unsubscribe = subscribeUsers(
      (data) => setUsers(data),
      () => toast.error("Không thể tải danh sách người dùng.")
    )
    return unsubscribe
  }, [])

  function handleAdd() {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  function handleOpenComments(task: Task) {
    setCommentsTask(task)
    setIsCommentsOpen(true)
  }

  function handleOpenAttachments(task: Task) {
    setAttachmentsTask(task)
    setIsAttachmentsOpen(true)
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id)
      toast.success("Đã xóa công việc.")
    } catch {
      toast.error("Không thể xóa công việc.")
    }
  }

  async function handleSubmit(input: TaskInput) {
    if (editingTask) {
      await updateTask(editingTask.id, input)
      toast.success("Đã cập nhật công việc.")
    } else {
      await createTask(input)
      toast.success("Đã thêm công việc.")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold">Quản lý công việc</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, sửa, xóa công việc và theo dõi trạng thái, độ ưu tiên.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon />
          Thêm công việc
        </Button>
      </div>
      <div className="mx-4 overflow-x-auto rounded-xl border lg:mx-6">
        <TaskTable
          tasks={tasks}
          users={users}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenComments={handleOpenComments}
          onOpenAttachments={handleOpenAttachments}
        />
      </div>
      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        users={users}
        onSubmit={handleSubmit}
      />
      <TaskCommentsSheet
        open={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        task={commentsTask}
        users={users}
      />
      <TaskAttachmentsSheet
        open={isAttachmentsOpen}
        onOpenChange={setIsAttachmentsOpen}
        task={attachmentsTask}
      />
    </div>
  )
}
