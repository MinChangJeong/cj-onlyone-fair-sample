import type { ApiResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function getSessionToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("sessionToken")
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getSessionToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const json: ApiResponse<T> = await res.json()

  if (!json.success || json.data === null) {
    throw new Error(json.error || "요청 처리 중 오류가 발생했습니다.")
  }

  return json.data
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
}
