"use client"

import * as React from "react"
import { DownloadIcon, PaperclipIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

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
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  deleteAttachment,
  listAttachments,
  uploadAttachments,
} from "@/features/workspace/tasks/services/attachment-service"
import type { Task, TaskAttachment } from "@/features/workspace/tasks/types"

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TaskAttachmentsSheet({
  open,
  onOpenChange,
  task,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = React.useState<TaskAttachment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [uploadingNames, setUploadingNames] = React.useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = React.useState<TaskAttachment | null>(
    null
  )
  const [isDeleting, setIsDeleting] = React.useState(false)

  const refresh = React.useCallback(async (taskId: string) => {
    setIsLoading(true)
    try {
      const data = await listAttachments(taskId)
      setAttachments(data)
    } catch {
      toast.error("Không thể tải danh sách tệp đính kèm.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!open || !task) {
      setAttachments([])
      return
    }
    refresh(task.id)
  }, [open, task, refresh])

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!task || files.length === 0) return

    setUploadingNames(files.map((file) => file.name))
    try {
      await uploadAttachments(task.id, files)
      await refresh(task.id)
      toast.success("Đã tải lên tệp đính kèm.")
    } catch {
      toast.error("Không thể tải lên tệp đính kèm.")
    } finally {
      setUploadingNames([])
    }
  }

  async function handleConfirmDelete() {
    if (!task || !deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAttachment(task.id, deleteTarget.name)
      setAttachments((prev) => prev.filter((a) => a.name !== deleteTarget.name))
      setDeleteTarget(null)
      toast.success("Đã xóa tệp đính kèm.")
    } catch {
      toast.error("Không thể xóa tệp đính kèm.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tệp đính kèm</SheetTitle>
          <SheetDescription>{task?.title}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : attachments.length === 0 && uploadingNames.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có tệp đính kèm nào.
            </p>
          ) : (
            <AttachmentGroup className="flex-col">
              {attachments.map((attachment) => (
                <Attachment key={attachment.name} orientation="horizontal">
                  <AttachmentMedia>
                    <PaperclipIcon />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{attachment.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {formatFileSize(attachment.size)}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      nativeButton={false}
                      render={
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      <DownloadIcon />
                      <span className="sr-only">Tải xuống</span>
                    </AttachmentAction>
                    <AttachmentAction
                      onClick={() => setDeleteTarget(attachment)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Xóa</span>
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
              {uploadingNames.map((name) => (
                <Attachment key={name} orientation="horizontal" state="uploading">
                  <AttachmentMedia>
                    <PaperclipIcon />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{name}</AttachmentTitle>
                    <AttachmentDescription>Đang tải lên...</AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}
        </div>
        <SheetFooter>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!task || uploadingNames.length > 0}
          >
            <UploadIcon />
            Tải lên tệp
          </Button>
        </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tệp đính kèm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tệp &quot;{deleteTarget?.name}&quot;? Hành
              động này không thể hoàn tác.
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
