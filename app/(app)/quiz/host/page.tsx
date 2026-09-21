"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Spinner } from "@/components/ui/spinner"
import { QuizContestantStatus } from "@/features/quiz/components/quiz-contestant-status"
import { QuizQuestionDisplay } from "@/features/quiz/components/quiz-question-display"
import { subscribeAnswersForQuestion } from "@/features/quiz/services/answer-service"
import { subscribeParticipant, subscribeParticipants } from "@/features/quiz/services/participant-service"
import { subscribeQuestions } from "@/features/quiz/services/question-service"
import { subscribeQuizSession } from "@/features/quiz/services/session-service"
import type {
  QuizAnswer,
  QuizParticipant,
  QuizQuestion,
  QuizSession,
} from "@/features/quiz/types"
import { QUIZ_ROLE_LABELS } from "@/features/quiz/types"
import { useAuth } from "@/hooks/use-auth"

export default function QuizHostPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [participant, setParticipant] = React.useState<QuizParticipant | null>(null)
  const [participants, setParticipants] = React.useState<QuizParticipant[]>([])
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([])
  const [session, setSession] = React.useState<QuizSession>({
    status: "idle",
    currentQuestionId: null,
  })
  const [answers, setAnswers] = React.useState<QuizAnswer[]>([])

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login")
    }
  }, [isAuthLoading, user, router])

  React.useEffect(() => {
    if (!user) return
    const unsubParticipant = subscribeParticipant(user.uid, setParticipant)
    const unsubParticipants = subscribeParticipants(setParticipants)
    const unsubQuestions = subscribeQuestions(setQuestions)
    const unsubSession = subscribeQuizSession(setSession)
    return () => {
      unsubParticipant()
      unsubParticipants()
      unsubQuestions()
      unsubSession()
    }
  }, [user])

  React.useEffect(() => {
    if (!session.currentQuestionId) {
      setAnswers([])
      return
    }
    return subscribeAnswersForQuestion(session.currentQuestionId, setAnswers)
  }, [session.currentQuestionId])

  const currentQuestion = questions.find((q) => q.id === session.currentQuestionId)

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (participant && participant.role !== "mc" && participant.role !== "judge") {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
        Bạn không có quyền xem màn hình này.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-xl font-semibold">
          {participant ? QUIZ_ROLE_LABELS[participant.role] : "MC / Giám khảo"}
        </h1>
      </div>

      <QuizContestantStatus
        participants={participants}
        answers={answers}
        status={session.status}
      />

      {session.status === "idle" || !currentQuestion ? (
        <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
          Chưa có câu hỏi nào đang hiển thị.
        </div>
      ) : (
        <QuizQuestionDisplay question={currentQuestion} status={session.status} />
      )}
    </div>
  )
}
