import { create } from "zustand"
import type { Participant, ParticipantRole } from "@/types"

interface AuthState {
  sessionToken: string | null
  participant: Participant | null
  isAuthenticated: boolean
  setSession: (token: string, participant: Participant) => void
  clearSession: () => void
  updateOnboardingDone: () => void
  hasRole: (role: ParticipantRole) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  sessionToken:
    typeof window !== "undefined"
      ? localStorage.getItem("sessionToken")
      : null,
  participant:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("participant") || "null")
      : null,
  isAuthenticated:
    typeof window !== "undefined"
      ? !!localStorage.getItem("sessionToken")
      : false,

  setSession: (token, participant) => {
    localStorage.setItem("sessionToken", token)
    localStorage.setItem("participant", JSON.stringify(participant))
    set({ sessionToken: token, participant, isAuthenticated: true })
  },

  clearSession: () => {
    localStorage.removeItem("sessionToken")
    localStorage.removeItem("participant")
    set({ sessionToken: null, participant: null, isAuthenticated: false })
  },

  updateOnboardingDone: () => {
    const { participant } = get()
    if (participant) {
      const updated = { ...participant, onboardingDone: true }
      localStorage.setItem("participant", JSON.stringify(updated))
      set({ participant: updated })
    }
  },

  hasRole: (role) => {
    const { participant } = get()
    if (!participant) return false
    if (participant.role === "ADMIN") return true
    if (participant.role === "BOOTH_OPERATOR" && role !== "ADMIN") return true
    return participant.role === role
  },
}))
