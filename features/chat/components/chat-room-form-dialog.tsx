"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ChatRoom } from "@/features/chat/types"

export function ChatRoomFormDialog({
  open,
  onOpenChange,
  room,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: ChatRoom | null
  onSubmit: (name: string) => Promise<void>
}) {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName(room?.name ?? "")
      setError(null)
    }
  }, [open, room])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Vui lòng nhập tên phòng chat.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(name.trim())
      onOpenChange(false)
    } catch {
      setError("Không thể lưu phòng chat. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {room ? "Chỉnh sửa phòng chat" : "Thêm phòng chat"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="chat-room-name">Tên phòng chat</FieldLabel>
              <Input
                id="chat-room-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Phòng chung"
                autoFocus
                required
              />
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
