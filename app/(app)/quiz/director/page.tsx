"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { QuizContestantStatus } from "@/features/quiz/components/quiz-contestant-status"
import {
  QuizDirectorControls,
  QuizLeaderboard,
} from "@/features/quiz/components/quiz-director-controls"
import { QuizParticipantManager } from "@/features/quiz/components/quiz-participant-manager"
import { subscribeAllAnswers, subscribeAnswersForQuestion } from "@/features/quiz/services/answer-service"
import { subscribeParticipant, subscribeParticipants } from "@/features/quiz/services/participant-service"
import { seedMockQuestions, subscribeQuestions } from "@/features/quiz/services/question-service"
import { resetToIdle, revealAnswer, setCurrentQuestion, subscribeQuizSession } from "@/features/quiz/services/session-service"
import type {
  QuizAnswer,
  QuizParticipant,
  QuizQuestion,
  QuizSession,
} from "@/features/quiz/types"
import { subscribeUsers } from "@/features/users/services/user-service"
import type { UserProfile } from "@/features/users/types"
import { useAuth } from "@/hooks/use-auth"

export default function QuizDirectorPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [participant, setParticipant] = React.useState<QuizParticipant | null>(null)
  const [participants, setParticipants] = React.useState<QuizParticipant[]>([])
  const [users, setUsers] = React.useState<UserProfile[]>([])
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([])
  const [session, setSession] = React.useState<QuizSession>({
    status: "idle",
    currentQuestionId: null,
  })
  const [currentAnswers, setCurrentAnswers] = React.useState<QuizAnswer[]>([])
  const [allAnswers, setAllAnswers] = React.useState<QuizAnswer[]>([])
  const [isSeeding, setIsSeeding] = React.useState(false)

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login")
    }
  }, [isAuthLoading, user, router])

  React.useEffect(() => {
    if (!user) return
    const unsubParticipant = subscribeParticipant(user.uid, setParticipant)
    const unsubParticipants = subscribeParticipants(setParticipants)
    const unsubUsers = subscribeUsers(setUsers)
    const unsubQuestions = subscribeQuestions(setQuestions)
    const unsubSession = subscribeQuizSession(setSession)
    const unsubAllAnswers = subscribeAllAnswers(setAllAnswers)
    return () => {
      unsubParticipant()
      unsubParticipants()
      unsubUsers()
      unsubQuestions()
      unsubSession()
      unsubAllAnswers()
    }
  }, [user])

  React.useEffect(() => {
    if (!session.currentQuestionId) {
      setCurrentAnswers([])
      return
    }
    return subscribeAnswersForQuestion(session.currentQuestionId, setCurrentAnswers)
  }, [session.currentQuestionId])

  async function handleSeed() {
    setIsSeeding(true)
    try {
      await seedMockQuestions()
      toast.success("Đã tạo dữ liệu câu hỏi mẫu.")
    } catch {
      toast.error("Không thể tạo dữ liệu mẫu.")
    } finally {
      setIsSeeding(false)
    }
  }

  async function handleSelectQuestion(questionId: string) {
    try {
      await setCurrentQuestion(questionId)
    } catch {
      toast.error("Không thể chọn câu hỏi.")
    }
  }

  async function handleReveal() {
    try {
      await revealAnswer()
    } catch {
      toast.error("Không thể hiện đáp án.")
    }
  }

  async function handleReset() {
    try {
      await resetToIdle()
    } catch {
      toast.error("Không thể đặt lại.")
    }
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (participant && participant.role !== "director") {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
        Bạn không có quyền truy cập màn hình đạo diễn.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Điều khiển sân khấu</h1>
          <p className="text-sm text-muted-foreground">
            Chọn câu hỏi, hiện đáp án và quản lý người chơi.
          </p>
        </div>
        {questions.length === 0 ? (
          <Button onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? "Đang tạo..." : "Tạo dữ liệu mẫu"}
          </Button>
        ) : null}
      </div>

      <QuizContestantStatus
        participants={participants}
        answers={currentAnswers}
        status={session.status}
      />

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
          <TabsTrigger value="leaderboard">Bảng điểm</TabsTrigger>
          <TabsTrigger value="participants">Người chơi</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <QuizDirectorControls
            questions={questions}
            session={session}
            onSelectQuestion={handleSelectQuestion}
            onReveal={handleReveal}
            onReset={handleReset}
          />
        </TabsContent>
        <TabsContent value="leaderboard">
          <QuizLeaderboard
            participants={participants}
            questions={questions}
            answers={allAnswers}
          />
        </TabsContent>
        <TabsContent value="participants">
          <QuizParticipantManager users={users} participants={participants} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
