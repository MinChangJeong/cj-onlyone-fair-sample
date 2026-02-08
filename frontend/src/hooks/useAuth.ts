"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

export function useRequireAuth() {
  const router = useRouter()
  const { isAuthenticated, participant } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/qr")
      return
    }
    if (participant && !participant.onboardingDone) {
      router.replace("/onboarding")
    }
  }, [isAuthenticated, participant, router])

  return { isAuthenticated, participant }
}

export function useRequireRole(role: "BOOTH_OPERATOR" | "ADMIN") {
  const { participant } = useRequireAuth()
  const router = useRouter()
  const hasRole = useAuthStore((s) => s.hasRole)

  useEffect(() => {
    if (participant && !hasRole(role)) {
      router.replace("/booths")
    }
  }, [participant, role, router, hasRole])

  return { participant }
}
