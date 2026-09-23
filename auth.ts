import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { getUserRoleNames } from "@/lib/get-user-roles"
import { verifyFirebaseIdToken } from "@/lib/verify-firebase-token"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        idToken: { label: "Firebase ID token", type: "text" },
      },
      authorize: async (credentials) => {
        const idToken = credentials?.idToken
        if (typeof idToken !== "string" || !idToken) return null

        const firebaseUser = await verifyFirebaseIdToken(idToken)
        if (!firebaseUser) return null

        const roles = await getUserRoleNames(firebaseUser.localId, idToken)

        return {
          id: firebaseUser.localId,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          image: firebaseUser.photoUrl,
          roles,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles ?? []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.roles = (token.roles as string[] | undefined) ?? []
      }
      return session
    },
  },
})
