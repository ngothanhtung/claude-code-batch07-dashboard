"use client"

import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  QuizAnswer,
  QuizParticipant,
  QuizQuestion,
  QuizSession,
} from "@/features/quiz/types"

export function QuizDirectorControls({
  questions,
  session,
  onSelectQuestion,
  onReveal,
  onReset,
}: {
  questions: QuizQuestion[]
  session: QuizSession
  onSelectQuestion: (questionId: string) => void
  onReveal: () => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          disabled={session.status !== "question"}
          onClick={onReveal}
        >
          Hiện đáp án đúng
        </Button>
        <Button
          variant="outline"
          disabled={session.status === "idle"}
          onClick={onReset}
        >
          Đặt lại (ẩn câu hỏi)
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Nội dung câu hỏi</TableHead>
            <TableHead>Điểm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => {
            const isCurrent = session.currentQuestionId === question.id
            return (
              <TableRow
                key={question.id}
                className={cn(isCurrent && "bg-muted/50")}
              >
                <TableCell>{question.order}</TableCell>
                <TableCell>{question.content}</TableCell>
                <TableCell>{question.score}</TableCell>
                <TableCell>
                  {isCurrent ? (
                    <Badge variant={session.status === "revealed" ? "secondary" : "default"}>
                      {session.status === "revealed" ? "Đã hiện đáp án" : "Đang hiển thị"}
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={isCurrent ? "secondary" : "outline"}
                    onClick={() => onSelectQuestion(question.id)}
                  >
                    Chọn câu này
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function QuizLeaderboard({
  participants,
  questions,
  answers,
}: {
  participants: QuizParticipant[]
  questions: QuizQuestion[]
  answers: QuizAnswer[]
}) {
  const scoreByQuestion = new Map(questions.map((q) => [q.id, q.score]))
  const contestants = participants
    .filter((p) => p.role === "contestant")
    .sort((a, b) => (a.seat ?? 0) - (b.seat ?? 0))

  const totals = contestants.map((contestant) => {
    const total = answers
      .filter((a) => a.userId === contestant.id && a.isCorrect)
      .reduce((sum, a) => sum + (scoreByQuestion.get(a.questionId) ?? 0), 0)
    return { contestant, total }
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vị trí</TableHead>
          <TableHead>Thí sinh</TableHead>
          <TableHead className="text-right">Điểm</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {totals.map(({ contestant, total }) => (
          <TableRow key={contestant.id}>
            <TableCell>Thí sinh {contestant.seat}</TableCell>
            <TableCell>{contestant.displayName}</TableCell>
            <TableCell className="text-right font-semibold">{total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
