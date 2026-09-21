"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TaskAssigneeCombobox } from "@/features/workspace/tasks/components/task-assignee-combobox"
import { TaskFieldCombobox } from "@/features/workspace/tasks/components/task-field-combobox"
import { TaskTagsInput } from "@/features/workspace/tasks/components/task-tags-input"
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_COLORS,
  TASK_STATUS_OPTIONS,
  type Task,
  type TaskInput,
} from "@/features/workspace/tasks/types"
import type { UserProfile } from "@/features/users/types"

const EMPTY_FORM: TaskInput = {
  title: "",
  description: "",
  status: "To do",
  priority: "Medium",
  assigneeId: null,
  tags: [],
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  users,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  users: UserProfile[]
  onSubmit: (input: TaskInput) => Promise<void>
}) {
  const [form, setForm] = React.useState<TaskInput>(EMPTY_FORM)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        task
          ? {
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              assigneeId: task.assigneeId,
              tags: task.tags,
            }
          : EMPTY_FORM
      )
      setError(null)
    }
  }, [open, task])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ ...form, title: form.title.trim() })
      onOpenChange(false)
    } catch {
      setError("Không thể lưu công việc. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {task ? "Chỉnh sửa công việc" : "Thêm công việc"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Tiêu đề</FieldLabel>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề công việc"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Mô tả</FieldLabel>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Mô tả công việc (không bắt buộc)"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="status">Trạng thái</FieldLabel>
                <TaskFieldCombobox
                  id="status"
                  value={form.status}
                  onValueChange={(status) =>
                    setForm((prev) => ({ ...prev, status }))
                  }
                  options={TASK_STATUS_OPTIONS}
                  colors={TASK_STATUS_COLORS}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="priority">Độ ưu tiên</FieldLabel>
                <TaskFieldCombobox
                  id="priority"
                  value={form.priority}
                  onValueChange={(priority) =>
                    setForm((prev) => ({ ...prev, priority }))
                  }
                  options={TASK_PRIORITY_OPTIONS}
                  colors={TASK_PRIORITY_COLORS}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="assignee">Người xử lý</FieldLabel>
              <TaskAssigneeCombobox
                id="assignee"
                value={form.assigneeId}
                onValueChange={(assigneeId) =>
                  setForm((prev) => ({ ...prev, assigneeId }))
                }
                users={users}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <TaskTagsInput
                id="tags"
                value={form.tags}
                onValueChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
