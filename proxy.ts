import { NextResponse } from "next/server"

import { auth } from "@/auth"

const PUBLIC_PATHS = new Set(["/", "/login", "/quiz/display"])

// Routes that require the signed-in user to hold at least one of the listed roles.
const ROLE_PROTECTED_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/sales", roles: ["sale-managers"] },
]

export default auth((req) => {
  const { nextUrl } = req
  const isPublicPath = PUBLIC_PATHS.has(nextUrl.pathname)

  if (!req.auth && !isPublicPath) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (req.auth) {
    const roleRule = ROLE_PROTECTED_ROUTES.find(
      (rule) => nextUrl.pathname === rule.prefix || nextUrl.pathname.startsWith(`${rule.prefix}/`)
    )
    if (roleRule) {
      const userRoles = req.auth.user?.roles ?? []
      const hasAccess = roleRule.roles.some((role) => userRoles.includes(role))
      if (!hasAccess) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
      }
    }
  }

  if (!isPublicPath) {
    const response = NextResponse.next()
    // Prevent the browser from serving these pages from bfcache/disk cache
    // after logout (e.g. via the Back button), which would bypass this proxy.
    response.headers.set("Cache-Control", "no-store, must-revalidate")
    return response
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
