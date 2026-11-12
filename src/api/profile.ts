import { API_BASE } from "./config"

export interface BackendProfileDTO {
  id: string
  mobile: string
  name: string
  state: string
  district: string
  taluk: string
  village: string
  farmSize: string
  experience: number
  photoUrl: string
  preferredLanguage: "en" | "kn"
  crops: string[]
  scansCount: number
}

export async function fetchProfileFromBackend(
  mobile: string
): Promise<BackendProfileDTO | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(
      `${API_BASE}/profile?mobile=${encodeURIComponent(mobile)}`,
      { signal: controller.signal }
    )
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    return json?.success && json.profile ? json.profile : null
  } catch {
    return null
  }
}

export async function saveProfileToBackend(
  payload: Partial<BackendProfileDTO> & { mobile: string }
): Promise<BackendProfileDTO | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json?.success) {
      throw new Error(json?.error || `Failed to save profile (${res.status})`)
    }
    return json.profile
  } finally {
    clearTimeout(timer)
  }
}

