import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"
import { deleteObject, listAll, ref } from "firebase/storage"

import { db, storage } from "@/lib/firebase"
import { MESSAGE_IMAGES_FOLDER } from "@/features/chat/services/chat-message-service"
import type { ChatRoom } from "@/features/chat/types"

const CHAT_ROOMS_COLLECTION = "chat-rooms"

function chatRoomsCollection() {
  return collection(db, CHAT_ROOMS_COLLECTION)
}

export function subscribeChatRooms(
  onChange: (rooms: ChatRoom[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(chatRoomsCollection(), orderBy("updatedAt", "desc"))
  return onSnapshot(
    q,
    (snapshot) => {
      const rooms = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          name: data.name,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        } satisfies ChatRoom
      })
      onChange(rooms)
    },
    (error) => onError?.(error)
  )
}

export async function getChatRoom(roomId: string) {
  const snapshot = await getDoc(doc(db, CHAT_ROOMS_COLLECTION, roomId))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    id: snapshot.id,
    name: data.name,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  } satisfies ChatRoom
}

export async function createChatRoom(name: string) {
  await addDoc(chatRoomsCollection(), {
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateChatRoom(roomId: string, name: string) {
  await updateDoc(doc(db, CHAT_ROOMS_COLLECTION, roomId), {
    name,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteChatRoom(roomId: string) {
  const messagesRef = collection(
    db,
    CHAT_ROOMS_COLLECTION,
    roomId,
    "messages"
  )
  let messagesSnapshot = await getDocs(messagesRef)
  while (!messagesSnapshot.empty) {
    const batch = writeBatch(db)
    messagesSnapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref))
    await batch.commit()
    messagesSnapshot = await getDocs(messagesRef)
  }
  await deleteDoc(doc(db, CHAT_ROOMS_COLLECTION, roomId))

  const imagesRef = ref(storage, `${MESSAGE_IMAGES_FOLDER}/${roomId}`)
  const imagesList = await listAll(imagesRef).catch(() => null)
  if (imagesList) {
    await Promise.all(imagesList.items.map((item) => deleteObject(item)))
  }
}
