import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { Subject } from "@/features/lms/types"

const SUBJECTS_COLLECTION = "subjects"

function subjectsCollection() {
  return collection(db, SUBJECTS_COLLECTION)
}

export function subscribeSubjects(
  onChange: (subjects: Subject[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(subjectsCollection(), orderBy("name", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const subjects = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as { name: string }
        return {
          id: docSnap.id,
          name: data.name,
        } satisfies Subject
      })
      onChange(subjects)
    },
    (error) => onError?.(error)
  )
}

export async function createSubject(name: string) {
  await addDoc(subjectsCollection(), { name })
}

export async function updateSubject(id: string, name: string) {
  await updateDoc(doc(db, SUBJECTS_COLLECTION, id), { name })
}

export async function deleteSubject(id: string) {
  await deleteDoc(doc(db, SUBJECTS_COLLECTION, id))
}
