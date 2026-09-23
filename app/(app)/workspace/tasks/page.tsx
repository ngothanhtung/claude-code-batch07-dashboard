"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskAttachmentsSheet } from "@/features/workspace/tasks/components/task-attachments-sheet"
import { TaskCommentsSheet } from "@/features/workspace/tasks/components/task-comments-sheet"
import { TaskFormDialog } from "@/features/workspace/tasks/components/task-form-dialog"
import { TaskTable } from "@/features/workspace/tasks/components/task-table"
import {
  createTask,
  deleteTask,
  subscribeFollowedTasks,
  subscribeTasks,
  updateTask,
} from "@/features/workspace/tasks/services/task-service"
import type { Task, TaskInput } from "@/features/workspace/tasks/types"
import { subscribeUsers } from "@/features/users/services/user-service"
import type { UserProfile } from "@/features/users/types"
import { useAuth } from "@/hooks/use-auth"

export default function TasksPage() {
  const { user } = useAuth()
  const [assignedTasks, setAssignedTasks] = React.useState<Task[]>([])
  const [isAssignedLoading, setIsAssignedLoading] = React.useState(true)
  const [followedTasks, setFollowedTasks] = React.useState<Task[]>([])
  const [isFollowedLoading, setIsFollowedLoading] = React.useState(true)
  const [users, setUsers] = React.useState<UserProfile[]>([])
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [commentsTask, setCommentsTask] = React.useState<Task | null>(null)
  const [isAttachmentsOpen, setIsAttachmentsOpen] = React.useState(false)
  const [attachmentsTask, setAttachmentsTask] = React.useState<Task | null>(null)

  React.useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeTasks(
      user.uid,
      (data) => {
        setAssignedTasks(data)
        setIsAssignedLoading(false)
      },
      () => {
        toast.error("Không thể tải danh sách công việc được giao.")
        setIsAssignedLoading(false)
      }
    )
    return unsubscribe
  }, [user])

  React.useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeFollowedTasks(
      user.uid,
      (data) => {
        setFollowedTasks(data)
        setIsFollowedLoading(false)
      },
      () => {
        toast.error("Không thể tải danh sách công việc đang theo dõi.")
        setIsFollowedLoading(false)
      }
    )
    return unsubscribe
  }, [user])

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
          <h1 className="text-xl font-semibold">Công việc</h1>
          <p className="text-sm text-muted-foreground">
            Công việc được giao cho bạn có thể sửa/xóa. Công việc bạn theo dõi chỉ xem và bình luận được.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon />
          Thêm công việc
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        <Tabs defaultValue="assigned">
          <TabsList>
            <TabsTrigger value="assigned">Được giao</TabsTrigger>
            <TabsTrigger value="following">Đang theo dõi</TabsTrigger>
          </TabsList>
          <TabsContent value="assigned">
            <div className="mt-4 overflow-x-auto rounded-xl border">
              <TaskTable
                tasks={assignedTasks}
                users={users}
                isLoading={isAssignedLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenComments={handleOpenComments}
                onOpenAttachments={handleOpenAttachments}
              />
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="mt-4 overflow-x-auto rounded-xl border">
              <TaskTable
                tasks={followedTasks}
                users={users}
                isLoading={isFollowedLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenComments={handleOpenComments}
                onOpenAttachments={handleOpenAttachments}
                readOnly
              />
            </div>
          </TabsContent>
        </Tabs>
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
