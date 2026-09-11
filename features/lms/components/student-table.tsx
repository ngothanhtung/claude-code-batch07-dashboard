"use client"

import * as React from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  GENDER_LABELS,
  getStudentFullName,
  type Student,
  type Subject,
} from "@/features/lms/types"

export function StudentTable({
  students,
  subjects,
  isLoading,
  onEdit,
  onDelete,
}: {
  students: Student[]
  subjects: Subject[]
  isLoading?: boolean
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}) {
  const [deleteTarget, setDeleteTarget] = React.useState<Student | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const subjectNameById = new Map(
    subjects.map((subject) => [subject.id, subject.name])
  )

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã số</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Giới tính</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>Môn học</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Chưa có học viên nào.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.code}</TableCell>
                <TableCell>{getStudentFullName(student)}</TableCell>
                <TableCell>{GENDER_LABELS[student.gender]}</TableCell>
                <TableCell>{student.dateOfBirth}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {student.subjectIds.length === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      student.subjectIds.map((subjectId) => (
                        <Badge key={subjectId} variant="secondary">
                          {subjectNameById.get(subjectId) ?? "?"}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">Thao tác</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(student)}>
                        <PencilIcon />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(student)}
                      >
                        <Trash2Icon />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa học viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa học viên &quot;
              {deleteTarget ? getStudentFullName(deleteTarget) : ""}&quot;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
