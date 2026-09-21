export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  phone: string
}

export type UserProfileInput = Omit<UserProfile, "id">

export function getUserFullName(
  user: Pick<UserProfile, "firstName" | "lastName">
) {
  return `${user.lastName} ${user.firstName}`.trim()
}
