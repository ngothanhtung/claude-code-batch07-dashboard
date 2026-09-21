import type { User } from "firebase/auth"
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { UserProfile, UserProfileInput } from "@/features/users/types"

export const USERS_COLLECTION = "users"

function splitDisplayName(displayName: string | null) {
  const parts = displayName?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return { lastName: parts[0], firstName: parts.slice(1).join(" ") }
}

// Creates the user's Firestore profile the first time they log in.
export async function ensureUserProfile(user: User) {
  const userRef = doc(db, USERS_COLLECTION, user.uid)
  const snapshot = await getDoc(userRef)
  if (snapshot.exists()) return

  const { firstName, lastName } = splitDisplayName(user.displayName)
  await setDoc(userRef, {
    firstName,
    lastName,
    phone: user.phoneNumber ?? "",
  } satisfies UserProfileInput)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...(snapshot.data() as UserProfileInput) }
}

export function subscribeUsers(
  onChange: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const users = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as UserProfileInput),
      }))
      onChange(users)
    },
    (error) => onError?.(error)
  )
}
