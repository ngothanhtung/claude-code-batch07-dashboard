interface FirebaseLookupUser {
  localId: string
  email?: string
  displayName?: string
  photoUrl?: string
}

interface FirebaseLookupResponse {
  users?: FirebaseLookupUser[]
}

export async function verifyFirebaseIdToken(idToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  )

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as FirebaseLookupResponse
  return data.users?.[0] ?? null
}
