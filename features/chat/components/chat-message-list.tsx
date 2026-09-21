"use client"

import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Skeleton } from "@/components/ui/skeleton"
import type { ChatMessage } from "@/features/chat/types"
import { MessageCircleIcon } from "lucide-react"

function formatMessageTime(message: ChatMessage) {
  const date = message.createdAt?.toDate()
  return date ? format(date, "HH:mm dd/MM") : ""
}

function senderInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

export function ChatMessageList({
  messages,
  isLoading,
  currentUserId,
}: {
  messages: ChatMessage[]
  isLoading: boolean
  currentUserId: string
}) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col justify-end gap-3 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-2/3 rounded-xl" />
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Chưa có tin nhắn nào</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="end">
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="px-4 py-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId
              const isLast = index === messages.length - 1
              return (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={isLast}
                >
                  <Message align={isOwn ? "end" : "start"}>
                    <MessageAvatar>
                      <Avatar>
                        <AvatarImage src={message.senderPhotoURL ?? undefined} />
                        <AvatarFallback>
                          {senderInitial(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>
                        {message.senderName} · {formatMessageTime(message)}
                      </MessageHeader>
                      {message.imageURL && (
                        <Bubble variant="ghost" align={isOwn ? "end" : "start"}>
                          <BubbleContent
                            render={
                              <a
                                href={message.imageURL}
                                target="_blank"
                                rel="noreferrer"
                              />
                            }
                          >
                            <img
                              src={message.imageURL}
                              alt="Hình ảnh đính kèm"
                              className="max-h-64 max-w-64 rounded-xl border object-cover"
                            />
                          </BubbleContent>
                        </Bubble>
                      )}
                      {message.text && (
                        <Bubble align={isOwn ? "end" : "start"}>
                          <BubbleContent>{message.text}</BubbleContent>
                        </Bubble>
                      )}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )
            })}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
