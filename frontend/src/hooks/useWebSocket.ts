"use client"

import { useEffect } from "react"
import { Client } from "@stomp/stompjs"
import { useCrowdStore } from "@/stores/crowdStore"
import type { CrowdStatusBroadcast } from "@/types"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"

export function useCrowdStatus() {
  const updateLevels = useCrowdStore((s) => s.updateLevels)

  useEffect(() => {
    const client = new Client({
      brokerURL: `${WS_URL}/ws/crowd-status`,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/crowd-status", (message) => {
          const data: CrowdStatusBroadcast = JSON.parse(message.body)
          updateLevels(data)
        })
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [updateLevels])
}
