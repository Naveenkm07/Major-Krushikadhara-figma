// ==============================================================================
// Live Agricultural Weather Service (WeatherAPI.com)
// Provides real-time weather metrics, 3-day forecast, and agronomical advisories
// based on dynamic GPS coordinates collected from the farmer.
// ==============================================================================

import dotenv from "dotenv"
dotenv.config()

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "ceb65eb731d94e998e2164550260911"
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes cache

interface WeatherCacheEntry {
  data: any
  expiresAt: number
}

const weatherCache = new Map<string, WeatherCacheEntry>()

export interface ForecastDayItem {
  date: string
  dayNameEn: string
  dayNameKn: string
  maxTempC: number
  minTempC: number
  avgTempC: number
  conditionTextEn: string
  conditionTextKn: string
  iconUrl: string
  chanceOfRain: number
  totalPrecipMm: number
  maxWindKph: number
  humidity: number
  uv: number
}

export interface LiveWeatherData {
  location: {
    name: string
    region: string
    country: string
    latitude: number
    longitude: number
    localtime: string
  }
  current: {
    tempC: number
    tempF: number
    feelsLikeC: number
    conditionTextEn: string
    conditionTextKn: string
    iconUrl: string
    humidity: number
    windKph: number
    windDir: string
    precipMm: number
    chanceOfRain: number
    uv: number
    pressureMb: number
    airQualityIndex: number | null
  }
  forecast: ForecastDayItem[]
  advisory: {
    category: "FAVORABLE" | "RAIN_ALERT" | "WIND_ALERT" | "HEAT_ALERT" | "SPRAY_SAFE"
    titleEn: string
    titleKn: string
    bodyEn: string
    bodyKn: string
    sprayRecommended: boolean
  }
  source: string
}

// Translation dictionary for common WeatherAPI condition strings
const CONDITION_KN: Record<string, string> = {
  sunny: "ಬಿಸಿಲು",
  clear: "ಸ್ವಚ್ಛ ಆಕಾಶ",
  "partly cloudy": "ಭಾಗಶಃ ಮೋಡ",
  cloudy: "ಮೋಡ ಕವಿದ ವಾತಾವರಣ",
  overcast: "ದಟ್ಟ ಮೋಡ",
  mist: "ಮಂಜು",
  "patchy rain nearby": "ಹತ್ತಿರದಲ್ಲಿ ಸಾಧಾರಣ ಮಳೆ ಸಾಧ್ಯತೆ",
  "patchy light rain": "ಹಗುರ ಮಳೆ",
  "light rain": "ಸಾಧಾರಣ ಮಳೆ",
  "moderate rain": "ಮಧ್ಯಮ ಮಳೆ",
  "heavy rain": "ಭಾರೀ ಮಳೆ",
  "thundery outbreaks nearby": "ಗುಡುಗು ಸಹಿತ ಮಳೆ ಸಾಧ್ಯತೆ",
  "smoky haze": "ಹೊಗೆಯುಕ್ತ ಮಂಜು",
  fog: "ದಟ್ಟ ಮಂಜು",
}

function translateCondition(conditionText: string): string {
  const clean = conditionText.toLowerCase().trim()
  for (const [key, kn] of Object.entries(CONDITION_KN)) {
    if (clean.includes(key)) return kn
  }
  return conditionText
}

const DAYS_KN: Record<number, string> = {
  0: "ಭಾನುವಾರ",
  1: "ಸೋಮವಾರ",
  2: "ಮಂಗಳವಾರ",
  3: "ಬುಧವಾರ",
  4: "ಗುರುವಾರ",
  5: "ಶುಕ್ರವಾರ",
  6: "ಶನಿವಾರ",
}

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * Generates actionable agronomical farming recommendations based on weather forecast.
 */
function generateFarmingAdvisory(current: any, day1: any): LiveWeatherData["advisory"] {
  const chanceOfRain = day1?.day?.daily_chance_of_rain || current?.chance_of_rain || 0
  const precipMm = day1?.day?.totalprecip_mm || current?.precip_mm || 0
  const windKph = current?.wind_kph || 0
  const tempC = current?.temp_c || 28

  if (chanceOfRain >= 60 || precipMm >= 5) {
    return {
      category: "RAIN_ALERT",
      titleEn: "Rain Alert — Postpone Foliar Spraying",
      titleKn: "ಮಳೆ ಮುನ್ಸೂಚನೆ — ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ",
      bodyEn: `High probability of rainfall (${chanceOfRain}%). Avoid pesticide spraying and nitrogen top-dressing to prevent wash-off. Ensure field drainage channels are clear.`,
      bodyKn: `ಹೆಚ್ಚಿನ ಮಳೆ ಸಾಧ್ಯತೆ (${chanceOfRain}%). ರಸಗೊಬ್ಬರ ಮತ್ತು ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ, ಮಳೆಗೆ ಕೊಚ್ಚಿಹೋಗುವ ಸಂಭವವಿದೆ. ಜಮೀನಿನಲ್ಲಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿದುಹೋಗುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.`,
      sprayRecommended: false,
    }
  }

  if (windKph >= 20) {
    return {
      category: "WIND_ALERT",
      titleEn: "High Wind Alert — Avoid Pesticide Spraying",
      titleKn: "ವೇಗದ ಗಾಳಿ — ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ",
      bodyEn: `Wind speed is high (${windKph} km/h). Foliar pesticide or herbicide spraying is not recommended due to chemical drift risk.`,
      bodyKn: `ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಾಗಿದೆ (${windKph} ಕಿ.ಮೀ/ಗಂ). ಸಿಂಪಡಿಸಿದ ಔಷಧ ಗಾಳಿಗೆ ಪಕ್ಕದ ಜಮೀನಿಗೆ ಹರಡುವ ಅಪಾಯವಿರುವುದರಿಂದ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ.`,
      sprayRecommended: false,
    }
  }

  if (tempC >= 34) {
    return {
      category: "HEAT_ALERT",
      titleEn: "High Temperature — Early Irrigation Recommended",
      titleKn: "ಹೆಚ್ಚಿನ ತಾಪಮಾನ — ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ",
      bodyEn: `Temperature is high (${tempC}°C). Schedule crop irrigation during early morning (6–9 AM) or late evening to minimize evaporation losses.`,
      bodyKn: `ತಾಪಮಾನ ಹೆಚ್ಚಾಗಿದೆ (${tempC}°C). ಆವಿಯಾಗುವಿಕೆಯನ್ನು ತಡೆಗಟ್ಟಲು ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ಮಾತ್ರ ಬೆಳೆಗೆ ನೀರು ಹಾಯಿಸಿ.`,
      sprayRecommended: true,
    }
  }

  return {
    category: "FAVORABLE",
    titleEn: "Favorable Weather for Field Operations",
    titleKn: "ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಉತ್ತಮ ವಾತಾವರಣ",
    bodyEn: `Clear skies, moderate winds (${windKph} km/h), and no heavy rain expected. Ideal time for weeding, fertilization, and foliar spray operations.`,
    bodyKn: `ಸ್ವಚ್ಛ ಆಕಾಶ, ಸಾಧಾರಣ ಗಾಳಿ (${windKph} ಕಿ.ಮೀ/ಗಂ) ಹಾಗೂ ಮಳೆಯ ಸಂಭವವಿಲ್ಲ. ಕಳೆ ಕೀಳಲು, ರಸಗೊಬ್ಬರ ಹಾಕಲು ಹಾಗೂ ಔಷಧ ಸಿಂಪಡಣೆಗೆ ಸಕಾಲ.`,
    sprayRecommended: true,
  }
}

