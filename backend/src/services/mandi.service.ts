// ==============================================================================
// GPS-Based Mandi Discovery & Live AGMARKNET Price Service
// Queries verified agricultural mandis from PostgreSQL and matches them with
// official real-time Government of India (data.gov.in AGMARKNET) commodity prices.
// ==============================================================================

import "../config/env.js"
import { prisma, withDbRetry } from "../config/db.js"
import { VERIFIED_MANDIS } from "../data/verifiedMandis.js"
import { calculateHaversineKm, getBoundingBox, isValidCoordinate } from "../utils/geo.js"
import { resolveGovtCommodityNames } from "../utils/cropMapping.js"

const DEFAULT_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes price cache to prevent 429 rate limits
const MANDI_DIR_CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes verified APMC directory cache

export const DEFAULT_FARMER_COORDS = {
  latitude: 12.5244,
  longitude: 76.8958, // Mandya, Karnataka
}

interface MandiDirectoryEntry {
  id: bigint | number | string
  name: string
  state: string
  district: string | null
  latitude: number
  longitude: number
  isVerified: boolean
  locationSource: string | null
}

let mandiDirectoryCache: { items: MandiDirectoryEntry[]; expiresAt: number } | null = null
let mandiDirectoryLoadPromise: Promise<MandiDirectoryEntry[]> | null = null

async function getMandiDirectory(): Promise<MandiDirectoryEntry[]> {
  if (mandiDirectoryCache && Date.now() < mandiDirectoryCache.expiresAt) {
    return mandiDirectoryCache.items
  }
  if (mandiDirectoryLoadPromise) {
    return mandiDirectoryLoadPromise
  }

  mandiDirectoryLoadPromise = (async () => {
    try {
      const dbMandis = await withDbRetry(
        () => prisma.mandi.findMany(),
        "Load verified mandis directory",
        3
      )
      const merged: MandiDirectoryEntry[] = [...dbMandis]
      const seenNames = new Set(merged.map((m) => normalizeMarketName(m.name)))
      VERIFIED_MANDIS.forEach((m, idx) => {
        if (!seenNames.has(normalizeMarketName(m.name))) {
          seenNames.add(normalizeMarketName(m.name))
          merged.push({
            id: `verified-${idx + 1}`,
            name: m.name,
            state: m.state,
            district: m.district,
            latitude: m.latitude,
            longitude: m.longitude,
            isVerified: m.isVerified,
            locationSource: m.locationSource,
          })
        }
      })

      mandiDirectoryCache = {
        items: merged,
        expiresAt: Date.now() + MANDI_DIR_CACHE_TTL_MS,
      }
      return merged
    } catch (err: any) {
      console.warn(
        "⚠️ [Mandi Directory] PostgreSQL unavailable, using built-in KSAMB verified fallback directory:",
        err?.message || err
      )
      if (mandiDirectoryCache) return mandiDirectoryCache.items
      return VERIFIED_MANDIS.map((m, idx) => ({
        id: `verified-${idx + 1}`,
        name: m.name,
        state: m.state,
        district: m.district,
        latitude: m.latitude,
        longitude: m.longitude,
        isVerified: m.isVerified,
        locationSource: m.locationSource,
      }))
    } finally {
      mandiDirectoryLoadPromise = null
    }
  })()

  return mandiDirectoryLoadPromise
}

export async function warmUpMandiDirectory(): Promise<void> {
  const items = await getMandiDirectory()
  console.log(`🌾 [Mandi Directory] Preloaded ${items.length} verified APMCs in cache.`)
}

// ---------------------------------------------------------------------
// In-Memory Cache for External Government API Responses
// ---------------------------------------------------------------------
interface CacheEntry {
  data: any
  expiresAt: number
}

const govtPriceCache = new Map<string, CacheEntry>()
const pendingGovtRequests = new Map<string, Promise<any>>()

function getCachedData(key: string): any | null {
  const entry = govtPriceCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    govtPriceCache.delete(key)
    return null
  }
  return entry.data
}

function setCachedData(key: string, data: any): void {
  govtPriceCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
  if (govtPriceCache.size > 150) {
    const firstKey = govtPriceCache.keys().next().value
    if (firstKey) govtPriceCache.delete(firstKey)
  }
}

