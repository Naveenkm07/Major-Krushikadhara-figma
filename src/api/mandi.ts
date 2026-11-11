// ==============================================================================
// Live Government Mandi Price & Discovery API Client (data.gov.in / AGMARKNET)
// Connects to the backend proxy which queries PostgreSQL verified mandis and
// data.gov.in AGMARKNET wholesale rates.
// ==============================================================================

import { API_BASE } from "./config"

export interface NearbyMandiItem {
  id: string
  mandi: string
  district: string
  state: string
  latitude: number
  longitude: number
  distanceKm: number
  minPrice: number | null
  maxPrice: number | null
  modalPrice: number | null
  minPriceKg: number | null
  maxPriceKg: number | null
  modalPriceKg: number | null
  unit: string
  arrivalDate: string | null
  commodity: string
  variety: string | null
  grade: string | null
  source: string
  isVerified: boolean
  locationSource: string | null
  hasPrice: boolean
}

export interface FetchNearbyMandisResult {
  success: boolean
  crop: string
  radiusKm: number
  farmerLocation: { latitude: number; longitude: number }
  totalMandisFound: number
  results: NearbyMandiItem[]
  nearestActiveMarket?: NearbyMandiItem | null
  activeCommoditiesToday?: string[]
  source: string
  rateLimited?: boolean
  errorMessage?: string
}

/**
 * Discovers the nearest 5 verified agricultural mandis in PostgreSQL within a radius (default 50km)
 * and retrieves real-time wholesale prices for the farmer's crop.
 */
export async function fetchNearbyMandis(params: {
  lat: number
  lng: number
  crop?: string
  radiusKm?: number
  limit?: number
}): Promise<FetchNearbyMandisResult> {
  const query = new URLSearchParams()
  query.append("lat", params.lat.toString())
  query.append("lng", params.lng.toString())
  if (params.crop && params.crop !== "All") query.append("crop", params.crop.trim())
  if (params.radiusKm) query.append("radius", params.radiusKm.toString())
  if (params.limit) query.append("limit", params.limit.toString())

  const url = `${API_BASE}/mandi/nearby?${query.toString()}`
  console.log(`🌐 [Nearby Mandi Client] Fetching: ${url}`)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      const errJson = await res.json().catch(() => null)
      if (res.status === 429) {
        return {
          success: false,
          crop: params.crop || "Tomato",
          radiusKm: params.radiusKm || 50,
          farmerLocation: { latitude: params.lat, longitude: params.lng },
          totalMandisFound: 0,
          results: [],
          source: "data.gov.in (AGMARKNET)",
          rateLimited: true,
          errorMessage: "ಸರ್ಕಾರಿ API ಮಿತಿ ತಲುಪಿತು. 1 ನಿಮಿಷ ಕಾದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. / Govt API rate limit hit (HTTP 429). Wait 1 min & retry.",
        }
      }
      throw new Error(errJson?.message || `Server returned HTTP ${res.status}`)
    }

    const data: FetchNearbyMandisResult = await res.json()
    return data
  } catch (err: any) {
    const isAbort = err?.name === "AbortError"
    console.error("❌ [Nearby Mandi API Error]:", err?.message)
    return {
      success: false,
      crop: params.crop || "Tomato",
      radiusKm: params.radiusKm || 50,
      farmerLocation: { latitude: params.lat, longitude: params.lng },
      totalMandisFound: 0,
      results: [],
      source: "data.gov.in (AGMARKNET)",
      rateLimited: err?.message?.includes("429"),
      errorMessage: isAbort
        ? "ಸರ್ವರ್ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಲಿಲ್ಲ (Timeout). ದಯವಿಟ್ಟು ಬ್ಯಾಕೆಂಡ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಪರಿಶೀಲಿಸಿ."
        : err?.message || "Failed to reach backend service",
    }
  }
}

/**
 * Backward compatibility helper for legacy call sites.
 */
export async function fetchLiveGovtMandiRates(params?: {
  commodity?: string
  district?: string
  lat?: number
  lng?: number
  limit?: number
}) {
  const lat = params?.lat ?? 12.5244
  const lng = params?.lng ?? 76.8958
  const crop = params?.commodity || "Tomato"

  const res = await fetchNearbyMandis({
    lat,
    lng,
    crop,
    radiusKm: 100,
    limit: params?.limit || 10,
  })

  return {
    success: res.success,
    total: res.totalMandisFound,
    count: res.results.length,
    source: res.source,
    rateLimited: res.rateLimited,
    errorMessage: res.errorMessage,
    data: res.results.map((r) => ({
      commodity: r.commodity,
      marketName: r.mandi,
      district: r.district,
      state: r.state,
      variety: r.variety || "Standard",
      grade: r.grade || "FAQ",
      modalPriceKg: r.modalPriceKg || 0,
      minPriceKg: r.minPriceKg || 0,
      maxPriceKg: r.maxPriceKg || 0,
      modalPriceQuintal: r.modalPrice || 0,
      minPriceQuintal: r.minPrice || 0,
      maxPriceQuintal: r.maxPrice || 0,
      arrivalDate: r.arrivalDate || "Today",
      distanceKm: r.distanceKm,
      source: r.source,
      hasPrice: r.hasPrice,
    })),
  }
}
