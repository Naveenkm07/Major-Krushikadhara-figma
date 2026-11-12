import { Platform } from "react-native"
import { API_BASE } from "./config"
import { postMultipartFormData } from "./multipart"

export interface EquipmentDTO {
  id: string
  name: string
  type: string
  owner: string
  ownerMobile?: string
  ownerPhone?: string
  location: string
  latitude?: number
  longitude?: number
  distanceKm: number
  pricePerDay: number
  availability: "available" | "booked"
  rawAvailability?: "AVAILABLE" | "BOOKED" | "MAINTENANCE"
  rating: number
  reviews: number
  image: string
  hp: string
  fuel: string
  crops: string
  condition: string
  minDuration: string
  description?: string
  deliveryAvailable?: boolean
  deliveryFee?: number
  operatorIncluded?: boolean
  operatorFeePerDay?: number
  mine?: boolean
  notifyMe?: boolean
  requestCount?: number
  createdAt?: string
}

export interface RentalDTO {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentType?: string
  owner: string
  ownerPhone?: string
  renter?: string
  renterPhone?: string
  location: string
  image: string
  startDate: string
  endDate: string
  days: number
  pricePerDay: number
  deliveryFee?: number
  operatorFee?: number
  total: number
  pickupMode?: "pickup" | "delivery"
  operatorIncluded?: boolean
  notes?: string
  rating?: number | null
  reviewComment?: string | null
  status: "pending" | "approved" | "active" | "completed" | "cancelled" | "rejected"
  createdAt?: string
  updatedAt?: string
}

export interface OwnerRequestDTO {
  id: string
  equipmentId: string
  equipmentName: string
  renter: string
  renterPhone?: string
  location: string
  distanceKm: number
  startDate: string
  endDate: string
  days: number
  deliveryFee?: number
  operatorFee?: number
  total: number
  pickupMode?: "pickup" | "delivery"
  operatorIncluded?: boolean
  notes?: string
  rating?: number | null
  reviewComment?: string | null
  status: "pending" | "approved" | "active" | "completed" | "rejected" | "cancelled"
  createdAt?: string
}

export interface EquipmentNotificationDTO {
  id: string
  kind:
    | "request"
    | "available"
    | "accepted"
    | "rejected"
    | "starting"
    | "ending"
    | "returned"
    | "nearby"
    | "cancelled"
    | "reviewed"
  title: string
  body: string
  time: string
  read?: boolean
  equipmentId?: string
  bookingId?: string
  tpl?: string
  vars?: Record<string, string | number>
}

export interface EquipmentStatsDTO {
  listedCount: number
  pendingCount: number
  activeCount: number
  completedCount: number
  approvedEarnings: number
  completedEarnings: number
}

export interface EquipmentMarketplaceStateDTO {
  success: boolean
  source?: string
  equipment: EquipmentDTO[]
  allMarketplace?: EquipmentDTO[]
  mine: EquipmentDTO[]
  rentals: RentalDTO[]
  ownerRequests: OwnerRequestDTO[]
  notifications: EquipmentNotificationDTO[]
  stats: EquipmentStatsDTO
}

async function fetchJsonWithTimeout<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body && typeof init.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...(init.headers || {}),
      },
      signal: controller.signal,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json?.success === false) {
      const apiErr: any = new Error(json?.error || `Request failed (${res.status})`)
      apiErr.isHttpError = true
      apiErr.status = res.status
      throw apiErr
    }
    return json as T
  } finally {
    clearTimeout(timer)
  }
}

export async function syncEquipmentMarketplaceFromBackend(params: {
  mobile: string
  lat?: number
  lng?: number
  type?: string
  q?: string
  availOnly?: boolean
  sort?: string
}): Promise<EquipmentMarketplaceStateDTO | null> {
  try {
    const qs = new URLSearchParams()
    qs.set("mobile", params.mobile)
    if (typeof params.lat === "number") qs.set("lat", String(params.lat))
    if (typeof params.lng === "number") qs.set("lng", String(params.lng))
    if (params.type) qs.set("type", params.type)
    if (params.q) qs.set("q", params.q)
    if (params.availOnly) qs.set("availOnly", "true")
    if (params.sort) qs.set("sort", params.sort)

    return await fetchJsonWithTimeout<EquipmentMarketplaceStateDTO>(
      `${API_BASE}/equipment?${qs.toString()}`,
      { method: "GET" },
      9000
    )
  } catch {
    return null
  }
}

export async function uploadEquipmentPhotoToBackend(
  imageUri: string,
  mobile: string
): Promise<string> {
  const formData = new FormData()
  const rawName = imageUri.split("?")[0].split("/").pop() || `equip_${Date.now()}.jpg`
  const hasExt = /\.(jpe?g|png|webp|heic|heif)$/i.test(rawName)
  const filename = hasExt ? rawName : `equip_${Date.now()}.jpg`
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
    formData.append("image", blob, filename)
  } else {
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any)
  }
  formData.append("mobile", mobile)

  const res = await postMultipartFormData<{
    success: boolean
    imageUrl: string
    error?: string
  }>(`${API_BASE}/equipment/upload-image`, formData, 35000)

  if (!res?.success || !res.imageUrl) {
    throw new Error(res?.error || "Photo upload failed")
  }
  return res.imageUrl
}

export async function createEquipmentOnBackend(
  payload: Record<string, any>
): Promise<{ equipment: EquipmentDTO; state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(`${API_BASE}/equipment`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateEquipmentOnBackend(
  id: string,
  payload: Record<string, any>
): Promise<{ equipment: EquipmentDTO; state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(`${API_BASE}/equipment/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteEquipmentOnBackend(
  id: string,
  mobile: string
): Promise<{ state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(
    `${API_BASE}/equipment/${encodeURIComponent(id)}?mobile=${encodeURIComponent(mobile)}`,
    { method: "DELETE" }
  )
}

export async function toggleEquipmentNotifyOnBackend(
  id: string,
  mobile: string
): Promise<{ notifyMe: boolean; state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(
    `${API_BASE}/equipment/${encodeURIComponent(id)}/notify`,
    {
      method: "POST",
      body: JSON.stringify({ mobile }),
    }
  )
}

export async function createBookingOnBackend(
  equipmentId: string,
  payload: {
    mobile: string
    startDate: string
    endDate: string
    days: number
    pickupMode?: "pickup" | "delivery"
    includeOperator?: boolean
    notes?: string
  }
): Promise<{ booking: RentalDTO; state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(
    `${API_BASE}/equipment/${encodeURIComponent(equipmentId)}/book`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function updateBookingStatusOnBackend(
  bookingId: string,
  payload: { mobile: string; status: string; reason?: string }
): Promise<{ booking: RentalDTO; state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(
    `${API_BASE}/equipment/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
}

export async function reviewBookingOnBackend(
  bookingId: string,
  payload: { mobile: string; rating: number; comment?: string }
): Promise<{
  booking: RentalDTO
  equipment: EquipmentDTO | null
  state: EquipmentMarketplaceStateDTO
}> {
  return await fetchJsonWithTimeout(
    `${API_BASE}/equipment/bookings/${encodeURIComponent(bookingId)}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function markEquipmentNotifsReadOnBackend(
  mobile: string,
  notificationId?: string
): Promise<{ state: EquipmentMarketplaceStateDTO }> {
  return await fetchJsonWithTimeout(`${API_BASE}/equipment/notifications/read`, {
    method: "POST",
    body: JSON.stringify({ mobile, notificationId }),
  })
}

