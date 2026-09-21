"use client"

import * as React from "react"

import { QuizQuestionDisplay } from "@/features/quiz/components/quiz-question-display"
import { subscribeQuestions } from "@/features/quiz/services/question-service"
import { subscribeQuizSession } from "@/features/quiz/services/session-service"
import type { QuizQuestion, QuizSession } from "@/features/quiz/types"

export default function QuizDisplayPage() {
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([])
  const [session, setSession] = React.useState<QuizSession>({
    status: "idle",
    currentQuestionId: null,
  })

  React.useEffect(() => {
    const unsubQuestions = subscribeQuestions(setQuestions)
    const unsubSession = subscribeQuizSession(setSession)
    return () => {
      unsubQuestions()
      unsubSession()
    }
  }, [])

  const currentQuestion = questions.find((q) => q.id === session.currentQuestionId)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-8">
      {session.status === "idle" || !currentQuestion ? (
        <div className="text-3xl font-semibold text-muted-foreground">
          Chương trình sắp bắt đầu...
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <QuizQuestionDisplay question={currentQuestion} status={session.status} />
        </div>
      )}
    </div>
  )
}
