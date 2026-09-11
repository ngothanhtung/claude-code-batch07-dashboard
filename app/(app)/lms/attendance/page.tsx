"use client"

import * as React from "react"
import { toast } from "sonner"

import { AttendanceTable } from "@/features/lms/components/attendance-table"
import { AttendanceToolbar } from "@/features/lms/components/attendance-toolbar"
import {
  setAttendanceStatus,
  subscribeAttendanceSession,
} from "@/features/lms/services/attendance-service"
import { subscribeStudents } from "@/features/lms/services/student-service"
import { subscribeSubjects } from "@/features/lms/services/subject-service"
import type {
  AttendanceRecord,
  AttendanceStatus,
  Student,
  Subject,
} from "@/features/lms/types"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function AttendancePage() {
  const [date, setDate] = React.useState(todayIso)
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [subjectId, setSubjectId] = React.useState("")
  const [students, setStudents] = React.useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(true)
  const [attendanceMap, setAttendanceMap] = React.useState<
    Map<string, AttendanceRecord>
  >(new Map())
  const [isLoadingAttendance, setIsLoadingAttendance] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = subscribeSubjects(
      (data) => {
        setSubjects(data)
        setSubjectId((current) => current || data[0]?.id || "")
      },
      () => toast.error("Không thể tải danh sách môn học.")
    )
    return unsubscribe
  }, [])

  React.useEffect(() => {
    const unsubscribe = subscribeStudents(
      (data) => {
        setStudents(data)
        setIsLoadingStudents(false)
      },
      () => {
        toast.error("Không thể tải danh sách học viên.")
        setIsLoadingStudents(false)
      }
    )
    return unsubscribe
  }, [])

  React.useEffect(() => {
    if (!subjectId) {
      setAttendanceMap(new Map())
      return
    }
    setIsLoadingAttendance(true)
    const unsubscribe = subscribeAttendanceSession(
      date,
      subjectId,
      (map) => {
        setAttendanceMap(map)
        setIsLoadingAttendance(false)
      },
      () => {
        toast.error("Không thể tải dữ liệu điểm danh.")
        setIsLoadingAttendance(false)
      }
    )
    return unsubscribe
  }, [date, subjectId])

  const selectedSubject = subjects.find((s) => s.id === subjectId) ?? null
  const enrolledStudents = selectedSubject
    ? students.filter((student) => student.subjectIds.includes(selectedSubject.id))
    : []

  async function handleStatusChange(student: Student, status: AttendanceStatus) {
    if (!selectedSubject) return
    try {
      await setAttendanceStatus({
        student,
        subject: selectedSubject,
        date,
        status,
      })
    } catch (err) {
      toast.error("Không thể cập nhật điểm danh.")
      throw err
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <h1 className="text-xl font-semibold">Điểm danh học viên</h1>
        <p className="text-sm text-muted-foreground">
          Chọn ngày và môn học, sau đó chọn trạng thái điểm danh trực tiếp
          trên bảng.
        </p>
      </div>
      <AttendanceToolbar
        date={date}
        onDateChange={setDate}
        subjects={subjects}
        subjectId={subjectId}
        onSubjectChange={setSubjectId}
      />
      <div className="mx-4 rounded-xl border lg:mx-6">
        {selectedSubject ? (
          <AttendanceTable
            students={enrolledStudents}
            attendanceMap={attendanceMap}
            isLoading={isLoadingStudents || isLoadingAttendance}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Vui lòng chọn môn học để bắt đầu điểm danh.
          </div>
        )}
      </div>
    </div>
  )
}
