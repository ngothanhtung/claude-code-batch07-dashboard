import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { QuizAnswer } from "@/features/quiz/types"

const ANSWERS_COLLECTION = "answers"

function answersCollection() {
  return collection(db, ANSWERS_COLLECTION)
}

function answerDocId(questionId: string, userId: string) {
  return `${questionId}_${userId}`
}

export function subscribeAnswersForQuestion(
  questionId: string,
  onChange: (answers: QuizAnswer[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(answersCollection(), where("questionId", "==", questionId))

  return onSnapshot(
    q,
    (snapshot) => {
      const answers = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<QuizAnswer, "id">
        return { id: docSnap.id, ...data } satisfies QuizAnswer
      })
      onChange(answers)
    },
    (error) => onError?.(error)
  )
}

export function subscribeAllAnswers(
  onChange: (answers: QuizAnswer[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    answersCollection(),
    (snapshot) => {
      const answers = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<QuizAnswer, "id">
        return { id: docSnap.id, ...data } satisfies QuizAnswer
      })
      onChange(answers)
    },
    (error) => onError?.(error)
  )
}

export function subscribeAnswersForUser(
  userId: string,
  onChange: (answers: QuizAnswer[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(answersCollection(), where("userId", "==", userId))

  return onSnapshot(
    q,
    (snapshot) => {
      const answers = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<QuizAnswer, "id">
        return { id: docSnap.id, ...data } satisfies QuizAnswer
      })
      onChange(answers)
    },
    (error) => onError?.(error)
  )
}

// Locks answers: a contestant can only submit once per question, enforced
// by a deterministic doc id and an existence check before writing.
export async function submitAnswer(params: {
  questionId: string
  userId: string
  option: string
  correctOption: string
}) {
  const { questionId, userId, option, correctOption } = params
  const ref = doc(db, ANSWERS_COLLECTION, answerDocId(questionId, userId))
  const existing = await getDoc(ref)
  if (existing.exists()) {
    throw new Error("Bạn đã trả lời câu hỏi này rồi.")
  }

  await setDoc(ref, {
    userId,
    questionId,
    option,
    isCorrect: option === correctOption,
  } satisfies Omit<QuizAnswer, "id">)
}
