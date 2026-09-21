"use client"

import { CheckIcon } from "lucide-react"

import { cn } from "cn"
import { getOptionLetter } from "@/features/quiz/types"
import type { QuizQuestion, QuizSessionStatus } from "@/features/quiz/types"

export function QuizAnswerOptions({
  question,
  status,
  selectedOption,
  disabled,
  onSelect,
}: {
  question: QuizQuestion
  status: QuizSessionStatus
  selectedOption?: string | null
  disabled?: boolean
  onSelect: (option: string) => void
}) {
  const revealed = status === "revealed"
  const locked = disabled || Boolean(selectedOption) || revealed

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {question.answerOptions.map((option, index) => {
        const isCorrect = revealed && option === question.correctOption
        const isSelected = selectedOption === option
        const isWrongSelected = revealed && isSelected && !isCorrect

        return (
          <button
            key={option}
            type="button"
            disabled={locked}
            onClick={() => onSelect(option)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 bg-card px-5 py-6 text-left text-lg font-medium transition-colors md:text-2xl",
              !locked && "cursor-pointer hover:border-primary hover:bg-primary/5",
              locked && "cursor-not-allowed",
              isCorrect && "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400",
              isWrongSelected && "border-destructive bg-destructive/10 text-destructive",
              !isCorrect && !isWrongSelected && isSelected && "border-primary bg-primary/5",
              !isCorrect && !isWrongSelected && !isSelected && "border-transparent"
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
              {getOptionLetter(index)}
            </span>
            <span className="flex-1">{option}</span>
            {isCorrect ? <CheckIcon className="size-6 shrink-0" /> : null}
          </button>
        )
      })}
    </div>
  )
}
