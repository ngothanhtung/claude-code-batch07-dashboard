"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MessageCircleIcon } from "lucide-react"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import type { ChatRoom } from "@/features/chat/types"

function formatUpdatedAt(room: ChatRoom) {
  const date = room.updatedAt?.toDate() ?? room.createdAt?.toDate()
  if (!date) return null
  return format(date, "dd/MM/yyyy HH:mm")
}

export function ChatRoomList({
  rooms,
  isLoading,
}: {
  rooms: ChatRoom[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Chưa có phòng chat nào</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ItemGroup>
      {rooms.map((room) => (
        <Item key={room.id} variant="outline" render={<Link href={`/chat/${room.id}`} />}>
          <ItemMedia variant="icon">
            <MessageCircleIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{room.name}</ItemTitle>
            {formatUpdatedAt(room) && (
              <ItemDescription>Cập nhật lúc {formatUpdatedAt(room)}</ItemDescription>
            )}
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