const KARNATAKA_NAME_ALIASES: Array<[RegExp, string]> = [
  [/\bbelgaum\b/g, "belagavi"],
  [/\bbangalore\b/g, "bengaluru"],
  [/\bmysore\b/g, "mysuru"],
  [/\btumkur\b/g, "tumakuru"],
  [/\bshimoga\b/g, "shivamogga"],
  [/\bhubli\b/g, "hubballi"],
  [/\bbellary\b/g, "ballari"],
  [/\bdavangere\b/g, "davanagere"],
  [/\bchikkaballapur\b/g, "chikkaballapura"],
  [/\bsrinivasapur\b/g, "srinivaspur"],
  [/\bmangalore\b/g, "mangaluru"],
  [/\bgulbarga\b/g, "kalaburagi"],
  [/\bbijapur\b/g, "vijayapura"],
]

/**
 * Normalizes market/district strings for reliable fuzzy-safe matching.
 * E.g., "Ramanagara APMC" -> "ramanagara", "Belgaum APMC (Belagavi)" -> "belagavi"
 */
export function normalizeMarketName(val?: string | null): string {
  if (!val) return ""
  let normalized = val
    .toLowerCase()
    .replace(/\b(apmc|market|yard|sub-market|sub yard)\b/gi, "")
    .replace(/[(),.\-/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  for (const [pattern, replacement] of KARNATAKA_NAME_ALIASES) {
    normalized = normalized.replace(pattern, replacement)
  }

  return normalized.replace(/\s+/g, " ").trim()
}

function normalizeDistrictName(val?: string | null): string {
  return normalizeMarketName(val)
    .replace(/\b(urban|rural|south|north|east|west)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function doesRecordMatchMandi(record: any, normMandiName: string, normDistrict: string): boolean {
  const normGovtMarket = normalizeMarketName(record.market || record.Market)
  const rawGovtDistrict = (record.district || record.District || "").toLowerCase().trim()
  const normGovtDistrict = normalizeDistrictName(rawGovtDistrict)

  if (!normGovtMarket || !normMandiName) return false

  const marketMatch =
    normGovtMarket === normMandiName ||
    normGovtMarket.includes(normMandiName) ||
    normMandiName.includes(normGovtMarket)

  if (!marketMatch) return false

  if (!normDistrict || !normGovtDistrict) return true

  return (
    normGovtDistrict === normDistrict ||
    normGovtDistrict.includes(normDistrict) ||
    normDistrict.includes(normGovtDistrict) ||
    rawGovtDistrict === "bengaluru south"
  )
}

function pickBestMatchingRecord(records: any[], normMandiName: string, normDistrict: string): any | undefined {
  const matches = records.filter((r) => doesRecordMatchMandi(r, normMandiName, normDistrict))
  if (matches.length === 0) return undefined
  if (matches.length === 1) return matches[0]

  return matches.sort((a, b) => {
    const aModal = parseFloat(String(a.modal_price || a.Modal_Price || "0").replace(/,/g, "")) || 0
    const bModal = parseFloat(String(b.modal_price || b.Modal_Price || "0").replace(/,/g, "")) || 0
    const aHasModal = aModal > 0 ? 1 : 0
    const bHasModal = bModal > 0 ? 1 : 0
    if (aHasModal !== bHasModal) return bHasModal - aHasModal

    const aFaq = String(a.grade || a.Grade || "").toUpperCase() === "FAQ" ? 1 : 0
    const bFaq = String(b.grade || b.Grade || "").toUpperCase() === "FAQ" ? 1 : 0
    return bFaq - aFaq
  })[0]
}

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

export interface NearbyMandiResponse {
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
  error?: string
}

/**
 * Fetches raw live price records from data.gov.in AGMARKNET.
 */
export async function fetchGovtPricesRaw(commodityFilter?: string, state = "Karnataka"): Promise<any[]> {
  const apiKey = (process.env.MANDI_API_KEY || process.env.DATA_GOV_IN_API_KEY || "").trim()
  const resourceId = (process.env.DATA_GOV_IN_RESOURCE_ID || DEFAULT_RESOURCE_ID).trim()

  if (!apiKey || !resourceId) {
    console.warn("⚠️ [Govt Mandi API] MANDI_API_KEY/DATA_GOV_IN_API_KEY or RESOURCE_ID missing in backend/.env")
    return []
  }

  const cacheKey = `${state.toLowerCase()}_${(commodityFilter || "all").toLowerCase()}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    console.log(`⚡ [Govt Mandi Cache] Cache hit for: ${cacheKey}`)
    return cached
  }

  // Deduplicate inflight requests
  const existing = pendingGovtRequests.get(cacheKey)
  if (existing) {
    return await existing
  }

  const fetchPromise = (async () => {
    const url = new URL(`https://api.data.gov.in/resource/${resourceId}`)
    url.searchParams.set("api-key", apiKey)
    url.searchParams.set("format", "json")
    url.searchParams.set("limit", "500")
    url.searchParams.set("offset", "0")

    if (state && state.toLowerCase() !== "all") {
      url.searchParams.set("filters[state.keyword]", state)
    }

    if (commodityFilter && commodityFilter.toLowerCase() !== "all") {
      url.searchParams.set("filters[commodity]", commodityFilter)
    }

    console.log(`🌐 [Govt Mandi API] Requesting data.gov.in: ${url.toString()}`)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12000)

    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (res.status === 429) {
        throw new Error("HTTP 429: Government API rate limit reached.")
      }

      if (!res.ok) {
        throw new Error(`Government API returned HTTP ${res.status}: ${res.statusText}`)
      }

      const json = (await res.json()) as any
      const records = Array.isArray(json.records) ? json.records : []
      setCachedData(cacheKey, records)
      return records
    } catch (err) {
      clearTimeout(timer)
      throw err
    }
  })()

  pendingGovtRequests.set(cacheKey, fetchPromise)

  try {
    return await fetchPromise
  } finally {
    pendingGovtRequests.delete(cacheKey)
  }
}

