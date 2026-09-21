"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Spinner } from "@/components/ui/spinner"
import { QuizAnswerOptions } from "@/features/quiz/components/quiz-answer-options"
import { submitAnswer, subscribeAnswersForUser } from "@/features/quiz/services/answer-service"
import { subscribeParticipant } from "@/features/quiz/services/participant-service"
import { subscribeQuestions } from "@/features/quiz/services/question-service"
import { subscribeQuizSession } from "@/features/quiz/services/session-service"
import type {
  QuizAnswer,
  QuizParticipant,
  QuizQuestion,
  QuizSession,
} from "@/features/quiz/types"
import { useAuth } from "@/hooks/use-auth"

export default function QuizContestantPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [participant, setParticipant] = React.useState<QuizParticipant | null>(null)
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([])
  const [session, setSession] = React.useState<QuizSession>({
    status: "idle",
    currentQuestionId: null,
  })
  const [myAnswers, setMyAnswers] = React.useState<QuizAnswer[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login")
    }
  }, [isAuthLoading, user, router])

  React.useEffect(() => {
    if (!user) return
    const unsubParticipant = subscribeParticipant(user.uid, setParticipant)
    const unsubQuestions = subscribeQuestions(setQuestions)
    const unsubSession = subscribeQuizSession(setSession)
    const unsubAnswers = subscribeAnswersForUser(user.uid, setMyAnswers)
    return () => {
      unsubParticipant()
      unsubQuestions()
      unsubSession()
      unsubAnswers()
    }
  }, [user])

  const currentQuestion = questions.find((q) => q.id === session.currentQuestionId)
  const myAnswer = currentQuestion
    ? myAnswers.find((a) => a.questionId === currentQuestion.id)
    : undefined

  async function handleSelect(option: string) {
    if (!user || !currentQuestion || isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitAnswer({
        questionId: currentQuestion.id,
        userId: user.uid,
        option,
        correctOption: currentQuestion.correctOption,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi đáp án.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (participant && participant.role !== "contestant") {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
        Bạn không có vai trò thí sinh.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-xl font-semibold">
          {participant?.seat ? `Thí sinh ${participant.seat}` : "Thí sinh"}
        </h1>
        <p className="text-sm text-muted-foreground">{participant?.displayName}</p>
      </div>

      {session.status === "idle" || !currentQuestion ? (
        <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
          Đang chờ đạo diễn bắt đầu câu hỏi...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-primary px-6 py-8 text-center text-xl font-semibold text-primary-foreground md:text-2xl">
            {currentQuestion.content}
          </div>
          <QuizAnswerOptions
            question={currentQuestion}
            status={session.status}
            selectedOption={myAnswer?.option}
            disabled={isSubmitting}
            onSelect={handleSelect}
          />
          {myAnswer ? (
            <p className="text-center text-sm text-muted-foreground">
              {session.status === "revealed"
                ? myAnswer.isCorrect
                  ? "Chính xác!"
                  : "Chưa chính xác."
                : "Đã gửi đáp án, chờ kết quả..."}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
