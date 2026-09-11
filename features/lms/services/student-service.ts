import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { Student, StudentInput } from "@/features/lms/types"

const STUDENTS_COLLECTION = "students"

function studentsCollection() {
  return collection(db, STUDENTS_COLLECTION)
}

export function subscribeStudents(
  onChange: (students: Student[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    studentsCollection(),
    (snapshot) => {
      const students = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as StudentInput
        return { id: docSnap.id, ...data } satisfies Student
      })
      students.sort(
        (a, b) =>
          a.lastName.localeCompare(b.lastName, "vi") ||
          a.firstName.localeCompare(b.firstName, "vi")
      )
      onChange(students)
    },
    (error) => onError?.(error)
  )
}

export async function createStudent(input: StudentInput) {
  await addDoc(studentsCollection(), input)
}

export async function updateStudent(id: string, input: StudentInput) {
  await updateDoc(doc(db, STUDENTS_COLLECTION, id), input)
}

export async function deleteStudent(id: string) {
  await deleteDoc(doc(db, STUDENTS_COLLECTION, id))
}
