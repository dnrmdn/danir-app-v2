"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"

export function useAuthGuard() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/")
    }
  }, [session, isPending, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return { session, isPending, handleSignOut }
}
