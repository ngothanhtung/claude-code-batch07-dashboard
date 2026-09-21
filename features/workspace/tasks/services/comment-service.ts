import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import { USERS_COLLECTION } from "@/features/users/services/user-service"
import type { TaskComment } from "@/features/workspace/tasks/types"

const TASKS_COLLECTION = "tasks"
const COMMENTS_SUBCOLLECTION = "comments"

interface CommentDocData {
  createdBy: DocumentReference
  createdAt: Timestamp | null
  content: string
  parentId: string | null
}

function commentsCollection(taskId: string) {
  return collection(db, TASKS_COLLECTION, taskId, COMMENTS_SUBCOLLECTION)
}

export function subscribeComments(
  taskId: string,
  onChange: (comments: TaskComment[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(commentsCollection(taskId), orderBy("createdAt", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as CommentDocData
        return {
          id: docSnap.id,
          parentId: data.parentId ?? null,
          createdBy: data.createdBy.id,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
          content: data.content,
        } satisfies TaskComment
      })
      onChange(comments)
    },
    (error) => onError?.(error)
  )
}

export async function createComment(
  taskId: string,
  authorUid: string,
  content: string,
  parentId: string | null = null
) {
  await addDoc(commentsCollection(taskId), {
    createdBy: doc(db, USERS_COLLECTION, authorUid),
    content,
    parentId,
    createdAt: serverTimestamp(),
  })
}
