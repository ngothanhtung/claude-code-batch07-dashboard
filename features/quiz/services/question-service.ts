import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  doc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { QuizQuestion, QuizQuestionInput } from "@/features/quiz/types"

const QUESTIONS_COLLECTION = "questions"

function questionsCollection() {
  return collection(db, QUESTIONS_COLLECTION)
}

export function subscribeQuestions(
  onChange: (questions: QuizQuestion[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(questionsCollection(), orderBy("order", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const questions = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as QuizQuestionInput
        return { id: docSnap.id, ...data } satisfies QuizQuestion
      })
      onChange(questions)
    },
    (error) => onError?.(error)
  )
}

const MOCK_QUESTIONS: QuizQuestionInput[] = [
  {
    content: "\"Abundant\" có nghĩa là gì?",
    answerOptions: ["Khan hiếm", "Dồi dào", "Nhỏ bé", "Yên tĩnh"],
    correctOption: "Dồi dào",
    score: 10,
    order: 1,
  },
  {
    content: "\"Benevolent\" có nghĩa là gì?",
    answerOptions: ["Độc ác", "Nhân từ", "Lười biếng", "Nóng nảy"],
    correctOption: "Nhân từ",
    score: 10,
    order: 2,
  },
  {
    content: "\"Candid\" có nghĩa là gì?",
    answerOptions: ["Thẳng thắn", "Giả dối", "Nhút nhát", "Phức tạp"],
    correctOption: "Thẳng thắn",
    score: 10,
    order: 3,
  },
  {
    content: "\"Diligent\" có nghĩa là gì?",
    answerOptions: ["Lười biếng", "Chăm chỉ", "Vụng về", "Xa xỉ"],
    correctOption: "Chăm chỉ",
    score: 10,
    order: 4,
  },
  {
    content: "\"Eloquent\" có nghĩa là gì?",
    answerOptions: ["Hùng biện", "Im lặng", "Bối rối", "Chậm chạp"],
    correctOption: "Hùng biện",
    score: 10,
    order: 5,
  },
  {
    content: "\"Frugal\" có nghĩa là gì?",
    answerOptions: ["Hoang phí", "Tiết kiệm", "Hào phóng", "Xa hoa"],
    correctOption: "Tiết kiệm",
    score: 10,
    order: 6,
  },
  {
    content: "\"Genuine\" có nghĩa là gì?",
    answerOptions: ["Giả mạo", "Chân thật", "Kỳ lạ", "Mơ hồ"],
    correctOption: "Chân thật",
    score: 10,
    order: 7,
  },
  {
    content: "\"Hostile\" có nghĩa là gì?",
    answerOptions: ["Thù địch", "Thân thiện", "Trung lập", "Vui vẻ"],
    correctOption: "Thù địch",
    score: 10,
    order: 8,
  },
  {
    content: "\"Immense\" có nghĩa là gì?",
    answerOptions: ["Nhỏ bé", "Khổng lồ", "Bình thường", "Mờ nhạt"],
    correctOption: "Khổng lồ",
    score: 10,
    order: 9,
  },
  {
    content: "\"Judicious\" có nghĩa là gì?",
    answerOptions: ["Khôn ngoan", "Ngu ngốc", "Vội vàng", "Bừa bãi"],
    correctOption: "Khôn ngoan",
    score: 10,
    order: 10,
  },
]

// Seeds the 10 mock vocabulary questions if the collection is empty.
export async function seedMockQuestions() {
  const existing = await getDocs(questionsCollection())
  if (!existing.empty) return

  const batch = writeBatch(db)
  MOCK_QUESTIONS.forEach((question) => {
    const ref = doc(questionsCollection())
    batch.set(ref, question)
  })
  await batch.commit()
}
