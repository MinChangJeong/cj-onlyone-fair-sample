export type ParticipantRole = "PARTICIPANT" | "BOOTH_OPERATOR" | "ADMIN"
export type ResonanceType = "SUPPORT" | "SHARED_EXPERIENCE"
export type CheckInMethod = "QR" | "MANUAL"
export type CrowdLevel = "LOW" | "MEDIUM" | "HIGH"

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  timestamp: string
}

export interface Participant {
  id: number
  displayName: string | null
  role: ParticipantRole
  onboardingDone: boolean
}

export interface AuthResponse {
  sessionToken: string
  role: ParticipantRole
  onboardingDone: boolean
  displayName: string | null
}

export interface GrowthKeyword {
  id: number
  name: string
  nameEn: string | null
}

export interface BoothListItem {
  id: number
  code: string
  name: string
  locationDesc: string | null
  keywords: GrowthKeyword[]
  crowdLevel: CrowdLevel
  crowdCount: number
}

export interface BoothDetail {
  id: number
  code: string
  name: string
  ideaSummary: string | null
  wrongAssumption: string | null
  trialMoments: string | null
  learningPivot: string | null
  currentState: string | null
  locationDesc: string | null
  keywords: GrowthKeyword[]
  crowdLevel: CrowdLevel
  crowdCount: number
}

export interface CheckInItem {
  id: number
  boothId: number
  boothCode: string
  boothName: string
  method: CheckInMethod
  checkedInAt: string
}

export interface LearningRecord {
  id: number
  boothId: number
  boothName: string
  participantId: number
  participantName: string | null
  content: string
  keywords: GrowthKeyword[]
  supportCount: number
  sharedExperienceCount: number
  myResonances: string[]
  createdAt: string
  updatedAt: string
}

export interface ResonanceResponse {
  id: number
  recordId: number
  type: ResonanceType
  toggled: boolean
  createdAt: string | null
}

export interface BoothCrowdStatus {
  boothId: number
  code: string
  level: CrowdLevel
  count: number
}

export interface CrowdStatusBroadcast {
  booths: BoothCrowdStatus[]
  timestamp: string
}
