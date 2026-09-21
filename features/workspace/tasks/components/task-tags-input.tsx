"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TaskTagsInput({
  id,
  value,
  onValueChange,
}: {
  id?: string
  value: string[]
  onValueChange: (tags: string[]) => void
}) {
  const [draft, setDraft] = React.useState("")

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag || value.includes(tag)) return
    onValueChange([...value, tag])
  }

  function removeTag(tag: string) {
    onValueChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag(draft)
      setDraft("")
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  function handleBlur() {
    if (draft) {
      addTag(draft)
      setDraft("")
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Nhập tag rồi nhấn Enter (vd: marketing, phone, danang)"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-4"
                onClick={() => removeTag(tag)}
              >
                <XIcon />
                <span className="sr-only">Xóa tag {tag}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
