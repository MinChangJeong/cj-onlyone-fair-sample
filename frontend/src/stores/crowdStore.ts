import { create } from "zustand"
import type { CrowdLevel, CrowdStatusBroadcast } from "@/types"

interface CrowdState {
  boothLevels: Record<number, { level: CrowdLevel; count: number }>
  updateLevels: (data: CrowdStatusBroadcast) => void
}

export const useCrowdStore = create<CrowdState>((set) => ({
  boothLevels: {},
  updateLevels: (data) => {
    const levels: Record<number, { level: CrowdLevel; count: number }> = {}
    for (const booth of data.booths) {
      levels[booth.boothId] = { level: booth.level, count: booth.count }
    }
    set({ boothLevels: levels })
  },
}))
