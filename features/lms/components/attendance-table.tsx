"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AttendanceStatusToggle } from "@/features/lms/components/attendance-status-toggle"
import {
  getStudentFullName,
  type AttendanceRecord,
  type AttendanceStatus,
  type Student,
} from "@/features/lms/types"

export function AttendanceTable({
  students,
  attendanceMap,
  isLoading,
  disabled,
  onStatusChange,
}: {
  students: Student[]
  attendanceMap: Map<string, AttendanceRecord>
  isLoading?: boolean
  disabled?: boolean
  onStatusChange: (student: Student, status: AttendanceStatus) => Promise<void>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã số</TableHead>
          <TableHead>Họ và tên</TableHead>
          <TableHead>Trạng thái</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              Đang tải dữ liệu...
            </TableCell>
          </TableRow>
        ) : students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              Chưa có học viên nào.
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.code}</TableCell>
              <TableCell>{getStudentFullName(student)}</TableCell>
              <TableCell>
                <AttendanceStatusToggle
                  value={attendanceMap.get(student.id)?.status}
                  disabled={disabled}
                  onChange={(status) => onStatusChange(student, status)}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
