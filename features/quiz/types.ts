export interface QuizQuestion {
  id: string
  content: string
  answerOptions: string[]
  correctOption: string
  score: number
  order: number
}

export type QuizQuestionInput = Omit<QuizQuestion, "id">

export interface QuizAnswer {
  id: string
  userId: string
  questionId: string
  option: string
  isCorrect: boolean
}

export type QuizParticipantRole = "contestant" | "mc" | "judge" | "director"

export const QUIZ_ROLE_LABELS: Record<QuizParticipantRole, string> = {
  contestant: "Thí sinh",
  mc: "MC",
  judge: "Giám khảo",
  director: "Đạo diễn",
}

export interface QuizParticipant {
  id: string // uid
  role: QuizParticipantRole
  seat?: number
  displayName: string
}

export type QuizParticipantInput = Omit<QuizParticipant, "id">

export type QuizSessionStatus = "idle" | "question" | "revealed"

export interface QuizSession {
  status: QuizSessionStatus
  currentQuestionId: string | null
}

export const QUIZ_OPTION_LETTERS = ["A", "B", "C", "D"] as const

export function getOptionLetter(index: number) {
  return QUIZ_OPTION_LETTERS[index] ?? String(index + 1)
}
