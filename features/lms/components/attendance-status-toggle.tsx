"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { ATTENDANCE_STATUS_LABELS, type AttendanceStatus } from "@/features/lms/types"

const STATUS_ORDER: AttendanceStatus[] = ["absent", "present", "excused"]

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present:
    "aria-pressed:bg-emerald-600 aria-pressed:text-white aria-pressed:border-emerald-600 aria-pressed:hover:bg-emerald-600 dark:aria-pressed:bg-emerald-600",
  absent:
    "aria-pressed:bg-red-600 aria-pressed:text-white aria-pressed:border-red-600 aria-pressed:hover:bg-red-600 dark:aria-pressed:bg-red-600",
  excused:
    "aria-pressed:bg-orange-500 aria-pressed:text-white aria-pressed:border-orange-500 aria-pressed:hover:bg-orange-500 dark:aria-pressed:bg-orange-500",
}

export function AttendanceStatusToggle({
  value,
  disabled,
  onChange,
}: {
  value?: AttendanceStatus
  disabled?: boolean
  onChange: (status: AttendanceStatus) => Promise<void>
}) {
  const [pendingStatus, setPendingStatus] = React.useState<AttendanceStatus | null>(
    null
  )

  React.useEffect(() => {
    if (pendingStatus && value === pendingStatus) {
      setPendingStatus(null)
    }
  }, [value, pendingStatus])

  const displayValue = pendingStatus ?? value

  async function handleValueChange(next: string[]) {
    const selected = next[0] as AttendanceStatus | undefined
    if (!selected) return
    setPendingStatus(selected)
    try {
      await onChange(selected)
    } catch {
      setPendingStatus(null)
    }
  }

  return (
    <ToggleGroup
      value={displayValue ? [displayValue] : []}
      onValueChange={handleValueChange}
      disabled={disabled}
      variant="outline"
      size="sm"
    >
      {STATUS_ORDER.map((status) => (
        <ToggleGroupItem
          key={status}
          value={status}
          className={cn(STATUS_STYLES[status])}
        >
          {ATTENDANCE_STATUS_LABELS[status]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
