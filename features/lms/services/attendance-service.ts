import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import {
  getStudentFullName,
  type AttendanceRecord,
  type AttendanceStatus,
  type Student,
  type Subject,
} from "@/features/lms/types"

const ATTENDANCE_COLLECTION = "attendance"

function attendanceCollection() {
  return collection(db, ATTENDANCE_COLLECTION)
}

function attendanceDocId(studentId: string, date: string, subjectId: string) {
  return `${studentId}_${date}_${subjectId}`
}

type AttendanceDoc = Omit<AttendanceRecord, "id" | "updatedAt"> & {
  updatedAt?: Timestamp
}

export function subscribeAttendanceSession(
  date: string,
  subjectId: string,
  onChange: (records: Map<string, AttendanceRecord>) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    attendanceCollection(),
    where("date", "==", date),
    where("subjectId", "==", subjectId)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const records = new Map<string, AttendanceRecord>()
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as AttendanceDoc
        records.set(data.studentId, {
          id: docSnap.id,
          studentId: data.studentId,
          studentName: data.studentName,
          studentCode: data.studentCode,
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          date: data.date,
          status: data.status,
          updatedAt: data.updatedAt?.toDate().toISOString(),
        })
      })
      onChange(records)
    },
    (error) => onError?.(error)
  )
}

export async function setAttendanceStatus(params: {
  student: Student
  subject: Subject
  date: string
  status: AttendanceStatus
}) {
  const { student, subject, date, status } = params
  const id = attendanceDocId(student.id, date, subject.id)

  await setDoc(
    doc(db, ATTENDANCE_COLLECTION, id),
    {
      studentId: student.id,
      studentName: getStudentFullName(student),
      studentCode: student.code,
      subjectId: subject.id,
      subjectName: subject.name,
      date,
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
