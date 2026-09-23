interface FirestoreDocument {
  name: string
  fields?: Record<string, { stringValue?: string }>
}

interface RunQueryResult {
  document?: FirestoreDocument
}

function firestoreBaseUrl() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
}

// Resolves the role names (e.g. "sale-managers") assigned to a Firebase user
// via the roles-users junction collection. The `roleId` field stores the role
// slug directly (e.g. "sale-managers"), so no extra lookup against the
// `roles` collection is needed. Used to drive RBAC in the proxy and to
// filter which sidebar menus are shown.
export async function getUserRoleNames(uid: string, idToken: string): Promise<string[]> {
  try {
    const response = await fetch(`${firestoreBaseUrl()}:runQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "roles-users" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "userId" },
              op: "EQUAL",
              value: { stringValue: uid },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      console.error("[get-user-roles] roles-users query failed", response.status, await response.text())
      return []
    }

    const results = (await response.json()) as RunQueryResult[]
    return results
      .map((result) => result.document?.fields?.roleId?.stringValue)
      .filter((roleId): roleId is string => Boolean(roleId))
  } catch (error) {
    console.error("[get-user-roles] failed to resolve roles", error)
    return []
  }
}
