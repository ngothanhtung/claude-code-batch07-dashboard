"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Spinner } from "@/components/ui/spinner"
import { subscribeParticipant } from "@/features/quiz/services/participant-service"
import type { QuizParticipant } from "@/features/quiz/types"
import { useAuth } from "@/hooks/use-auth"

const ROLE_PATHS: Record<QuizParticipant["role"], string> = {
  contestant: "/quiz/contestant",
  mc: "/quiz/host",
  judge: "/quiz/host",
  director: "/quiz/director",
}

export default function QuizLandingPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [participant, setParticipant] = React.useState<QuizParticipant | null | undefined>(
    undefined
  )

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login")
    }
  }, [isAuthLoading, user, router])

  React.useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeParticipant(user.uid, setParticipant)
    return unsubscribe
  }, [user])

  React.useEffect(() => {
    if (participant) {
      router.replace(ROLE_PATHS[participant.role])
    }
  }, [participant, router])

  if (isAuthLoading || !user || participant === undefined || participant) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
      <h1 className="text-lg font-semibold">Chưa được phân vai</h1>
      <p className="text-sm text-muted-foreground">
        Vui lòng liên hệ đạo diễn để được gán vai trò trong quiz.
      </p>
    </div>
  )
}
