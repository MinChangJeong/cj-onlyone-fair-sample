"use client"

import { useEffect } from "react"
import { Client } from "@stomp/stompjs"
import { useCrowdStore } from "@/stores/crowdStore"
import type { CrowdStatusBroadcast } from "@/types"

function getWsUrl(): string {
  if (typeof window === "undefined") return "ws://localhost:8080"
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
  return process.env.NEXT_PUBLIC_WS_URL || `${proto}//${window.location.host}`
}

export function useCrowdStatus() {
  const updateLevels = useCrowdStore((s) => s.updateLevels)

  useEffect(() => {
    const client = new Client({
      brokerURL: `${getWsUrl()}/ws/crowd-status`,
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
