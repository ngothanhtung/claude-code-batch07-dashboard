"use client"

import * as React from "react"
import { ImageIcon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export function ChatMessageForm({
  onSend,
  disabled,
}: {
  onSend: (input: { text: string; imageFile: File | null }) => Promise<void>
  disabled?: boolean
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [text, setText] = React.useState("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null
  )
  const [isSending, setIsSending] = React.useState(false)

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ có thể đính kèm tệp hình ảnh.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Kích thước hình ảnh tối đa là 5MB.")
      return
    }

    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    setImageFile(null)
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImagePreviewUrl(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if ((!trimmed && !imageFile) || isSending) return

    setIsSending(true)
    try {
      await onSend({ text: trimmed, imageFile })
      setText("")
      handleRemoveImage()
    } finally {
      setIsSending(false)
    }
  }

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t bg-background p-4"
    >
      {imagePreviewUrl && (
        <div className="relative w-fit">
          <img
            src={imagePreviewUrl}
            alt="Ảnh đính kèm"
            className="h-20 w-20 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            className="absolute -top-2 -right-2 rounded-full"
            onClick={handleRemoveImage}
          >
            <XIcon />
            <span className="sr-only">Bỏ ảnh</span>
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || isSending}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon />
          <span className="sr-only">Đính kèm hình ảnh</span>
        </Button>
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={disabled || isSending}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || isSending || (!text.trim() && !imageFile)}
        >
          <SendIcon />
          <span className="sr-only">Gửi</span>
        </Button>
      </div>
    </form>
  )
}
