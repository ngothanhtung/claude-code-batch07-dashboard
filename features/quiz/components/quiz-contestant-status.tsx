import { cn } from "cn"
import type { QuizAnswer, QuizParticipant, QuizSessionStatus } from "@/features/quiz/types"

const SEATS = [1, 2, 3, 4]

export function QuizContestantStatus({
  participants,
  answers,
  status,
}: {
  participants: QuizParticipant[]
  answers: QuizAnswer[]
  status: QuizSessionStatus
}) {
  const revealed = status === "revealed"

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {SEATS.map((seat) => {
        const contestant = participants.find(
          (p) => p.role === "contestant" && p.seat === seat
        )
        const answer = contestant
          ? answers.find((a) => a.userId === contestant.id)
          : undefined

        return (
          <div
            key={seat}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-3"
          >
            <span className="text-sm font-semibold">Thí sinh {seat}</span>
            <span className="max-w-full truncate text-xs text-muted-foreground">
              {contestant?.displayName ?? "Chưa có"}
            </span>
            <span
              className={cn(
                "size-4 rounded-full",
                !answer && "bg-red-500",
                answer && !revealed && "bg-green-500",
                answer && revealed && answer.isCorrect && "bg-green-500",
                answer && revealed && !answer.isCorrect && "bg-red-500"
              )}
              title={
                !answer
                  ? "Chưa trả lời"
                  : revealed
                    ? answer.isCorrect
                      ? "Trả lời đúng"
                      : "Trả lời sai"
                    : "Đã trả lời"
              }
            />
          </div>
        )
      })}
    </div>
  )
}
