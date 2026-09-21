import type { Timestamp } from "firebase/firestore"

export interface ChatRoom {
  id: string
  name: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type ChatRoomInput = Pick<ChatRoom, "name">

export interface ChatMessage {
  id: string
  text: string
  imageURL: string | null
  senderId: string
  senderName: string
  senderPhotoURL: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type ChatMessageInput = Pick<
  ChatMessage,
  "text" | "imageURL" | "senderId" | "senderName" | "senderPhotoURL"
>
