import { doc, onSnapshot, setDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { QuizSession } from "@/features/quiz/types"

const SESSION_DOC_PATH = ["quizState", "current"] as const

function sessionRef() {
  return doc(db, ...SESSION_DOC_PATH)
}

const IDLE_SESSION: QuizSession = { status: "idle", currentQuestionId: null }

export function subscribeQuizSession(
  onChange: (session: QuizSession) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    sessionRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(IDLE_SESSION)
        return
      }
      onChange(snapshot.data() as QuizSession)
    },
    (error) => onError?.(error)
  )
}

export async function setCurrentQuestion(questionId: string) {
  await setDoc(sessionRef(), {
    status: "question",
    currentQuestionId: questionId,
  } satisfies QuizSession)
}

export async function revealAnswer() {
  await setDoc(sessionRef(), { status: "revealed" }, { merge: true })
}

export async function resetToIdle() {
  await setDoc(sessionRef(), IDLE_SESSION)
}
