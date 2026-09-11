"use client"

import * as React from "react"
import { type User, onAuthStateChanged } from "firebase/auth"

import { auth } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  return { user, isLoading }
}
