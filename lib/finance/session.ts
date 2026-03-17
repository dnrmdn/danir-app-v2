export function getUserIdFromSession(session: unknown): string | null {
  if (!session || typeof session !== "object") return null
  const user = (session as { user?: unknown }).user
  if (!user || typeof user !== "object") return null
  const id = (user as { id?: unknown }).id
  return typeof id === "string" && id.length > 0 ? id : null
}

