import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { QuizParticipant, QuizParticipantInput } from "@/features/quiz/types"

const PARTICIPANTS_COLLECTION = "quizParticipants"

function participantsCollection() {
  return collection(db, PARTICIPANTS_COLLECTION)
}

export function subscribeParticipants(
  onChange: (participants: QuizParticipant[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    participantsCollection(),
    (snapshot) => {
      const participants = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as QuizParticipantInput
        return { id: docSnap.id, ...data } satisfies QuizParticipant
      })
      onChange(participants)
    },
    (error) => onError?.(error)
  )
}

export function subscribeParticipant(
  uid: string,
  onChange: (participant: QuizParticipant | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, PARTICIPANTS_COLLECTION, uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null)
        return
      }
      const data = snapshot.data() as QuizParticipantInput
      onChange({ id: snapshot.id, ...data })
    },
    (error) => onError?.(error)
  )
}

export async function setParticipant(uid: string, input: QuizParticipantInput) {
  // Firestore rejects `undefined` field values, so seat is omitted entirely
  // for non-contestant roles instead of being written as undefined.
  const data: QuizParticipantInput =
    input.seat === undefined
      ? { role: input.role, displayName: input.displayName }
      : input
  await setDoc(doc(db, PARTICIPANTS_COLLECTION, uid), data)
}

export async function removeParticipant(uid: string) {
  await deleteDoc(doc(db, PARTICIPANTS_COLLECTION, uid))
}
