"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { StudentFormDialog } from "@/features/lms/components/student-form-dialog"
import { StudentTable } from "@/features/lms/components/student-table"
import {
  createStudent,
  deleteStudent,
  subscribeStudents,
  updateStudent,
} from "@/features/lms/services/student-service"
import { subscribeSubjects } from "@/features/lms/services/subject-service"
import type { Student, StudentInput, Subject } from "@/features/lms/types"

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null)

  React.useEffect(() => {
    const unsubscribe = subscribeStudents(
      (data) => {
        setStudents(data)
        setIsLoading(false)
      },
      () => {
        toast.error("Không thể tải danh sách học viên.")
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [])

  React.useEffect(() => {
    const unsubscribe = subscribeSubjects(
      (data) => setSubjects(data),
      () => toast.error("Không thể tải danh sách môn học.")
    )
    return unsubscribe
  }, [])

  function handleAdd() {
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  function handleEdit(student: Student) {
    setEditingStudent(student)
    setIsFormOpen(true)
  }

  async function handleDelete(student: Student) {
    try {
      await deleteStudent(student.id)
      toast.success("Đã xóa học viên.")
    } catch {
      toast.error("Không thể xóa học viên.")
    }
  }

  async function handleSubmit(input: StudentInput) {
    if (editingStudent) {
      await updateStudent(editingStudent.id, input)
      toast.success("Đã cập nhật học viên.")
    } else {
      await createStudent(input)
      toast.success("Đã thêm học viên.")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold">Quản lý học viên</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, sửa, xóa học viên và gán học viên vào môn học.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon />
          Thêm học viên
        </Button>
      </div>
      <div className="mx-4 rounded-xl border lg:mx-6">
        <StudentTable
          students={students}
          subjects={subjects}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={editingStudent}
        subjects={subjects}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
