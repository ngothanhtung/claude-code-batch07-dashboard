"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChatRoomFormDialog } from "@/features/chat/components/chat-room-form-dialog"
import { ChatRoomTable } from "@/features/chat/components/chat-room-table"
import {
  createChatRoom,
  deleteChatRoom,
  subscribeChatRooms,
  updateChatRoom,
} from "@/features/chat/services/chat-room-service"
import type { ChatRoom } from "@/features/chat/types"
import { useAuth } from "@/hooks/use-auth"

export default function ChatRoomsManagePage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = React.useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingRoom, setEditingRoom] = React.useState<ChatRoom | null>(null)

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login")
    }
  }, [isAuthLoading, user, router])

  React.useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeChatRooms(
      (data) => {
        setRooms(data)
        setIsLoading(false)
      },
      () => {
        toast.error("Không thể tải danh sách phòng chat.")
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [user])

  function handleAdd() {
    setEditingRoom(null)
    setIsFormOpen(true)
  }

  function handleEdit(room: ChatRoom) {
    setEditingRoom(room)
    setIsFormOpen(true)
  }

  async function handleDelete(room: ChatRoom) {
    try {
      await deleteChatRoom(room.id)
      toast.success("Đã xóa phòng chat.")
    } catch {
      toast.error("Không thể xóa phòng chat.")
    }
  }

  async function handleSubmit(name: string) {
    if (editingRoom) {
      await updateChatRoom(editingRoom.id, name)
      toast.success("Đã cập nhật phòng chat.")
    } else {
      await createChatRoom(name)
      toast.success("Đã thêm phòng chat.")
    }
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold">Quản lý phòng chat</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, sửa, xóa các phòng chat theo nhóm.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon />
          Thêm phòng chat
        </Button>
      </div>
      <div className="mx-4 rounded-xl border lg:mx-6">
        <ChatRoomTable
          rooms={rooms}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ChatRoomFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        room={editingRoom}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
