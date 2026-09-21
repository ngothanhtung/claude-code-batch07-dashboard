import {
  addDoc,
  collection,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"

import { db, storage } from "@/lib/firebase"
import type { ChatMessage, ChatMessageInput } from "@/features/chat/types"

const CHAT_ROOMS_COLLECTION = "chat-rooms"
const MESSAGES_SUBCOLLECTION = "messages"
const MESSAGE_PAGE_SIZE = 200
export const MESSAGE_IMAGES_FOLDER = "chat-message-images"

function messagesCollection(roomId: string) {
  return collection(db, CHAT_ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION)
}

export function subscribeChatMessages(
  roomId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    messagesCollection(roomId),
    orderBy("createdAt", "asc"),
    limitToLast(MESSAGE_PAGE_SIZE)
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          text: data.text,
          imageURL: data.imageURL ?? null,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhotoURL: data.senderPhotoURL ?? null,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        } satisfies ChatMessage
      })
      onChange(messages)
    },
    (error) => onError?.(error)
  )
}

export async function uploadChatMessageImage(roomId: string, file: File) {
  const path = `${MESSAGE_IMAGES_FOLDER}/${roomId}/${crypto.randomUUID()}-${file.name}`
  const imageRef = ref(storage, path)
  await uploadBytes(imageRef, file)
  return getDownloadURL(imageRef)
}

export async function sendChatMessage(
  roomId: string,
  input: ChatMessageInput
) {
  await addDoc(messagesCollection(roomId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await setDoc(
    doc(db, CHAT_ROOMS_COLLECTION, roomId),
    { updatedAt: serverTimestamp() },
    { merge: true }
  )
}
