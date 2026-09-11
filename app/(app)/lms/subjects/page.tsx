"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SubjectFormDialog } from "@/features/lms/components/subject-form-dialog"
import { SubjectTable } from "@/features/lms/components/subject-table"
import {
  createSubject,
  deleteSubject,
  subscribeSubjects,
  updateSubject,
} from "@/features/lms/services/subject-service"
import type { Subject } from "@/features/lms/types"

export default function SubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null)

  React.useEffect(() => {
    const unsubscribe = subscribeSubjects(
      (data) => {
        setSubjects(data)
        setIsLoading(false)
      },
      () => {
        toast.error("Không thể tải danh sách môn học.")
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [])

  function handleAdd() {
    setEditingSubject(null)
    setIsFormOpen(true)
  }

  function handleEdit(subject: Subject) {
    setEditingSubject(subject)
    setIsFormOpen(true)
  }

  async function handleDelete(subject: Subject) {
    try {
      await deleteSubject(subject.id)
      toast.success("Đã xóa môn học.")
    } catch {
      toast.error("Không thể xóa môn học.")
    }
  }

  async function handleSubmit(name: string) {
    if (editingSubject) {
      await updateSubject(editingSubject.id, name)
      toast.success("Đã cập nhật môn học.")
    } else {
      await createSubject(name)
      toast.success("Đã thêm môn học.")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold">Quản lý môn học</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, sửa, xóa môn học dùng cho điểm danh.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon />
          Thêm môn học
        </Button>
      </div>
      <div className="mx-4 rounded-xl border lg:mx-6">
        <SubjectTable
          subjects={subjects}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <SubjectFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        subject={editingSubject}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
