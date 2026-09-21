import { CheckIcon } from "lucide-react"

import { cn } from "cn"
import { getOptionLetter } from "@/features/quiz/types"
import type { QuizQuestion, QuizSessionStatus } from "@/features/quiz/types"

export function QuizQuestionDisplay({
  question,
  status,
  selectedOption,
  className,
}: {
  question: QuizQuestion
  status: QuizSessionStatus
  selectedOption?: string | null
  className?: string
}) {
  const revealed = status === "revealed"

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="rounded-xl bg-primary px-6 py-8 text-center text-2xl font-semibold text-primary-foreground md:text-4xl">
        {question.content}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {question.answerOptions.map((option, index) => {
          const isCorrect = revealed && option === question.correctOption
          const isSelected = selectedOption === option

          return (
            <div
              key={option}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 bg-card px-5 py-6 text-lg font-medium md:text-2xl",
                isCorrect && "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400",
                !isCorrect && isSelected && "border-primary bg-primary/5",
                !isCorrect && !isSelected && "border-transparent"
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                {getOptionLetter(index)}
              </span>
              <span className="flex-1">{option}</span>
              {isCorrect ? <CheckIcon className="size-6 shrink-0" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
