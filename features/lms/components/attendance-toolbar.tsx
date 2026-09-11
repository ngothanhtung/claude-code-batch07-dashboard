"use client"

import { format, parseISO } from "date-fns"

import { DatePicker } from "@/components/date-picker"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Subject } from "@/features/lms/types"

export function AttendanceToolbar({
  date,
  onDateChange,
  subjects,
  subjectId,
  onSubjectChange,
}: {
  date: string
  onDateChange: (date: string) => void
  subjects: Subject[]
  subjectId: string
  onSubjectChange: (subjectId: string) => void
}) {
  const subjectNameById = new Map(
    subjects.map((subject) => [subject.id, subject.name])
  )

  return (
    <div className="flex flex-wrap items-end gap-4 px-4 lg:px-6">
      <Field className="w-auto">
        <FieldLabel htmlFor="attendance-date">Ngày điểm danh</FieldLabel>
        <DatePicker
          id="attendance-date"
          value={parseISO(date)}
          onChange={(nextDate) => {
            if (nextDate) onDateChange(format(nextDate, "yyyy-MM-dd"))
          }}
          className="w-40"
        />
      </Field>
      <Field className="w-auto">
        <FieldLabel htmlFor="attendance-subject">Môn học</FieldLabel>
        <Select
          value={subjectId}
          onValueChange={(value) => onSubjectChange(value ?? "")}
        >
          <SelectTrigger id="attendance-subject" className="w-56">
            <SelectValue placeholder="Chọn môn học">
              {(value: string | null) =>
                (value && subjectNameById.get(value)) || "Chọn môn học"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
