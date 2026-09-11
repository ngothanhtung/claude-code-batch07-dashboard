"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"

import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GENDER_LABELS,
  type Gender,
  type Student,
  type StudentInput,
  type Subject,
} from "@/features/lms/types"

const EMPTY_FORM: StudentInput = {
  firstName: "",
  lastName: "",
  code: "",
  gender: "male",
  dateOfBirth: "",
  subjectIds: [],
}

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  subjects,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  subjects: Subject[]
  onSubmit: (input: StudentInput) => Promise<void>
}) {
  const [form, setForm] = React.useState<StudentInput>(EMPTY_FORM)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        student
          ? {
              firstName: student.firstName,
              lastName: student.lastName,
              code: student.code,
              gender: student.gender,
              dateOfBirth: student.dateOfBirth,
              subjectIds: student.subjectIds,
            }
          : EMPTY_FORM
      )
      setError(null)
    }
  }, [open, student])

  function toggleSubject(subjectId: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      subjectIds: checked
        ? [...prev.subjectIds, subjectId]
        : prev.subjectIds.filter((id) => id !== subjectId),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.code.trim()) {
      setError("Vui lòng nhập đầy đủ họ, tên và mã số.")
      return
    }
    if (!form.dateOfBirth) {
      setError("Vui lòng chọn ngày sinh.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        code: form.code.trim(),
      })
      onOpenChange(false)
    } catch {
      setError("Không thể lưu học viên. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {student ? "Chỉnh sửa học viên" : "Thêm học viên"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="lastName">Họ và tên đệm</FieldLabel>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Nguyễn Văn"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="firstName">Tên</FieldLabel>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder="A"
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="code">Mã số học viên</FieldLabel>
              <Input
                id="code"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="HV0001"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="gender">Giới tính</FieldLabel>
                <Select
                  value={form.gender}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      gender: (value ?? "male") as Gender,
                    }))
                  }
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue>
                      {(value: string | null) =>
                        GENDER_LABELS[(value ?? "male") as Gender]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GENDER_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dateOfBirth">Ngày sinh</FieldLabel>
                <DatePicker
                  id="dateOfBirth"
                  value={form.dateOfBirth ? parseISO(form.dateOfBirth) : undefined}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      dateOfBirth: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Môn học</FieldLabel>
              {subjects.length === 0 ? (
                <FieldDescription>Chưa có môn học nào.</FieldDescription>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg border p-3">
                  {subjects.map((subject) => (
                    <label
                      key={subject.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={form.subjectIds.includes(subject.id)}
                        onCheckedChange={(checked) =>
                          toggleSubject(subject.id, checked === true)
                        }
                      />
                      {subject.name}
                    </label>
                  ))}
                </div>
              )}
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
          <DialogFooter>
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
