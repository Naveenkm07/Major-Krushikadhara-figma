import { API_BASE } from "./config"

export type InsightsRange = "6M" | "1Y" | "All"

export interface InsightsResponse {
  success: boolean
  range: InsightsRange
  generatedAt: string
  farmer: {
    name: string
    nameKn: string
    district: string
    farmSize: number
    rtcVerified: boolean
  }
  summary: {
    estimatedYieldKg: number
    estimatedRevenueInr: number
    activeCropsCount: number
    totalAcres: number
    irrigationEfficiencyPct: number
    healthyRatePct: number
    totalScans: number
    healthyScans: number
    issueScans: number
    schemesTracked: number
    avgMaturityPct: number
  }
  trendBars: Array<{
    label: string
    scorePct: number
    scanCount: number
    healthyCount: number
    issueCount: number
  }>
  cropBreakdown: Array<{
    id: string
    cropName: string
    variety: string
    acres: number
    sharePct: number
    season: string
    daysSinceSowing: number
    stageNameEn: string
    stageNameKn: string
    healthStatus: string
    estYieldKg: number
    modalPriceKg: number
    priceSource: string
    marketName: string
    estRevenueInr: number
  }>
  scanAnalytics: {
    totalScans: number
    healthyScans: number
    issueScans: number
    healthyRatePct: number
    avgConfidence: number
    topIssues: Array<{
      name: string
      count: number
      latestSeverity: string
    }>
  }
  soilAndClimate: {
    source: "soil_health_card" | "district_baseline"
    soilType: string
    irrigationType: string
    n: number
    p: number
    k: number
    ph: number
    moisturePct: number
  }
  weatherSnapshot: {
    tempC: number
    humidity: number
    chanceOfRain: number
    precip3DayMm: number
    windKph: number
    conditionEn: string
    conditionKn: string
    sprayRecommended: boolean
  } | null
  recommendations: Array<{
    id: string
    tone: "good" | "warn" | "info"
    titleEn: string
    titleKn: string
    bodyEn: string
    bodyKn: string
  }>
}

export async function fetchFarmerInsights(params: {
  mobile: string
  range: InsightsRange
  lat?: number
  lng?: number
}): Promise<InsightsResponse | null> {
  try {
    const qs = new URLSearchParams({
      mobile: params.mobile,
      range: params.range,
    })
    if (typeof params.lat === "number") qs.set("lat", String(params.lat))
    if (typeof params.lng === "number") qs.set("lng", String(params.lng))

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(`${API_BASE}/insights?${qs.toString()}`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    return json?.success ? (json as InsightsResponse) : null
  } catch {
    return null
  }
}

