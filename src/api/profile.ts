import { Platform } from "react-native"
import { API_BASE } from "./config"
import { postMultipartFormData } from "./multipart"

export interface CropFieldDTO {
  id: string
  cropName: string
  rawCropName?: string
  variety: string
  acreage: number
  season: string
  irrigationMethod?: string
  sowingDate: string
  daysSinceSowing: number
  currentStage: string
  currentStageNameEn: string
  currentStageNameKn: string
  healthStatus: string
}

export interface BackendProfileDTO {
  id: string
  mobile: string
  name: string
  nameKn: string
  email: string
  state: string
  district: string
  taluk: string
  village: string
  farmSize: string
  experience: number
  photoUrl: string
  preferredLanguage: "en" | "kn"
  soilType: string
  irrigationType: string
  rtcVerified: boolean
  soilN: number | null
  soilP: number | null
  soilK: number | null
  soilPh: number | null
  notificationsOn: boolean
  offlineModeOn: boolean
  crops: string[]
  cropFields: CropFieldDTO[]
  scansCount: number
  savedTipsCount: number
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

export async function uploadAvatarToBackend(
  imageUri: string,
  mobile: string
): Promise<{ photoUrl: string; profile: BackendProfileDTO }> {
  const formData = new FormData()
  const rawName = imageUri.split("?")[0].split("/").pop() || `avatar_${Date.now()}.jpg`
  const hasExt = /\.(jpe?g|png|webp|heic|heif)$/i.test(rawName)
  const filename = hasExt ? rawName : `avatar_${Date.now()}.jpg`
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg"
  const mimeType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : ext === "heic" || ext === "heif"
      ? "image/heic"
      : "image/jpeg"

  if (Platform.OS === "web") {
    const response = await fetch(imageUri)
    const blob = await response.blob()
    formData.append("avatar", blob, filename)
  } else {
    formData.append("avatar", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any)
  }
  formData.append("mobile", mobile)

  const res = await postMultipartFormData<{
    success: boolean
    photoUrl: string
    profile: BackendProfileDTO
    error?: string
  }>(`${API_BASE}/profile/avatar`, formData, 30000)

  if (!res?.success || !res.profile) {
    throw new Error(res?.error || "Avatar upload failed")
  }
  return { photoUrl: res.photoUrl, profile: res.profile }
}

export async function createCropFieldOnBackend(payload: {
  mobile: string
  cropName: string
  variety?: string
  acreage: number
  season?: string
  sowingDate?: string
  irrigationMethod?: string
  healthStatus?: string
}): Promise<BackendProfileDTO> {
  const res = await fetch(`${API_BASE}/profile/fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || "Failed to add crop plot")
  }
  return json.profile
}

export async function updateCropFieldOnBackend(
  fieldId: string,
  payload: {
    mobile: string
    cropName?: string
    variety?: string
    acreage?: number
    season?: string
    sowingDate?: string
    healthStatus?: string
  }
): Promise<BackendProfileDTO> {
  const res = await fetch(`${API_BASE}/profile/fields/${encodeURIComponent(fieldId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || "Failed to update crop plot")
  }
  return json.profile
}

export async function deleteCropFieldOnBackend(
  fieldId: string,
  mobile: string
): Promise<BackendProfileDTO> {
  const res = await fetch(
    `${API_BASE}/profile/fields/${encodeURIComponent(fieldId)}?mobile=${encodeURIComponent(mobile)}`,
    { method: "DELETE" }
  )
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || "Failed to remove crop plot")
  }
  return json.profile
}

export interface BackendSavedTipDTO {
  id: string
  tipKey: string
  categoryEn: string
  categoryKn: string
  titleEn: string
  titleKn: string
  bodyEn: string
  bodyKn: string
  isUserSaved: boolean
}

export async function fetchSavedTipsFromBackend(mobile: string): Promise<BackendSavedTipDTO[] | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    const res = await fetch(`${API_BASE}/profile/saved-tips?mobile=${encodeURIComponent(mobile)}`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    return json?.success && Array.isArray(json.tips) ? json.tips : null
  } catch {
    return null
  }
}

export async function upsertSavedTipOnBackend(
  mobile: string,
  tip: Omit<BackendSavedTipDTO, "tipKey">
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/profile/saved-tips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ mobile, tipKey: tip.id, ...tip }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function deleteSavedTipOnBackend(mobile: string, tipKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/profile/saved-tips/${encodeURIComponent(tipKey)}?mobile=${encodeURIComponent(mobile)}`,
      { method: "DELETE" }
    )
    return res.ok
  } catch {
    return false
  }
}

export async function deleteProfileFromBackend(mobile: string): Promise<boolean> {
  const res = await fetch(
    `${API_BASE}/profile?mobile=${encodeURIComponent(mobile)}`,
    { method: "DELETE" }
  )
  const json = await res.json().catch(() => ({}))
  return Boolean(res.ok && json?.success)
}