/**
 * Discovers nearby mandis from PostgreSQL within radiusKm and matches with real AGMARKNET prices.
 */
export async function discoverNearbyMandisWithPrices(params: {
  lat: number
  lng: number
  crop?: string
  radiusKm?: number
  limit?: number
}): Promise<NearbyMandiResponse> {
  const { lat, lng } = params
  // Include a small 12% margin so a mandi at 50.5km is not excluded by a 0.5km fraction when radius is 50km
  const requestedRadius = params.radiusKm ? Math.max(10, Math.min(params.radiusKm, 500)) : 50
  const effectiveRadius = requestedRadius <= 50 ? 55 : requestedRadius
  const limit = params.limit ? Math.max(1, Math.min(params.limit, 20)) : 5
  const crop = params.crop && params.crop.trim() !== "All" ? params.crop.trim() : "Tomato"

  if (!isValidCoordinate(lat, lng)) {
    throw new Error(
      `Invalid GPS coordinates: latitude=${lat}, longitude=${lng}. Lat must be between -90 and 90, lng between -180 and 180.`
    )
  }

  // 1. Fetch live government prices for the requested crop & Karnataka active commodities in parallel
  let govtRecords: any[] = []
  let allKarnatakaGovtRecords: any[] = []
  let rateLimited = false
  const commodityAliases = resolveGovtCommodityNames(crop)
  const primaryCommodity = commodityAliases[0] || crop

  const [allResult, cropResult] = await Promise.allSettled([
    fetchGovtPricesRaw("all", "Karnataka"),
    fetchGovtPricesRaw(primaryCommodity, "Karnataka"),
  ])

  if (allResult.status === "fulfilled") {
    allKarnatakaGovtRecords = allResult.value
  } else {
    const errMsg = allResult.reason?.message || ""
    if (errMsg.includes("429")) rateLimited = true
    console.warn("⚠️ [Mandi Discovery] Failed state-wide govt fetch:", errMsg)
  }

  if (cropResult.status === "fulfilled") {
    govtRecords = cropResult.value
  } else {
    const errMsg = cropResult.reason?.message || ""
    if (errMsg.includes("429")) rateLimited = true
    console.warn("⚠️ [Mandi Discovery] Failed primary commodity fetch:", errMsg)
  }

  // Merge ALL matching commodity alias rows from cached Karnataka AGMARKNET records so aliases
  // like Paddy(Common) + Rice or Ragi(Finger Millet) are never missed when primaryCommodity returns partial results
  const aliasSet = new Set(
    [crop, ...commodityAliases]
      .map((c) => c.toLowerCase().trim())
      .filter((c) => c.length >= 3)
  )

  const matchesRequestedCommodity = (rawCommodity: string): boolean => {
    const c = rawCommodity.toLowerCase().trim()
    if (!c) return false
    if (aliasSet.has(c)) return true
    const cBase = c.split("(")[0].trim()
    for (const a of aliasSet) {
      const aBase = a.split("(")[0].trim()
      if (cBase && aBase && cBase === aBase) return true
      // Word-boundary match for explicit full alias phrases (never single ambiguous words like "finger")
      if (a.length >= 4 && new RegExp(`(^|[^a-z])${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(c)) {
        return true
      }
    }
    return false
  }

  if (govtRecords.length > 0) {
    govtRecords = govtRecords.filter((r) =>
      matchesRequestedCommodity(String(r.commodity || r.Commodity || ""))
    )
  }

  if (allKarnatakaGovtRecords.length > 0) {
    const fromStateAll = allKarnatakaGovtRecords.filter((r) =>
      matchesRequestedCommodity(String(r.commodity || r.Commodity || ""))
    )
    if (fromStateAll.length > 0) {
      // Combine API-filtered primary rows + alias matches from state-wide feed without duplicates
      const seenRow = new Set<string>()
      const combined: any[] = []
      for (const r of [...govtRecords, ...fromStateAll]) {
        const key = `${r.market || r.Market}_${r.commodity || r.Commodity}_${r.variety || ""}_${r.modal_price || ""}`
        if (!seenRow.has(key)) {
          seenRow.add(key)
          combined.push(r)
        }
      }
      govtRecords = combined
    }
  }

  if (govtRecords.length === 0 && commodityAliases.length > 1 && !rateLimited) {
    for (let i = 1; i < commodityAliases.length; i++) {
      try {
        const fallbackRecords = await fetchGovtPricesRaw(commodityAliases[i], "Karnataka")
        if (fallbackRecords.length > 0) {
          govtRecords = fallbackRecords
          break
        }
      } catch (err: any) {
        if (err?.message?.includes("429")) {
          rateLimited = true
          break
        }
      }
    }
  }

  // Extract distinct commodities currently trading in Karnataka today
  const activeCommoditiesToday = Array.from(
    new Set(allKarnatakaGovtRecords.map((r) => r.commodity || r.Commodity).filter(Boolean))
  )

  // 2. Load verified mandis directory (from Neon PostgreSQL with 30m cache + KSAMB fallback)
  const bbox = getBoundingBox(lat, lng, effectiveRadius)
  const allKarnatakaMandis = await getMandiDirectory()
  const candidateMandis = allKarnatakaMandis.filter(
    (m) =>
      m.latitude >= bbox.minLat &&
      m.latitude <= bbox.maxLat &&
      m.longitude >= bbox.minLng &&
      m.longitude <= bbox.maxLng
  )

  // Calculate precise Haversine distance and filter within effective radius
  const allNearbyMandis = candidateMandis
    .map((m) => ({
      ...m,
      distanceKm: calculateHaversineKm(lat, lng, m.latitude, m.longitude),
    }))
    .filter((m) => m.distanceKm <= effectiveRadius)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  console.log(`📍 [Mandi Discovery] Found ${allNearbyMandis.length} mandis within ${effectiveRadius}km of (${lat}, ${lng})`)

  // 3. Match Mandi Locations with Government Price Records
  const mappedResults: NearbyMandiItem[] = allNearbyMandis.map((mandi) => {
    const normMandiName = normalizeMarketName(mandi.name)
    const normDistrict = normalizeDistrictName(mandi.district)

    const match = pickBestMatchingRecord(govtRecords, normMandiName, normDistrict)

    if (match) {
      const modalQ = parseFloat(String(match.modal_price || match.Modal_Price || "0").replace(/,/g, "")) || 0
      const minQ = parseFloat(String(match.min_price || match.Min_Price || "0").replace(/,/g, "")) || 0
      const maxQ = parseFloat(String(match.max_price || match.Max_Price || "0").replace(/,/g, "")) || 0

      const modalKg = Math.round((modalQ / 100) * 10) / 10
      const minKg = Math.round((minQ / 100) * 10) / 10
      const maxKg = Math.round((maxQ / 100) * 10) / 10

      return {
        id: mandi.id.toString(),
        mandi: mandi.name,
        district: mandi.district || "Karnataka",
        state: mandi.state,
        latitude: mandi.latitude,
        longitude: mandi.longitude,
        distanceKm: mandi.distanceKm,
        minPrice: minQ,
        maxPrice: maxQ,
        modalPrice: modalQ,
        minPriceKg: minKg,
        maxPriceKg: maxKg,
        modalPriceKg: modalKg,
        unit: "INR/quintal",
        arrivalDate: match.arrival_date || match.Arrival_Date || new Date().toLocaleDateString("en-GB"),
        commodity: match.commodity || match.Commodity || crop,
        variety: match.variety || match.Variety || "Standard",
        grade: match.grade || match.Grade || "FAQ",
        source: "AGMARKNET (Official Government of India)",
        isVerified: mandi.isVerified,
        locationSource: mandi.locationSource,
        hasPrice: true,
      }
    }

    // No verified price logged today for this specific mandi
    return {
      id: mandi.id.toString(),
      mandi: mandi.name,
      district: mandi.district || "Karnataka",
      state: mandi.state,
      latitude: mandi.latitude,
      longitude: mandi.longitude,
      distanceKm: mandi.distanceKm,
      minPrice: null,
      maxPrice: null,
      modalPrice: null,
      minPriceKg: null,
      maxPriceKg: null,
      modalPriceKg: null,
      unit: "INR/quintal",
      arrivalDate: null,
      commodity: crop,
      variety: null,
      grade: null,
      source: "AGMARKNET (No arrival reported today)",
      isVerified: mandi.isVerified,
      locationSource: mandi.locationSource,
      hasPrice: false,
    }
  })

  // 4. Intelligent sorting:
  // Show mandis with verified active prices FIRST, followed by closest mandis
  mappedResults.sort((a, b) => {
    if (a.hasPrice && !b.hasPrice) return -1
    if (!a.hasPrice && b.hasPrice) return 1
    return a.distanceKm - b.distanceKm
  })

  const results = mappedResults.slice(0, limit)

  // 5. Check nearest verified mandi in Karnataka that has an active price for this crop today
  let nearestActiveMarket: NearbyMandiItem | null = null
  if (govtRecords.length > 0) {
    const activeCandidates = allKarnatakaMandis
      .map((m) => {
        const normMandiName = normalizeMarketName(m.name)
        const normDistrict = normalizeDistrictName(m.district)
        const match = pickBestMatchingRecord(govtRecords, normMandiName, normDistrict)
        if (!match) return null

        const modalQ = parseFloat(String(match.modal_price || match.Modal_Price || "0").replace(/,/g, "")) || 0
        const minQ = parseFloat(String(match.min_price || match.Min_Price || "0").replace(/,/g, "")) || 0
        const maxQ = parseFloat(String(match.max_price || match.Max_Price || "0").replace(/,/g, "")) || 0

        return {
          id: m.id.toString(),
          mandi: m.name,
          district: m.district || "Karnataka",
          state: m.state,
          latitude: m.latitude,
          longitude: m.longitude,
          distanceKm: calculateHaversineKm(lat, lng, m.latitude, m.longitude),
          minPrice: minQ,
          maxPrice: maxQ,
          modalPrice: modalQ,
          minPriceKg: Math.round((minQ / 100) * 10) / 10,
          maxPriceKg: Math.round((maxQ / 100) * 10) / 10,
          modalPriceKg: Math.round((modalQ / 100) * 10) / 10,
          unit: "INR/quintal",
          arrivalDate: match.arrival_date || match.Arrival_Date || "Today",
          commodity: match.commodity || crop,
          variety: match.variety || "Standard",
          grade: match.grade || "FAQ",
          source: "AGMARKNET (Official Government of India)",
          isVerified: m.isVerified,
          locationSource: m.locationSource,
          hasPrice: true,
        }
      })
      .filter(Boolean) as NearbyMandiItem[]

    activeCandidates.sort((a, b) => a.distanceKm - b.distanceKm)
    nearestActiveMarket = activeCandidates[0] || null

    if (!nearestActiveMarket) {
      const stateMatch = govtRecords.find((r) => {
        const modal = parseFloat(String(r.modal_price || r.Modal_Price || "0").replace(/,/g, "")) || 0
        return modal > 0
      }) || govtRecords[0]

      if (stateMatch) {
        const modalQ = parseFloat(String(stateMatch.modal_price || stateMatch.Modal_Price || "0").replace(/,/g, "")) || 0
        const minQ = parseFloat(String(stateMatch.min_price || stateMatch.Min_Price || "0").replace(/,/g, "")) || 0
        const maxQ = parseFloat(String(stateMatch.max_price || stateMatch.Max_Price || "0").replace(/,/g, "")) || 0
        nearestActiveMarket = {
          id: "agmarknet-state-1",
          mandi: stateMatch.market || stateMatch.Market || "Karnataka APMC",
          district: stateMatch.district || stateMatch.District || "Karnataka",
          state: stateMatch.state || stateMatch.State || "Karnataka",
          latitude: lat,
          longitude: lng,
          distanceKm: 0,
          minPrice: minQ,
          maxPrice: maxQ,
          modalPrice: modalQ,
          minPriceKg: Math.round((minQ / 100) * 10) / 10,
          maxPriceKg: Math.round((maxQ / 100) * 10) / 10,
          modalPriceKg: Math.round((modalQ / 100) * 10) / 10,
          unit: "INR/quintal",
          arrivalDate: stateMatch.arrival_date || stateMatch.Arrival_Date || "Today",
          commodity: stateMatch.commodity || stateMatch.Commodity || crop,
          variety: stateMatch.variety || stateMatch.Variety || "Standard",
          grade: stateMatch.grade || stateMatch.Grade || "FAQ",
          source: "AGMARKNET (Official Government of India)",
          isVerified: true,
          locationSource: "AGMARKNET State Registry",
          hasPrice: modalQ > 0,
        }
      }
    }
  }

  return {
    success: true,
    crop,
    radiusKm: requestedRadius,
    farmerLocation: { latitude: lat, longitude: lng },
    totalMandisFound: results.length,
    results,
    nearestActiveMarket,
    activeCommoditiesToday,
    source: "data.gov.in (AGMARKNET & KSAMB Verified Directory)",
    rateLimited,
  }
}

/**
 * Backward-compatible general live mandi price proxy.
 */
export async function fetchGovtMandiPrices(params: {
  state?: string
  district?: string
  market?: string
  commodity?: string
  variety?: string
  grade?: string
  limit?: number
  offset?: number
  userLat?: number
  userLng?: number
}): Promise<any> {
  const lat = params.userLat ?? DEFAULT_FARMER_COORDS.latitude
  const lng = params.userLng ?? DEFAULT_FARMER_COORDS.longitude
  const crop = params.commodity && params.commodity.toLowerCase() !== "all" ? params.commodity : "Tomato"

  const nearby = await discoverNearbyMandisWithPrices({
    lat,
    lng,
    crop,
    radiusKm: 100,
    limit: params.limit || 10,
  })

  return {
    success: true,
    total: nearby.totalMandisFound,
    count: nearby.results.length,
    source: nearby.source,
    farmerLocation: nearby.farmerLocation,
    records: nearby.results.map((r) => ({
      commodity: r.commodity,
      marketName: r.mandi,
      district: r.district,
      state: r.state,
      variety: r.variety || "Standard",
      grade: r.grade || "FAQ",
      minPriceKg: r.minPriceKg || 0,
      maxPriceKg: r.maxPriceKg || 0,
      modalPriceKg: r.modalPriceKg || 0,
      minPriceQuintal: r.minPrice || 0,
      maxPriceQuintal: r.maxPrice || 0,
      modalPriceQuintal: r.modalPrice || 0,
      arrivalDate: r.arrivalDate || "Today",
      distanceKm: r.distanceKm,
      source: r.source,
      isVerified: r.isVerified,
    })),
  }
}
