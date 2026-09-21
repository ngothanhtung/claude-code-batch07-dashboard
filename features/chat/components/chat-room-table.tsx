"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { MessageCircleIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChatRoom } from "@/features/chat/types"

function formatTimestamp(room: ChatRoom, field: "createdAt" | "updatedAt") {
  const date = room[field]?.toDate()
  return date ? format(date, "dd/MM/yyyy HH:mm") : "—"
}

export function ChatRoomTable({
  rooms,
  isLoading,
  onEdit,
  onDelete,
}: {
  rooms: ChatRoom[]
  isLoading?: boolean
  onEdit: (room: ChatRoom) => void
  onDelete: (room: ChatRoom) => void
}) {
  const [deleteTarget, setDeleteTarget] = React.useState<ChatRoom | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên phòng chat</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Cập nhật lần cuối</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Chưa có phòng chat nào.
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/chat/${room.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <MessageCircleIcon className="size-4 text-muted-foreground" />
                    {room.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTimestamp(room, "createdAt")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTimestamp(room, "updatedAt")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">Thao tác</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(room)}>
                        <PencilIcon />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(room)}
                      >
                        <Trash2Icon />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phòng chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng chat &quot;{deleteTarget?.name}&quot;?
              Toàn bộ tin nhắn trong phòng cũng sẽ bị xóa. Hành động này không
              thể hoàn tác.
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