/**
 * Retrieves real-time weather and 3-day agricultural forecast for given GPS coordinates.
 */
export async function getLiveWeatherForecast(
  lat: number,
  lng: number,
  days = 3
): Promise<LiveWeatherData> {
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLng = Math.round(lng * 100) / 100
  const cacheKey = `${roundedLat},${roundedLng}_${days}`

  const cached = weatherCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`⚡ [Weather Cache] Cache hit for: ${cacheKey}`)
    return cached.data
  }

  const url = new URL("https://api.weatherapi.com/v1/forecast.json")
  url.searchParams.set("key", WEATHER_API_KEY)
  url.searchParams.set("q", `${lat},${lng}`)
  url.searchParams.set("days", String(days))
  url.searchParams.set("aqi", "yes")

  console.log(`🌦️ [Weather API] Fetching live forecast for (${lat}, ${lng})...`)

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`WeatherAPI returned HTTP ${response.status}: ${response.statusText}`)
  }

  const data = (await response.json()) as any

  const current = data.current || {}
  const location = data.location || {}
  const forecastDays = data.forecast?.forecastday || []

  const formattedForecast: ForecastDayItem[] = forecastDays.map((fd: any, idx: number) => {
    const d = new Date(fd.date)
    const dayOfWeek = d.getDay()
    const dayNameEn = idx === 0 ? "Today" : DAYS_EN[dayOfWeek]
    const dayNameKn = idx === 0 ? "ಇಂದು" : DAYS_KN[dayOfWeek]
    const condText = fd.day?.condition?.text || "Clear"

    return {
      date: fd.date,
      dayNameEn,
      dayNameKn,
      maxTempC: Math.round(fd.day?.maxtemp_c || 0),
      minTempC: Math.round(fd.day?.mintemp_c || 0),
      avgTempC: Math.round(fd.day?.avgtemp_c || 0),
      conditionTextEn: condText,
      conditionTextKn: translateCondition(condText),
      iconUrl: fd.day?.condition?.icon?.startsWith("//")
        ? `https:${fd.day.condition.icon}`
        : fd.day?.condition?.icon || "",
      chanceOfRain: fd.day?.daily_chance_of_rain || 0,
      totalPrecipMm: fd.day?.totalprecip_mm || 0,
      maxWindKph: Math.round(fd.day?.maxwind_kph || 0),
      humidity: fd.day?.avghumidity || 0,
      uv: fd.day?.uv || 0,
    }
  })

  const advisory = generateFarmingAdvisory(current, forecastDays[0])
  const condText = current.condition?.text || "Clear"

  const result: LiveWeatherData = {
    location: {
      name: location.name || "Karnataka",
      region: location.region || "Karnataka",
      country: location.country || "India",
      latitude: location.lat || lat,
      longitude: location.lon || lng,
      localtime: location.localtime || new Date().toISOString(),
    },
    current: {
      tempC: Math.round(current.temp_c || 0),
      tempF: Math.round(current.temp_f || 0),
      feelsLikeC: Math.round(current.feelslike_c || current.temp_c || 0),
      conditionTextEn: condText,
      conditionTextKn: translateCondition(condText),
      iconUrl: current.condition?.icon?.startsWith("//")
        ? `https:${current.condition.icon}`
        : current.condition?.icon || "",
      humidity: current.humidity || 0,
      windKph: Math.round(current.wind_kph || 0),
      windDir: current.wind_dir || "N",
      precipMm: current.precip_mm || 0,
      chanceOfRain: forecastDays[0]?.day?.daily_chance_of_rain || 0,
      uv: current.uv || 0,
      pressureMb: current.pressure_mb || 1013,
      airQualityIndex: current.air_quality?.["us-epa-index"] || null,
    },
    forecast: formattedForecast,
    advisory,
    source: "WeatherAPI.com (Real-Time GPS Location)",
  }

  // Cache response
  weatherCache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return result
}

