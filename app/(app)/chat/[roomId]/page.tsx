"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChatMessageForm } from "@/features/chat/components/chat-message-form"
import { ChatMessageList } from "@/features/chat/components/chat-message-list"
import { getChatRoom } from "@/features/chat/services/chat-room-service"
import {
  sendChatMessage,
  subscribeChatMessages,
  uploadChatMessageImage,
} from "@/features/chat/services/chat-message-service"
import type { ChatMessage, ChatRoom } from "@/features/chat/types"
import { useAuth } from "@/hooks/use-auth"

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = React.use(params)
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [room, setRoom] = React.useState<ChatRoom | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login")
    }
  }, [isAuthLoading, user, router])

  React.useEffect(() => {
    if (!user) return
    let isCancelled = false
    getChatRoom(roomId)
      .then((data) => {
        if (!isCancelled) setRoom(data)
      })
      .catch(() => {
        toast.error("Không thể tải thông tin phòng chat.")
      })
    return () => {
      isCancelled = true
    }
  }, [user, roomId])

  React.useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeChatMessages(
      roomId,
      (data) => {
        setMessages(data)
        setIsLoading(false)
      },
      () => {
        toast.error("Không thể tải tin nhắn.")
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [user, roomId])

  async function handleSend({
    text,
    imageFile,
  }: {
    text: string
    imageFile: File | null
  }) {
    if (!user) return
    try {
      const imageURL = imageFile
        ? await uploadChatMessageImage(roomId, imageFile)
        : null
      await sendChatMessage(roomId, {
        text,
        imageURL,
        senderId: user.uid,
        senderName: user.displayName || user.email || "Ẩn danh",
        senderPhotoURL: user.photoURL ?? null,
      })
    } catch {
      toast.error("Không thể gửi tin nhắn.")
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
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3 lg:px-6">
        <Button variant="ghost" size="icon" render={<Link href="/chat" />}>
          <ArrowLeftIcon />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-base font-semibold">{room?.name ?? "Đang tải..."}</h1>
      </div>
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        currentUserId={user.uid}
      />
      <ChatMessageForm onSend={handleSend} />
    </div>
  )
}
