"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SettingsIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChatRoomList } from "@/features/chat/components/chat-room-list"
import { subscribeChatRooms } from "@/features/chat/services/chat-room-service"
import type { ChatRoom } from "@/features/chat/types"
import { useAuth } from "@/hooks/use-auth"

export default function ChatPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = React.useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

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
          <h1 className="text-xl font-semibold">Phòng chat</h1>
          <p className="text-sm text-muted-foreground">
            Chọn một phòng để bắt đầu trò chuyện.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/chat/manage" />}>
          <SettingsIcon />
          Quản lý phòng chat
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        <ChatRoomList rooms={rooms} isLoading={isLoading} />
      </div>
    </div>
  )
}
