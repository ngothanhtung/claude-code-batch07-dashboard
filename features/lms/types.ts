export type AttendanceStatus = "present" | "absent" | "excused"

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Có mặt",
  absent: "Vắng",
  excused: "Vắng có phép",
}

export type Gender = "male" | "female"

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Nam",
  female: "Nữ",
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  code: string
  gender: Gender
  dateOfBirth: string // yyyy-MM-dd
  subjectIds: string[]
}

export function getStudentFullName(
  student: Pick<Student, "firstName" | "lastName">
) {
  return `${student.lastName} ${student.firstName}`.trim()
}

export type StudentInput = Omit<Student, "id">

export interface Subject {
  id: string
  name: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentCode: string
  subjectId: string
  subjectName: string
  date: string // yyyy-MM-dd
  status: AttendanceStatus
  updatedAt?: string
}
