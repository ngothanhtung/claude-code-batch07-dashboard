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
  where,
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
  follower: DocumentReference | null
  tags: string[]
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

function tasksCollection() {
  return collection(db, TASKS_COLLECTION)
}

function userRef(userId: string | null) {
  return userId ? doc(db, USERS_COLLECTION, userId) : null
}

function toTask(id: string, data: TaskDocData): Task {
  return {
    id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assignee ? data.assignee.id : null,
    followerId: data.follower ? data.follower.id : null,
    tags: data.tags ?? [],
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : "",
  }
}

// Only the assignee or follower can read a task (see firestore.rules), so
// list queries must filter by the signed-in user to avoid a
// permission-denied error on the whole collection.
export function subscribeTasks(
  assigneeUid: string,
  onChange: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    tasksCollection(),
    where("assignee", "==", userRef(assigneeUid)),
    orderBy("createdAt", "desc")
  )

  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((docSnap) => toTask(docSnap.id, docSnap.data() as TaskDocData)))
    },
    (error) => onError?.(error)
  )
}

// Tasks the signed-in user follows (read + comment only, see firestore.rules).
export function subscribeFollowedTasks(
  followerUid: string,
  onChange: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    tasksCollection(),
    where("follower", "==", userRef(followerUid)),
    orderBy("createdAt", "desc")
  )

  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((docSnap) => toTask(docSnap.id, docSnap.data() as TaskDocData)))
    },
    (error) => onError?.(error)
  )
}

export async function createTask(input: TaskInput) {
  const { assigneeId, followerId, ...rest } = input
  await addDoc(tasksCollection(), {
    ...rest,
    assignee: userRef(assigneeId),
    follower: userRef(followerId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateTask(id: string, input: TaskInput) {
  const { assigneeId, followerId, ...rest } = input
  await updateDoc(doc(db, TASKS_COLLECTION, id), {
    ...rest,
    assignee: userRef(assigneeId),
    follower: userRef(followerId),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, TASKS_COLLECTION, id))
}
