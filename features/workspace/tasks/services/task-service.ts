import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import { USERS_COLLECTION } from "@/features/users/services/user-service"
import type { Task, TaskInput } from "@/features/workspace/tasks/types"

const TASKS_COLLECTION = "tasks"

interface TaskDocData {
  title: string
  description: string
  status: Task["status"]
  priority: Task["priority"]
  assignee: DocumentReference | null
  tags: string[]
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

function tasksCollection() {
  return collection(db, TASKS_COLLECTION)
}

function assigneeRef(assigneeId: string | null) {
  return assigneeId ? doc(db, USERS_COLLECTION, assigneeId) : null
}

export function subscribeTasks(
  onChange: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(tasksCollection(), orderBy("createdAt", "desc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as TaskDocData
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assigneeId: data.assignee ? data.assignee.id : null,
          tags: data.tags ?? [],
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : "",
        } satisfies Task
      })
      onChange(tasks)
    },
    (error) => onError?.(error)
  )
}

export async function createTask(input: TaskInput) {
  const { assigneeId, ...rest } = input
  await addDoc(tasksCollection(), {
    ...rest,
    assignee: assigneeRef(assigneeId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateTask(id: string, input: TaskInput) {
  const { assigneeId, ...rest } = input
  await updateDoc(doc(db, TASKS_COLLECTION, id), {
    ...rest,
    assignee: assigneeRef(assigneeId),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, TASKS_COLLECTION, id))
}
