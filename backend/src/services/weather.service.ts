// ==============================================================================
// Live Agricultural Weather Service (WeatherAPI.com)
// Provides real-time weather metrics, 3-day forecast, and agronomical advisories
// based on dynamic GPS coordinates collected from the farmer.
// ==============================================================================

import "../config/env.js"

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

export interface HourlyWeatherItem {
  time: string
  label: string
  tempC: number
  conditionTextEn: string
  conditionTextKn: string
  chanceOfRain: number
  windKph: number
  humidity: number
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
  astro?: {
    sunrise: string
    sunset: string
  }
  hourly?: HourlyWeatherItem[]
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

// Ordered specificity: match longer phrases before shorter substrings
const CONDITION_RULES_KN: Array<[string, string]> = [
  ["thundery outbreaks", "ಗುಡುಗು ಸಹಿತ ಮಳೆ ಸಾಧ್ಯತೆ"],
  ["moderate or heavy rain with thunder", "ಗುಡುಗು ಸಹಿತ ಭಾರೀ ಮಳೆ"],
  ["patchy light rain with thunder", "ಗುಡುಗು ಸಹಿತ ಹಗುರ ಮಳೆ"],
  ["thunderstorm", "ಗುಡುಗು ಸಹಿತ ಮಳೆ"],
  ["moderate or heavy rain shower", "ಮಧ್ಯಮ ಅಥವಾ ಭಾರೀ ಮಳೆ ಸಿಂಚನ"],
  ["light rain shower", "ಹಗುರ ಮಳೆ ಸಿಂಚನ"],
  ["torrential rain shower", "ಧಾರಾಕಾರ ಮಳೆ"],
  ["patchy rain nearby", "ಹತ್ತಿರದಲ್ಲಿ ಸಾಧಾರಣ ಮಳೆ ಸಾಧ್ಯತೆ"],
  ["patchy light rain", "ಹಗುರ ಮಳೆ"],
  ["patchy light drizzle", "ಹಗುರ ತುಂತುರು ಮಳೆ"],
  ["light drizzle", "ಹಗುರ ತುಂತುರು ಮಳೆ"],
  ["heavy rain", "ಭಾರೀ ಮಳೆ"],
  ["moderate rain", "ಮಧ್ಯಮ ಮಳೆ"],
  ["light rain", "ಸಾಧಾರಣ ಮಳೆ"],
  ["rain shower", "ಮಳೆ ಸಿಂಚನ"],
  ["drizzle", "ತುಂತುರು ಮಳೆ"],
  ["partly cloudy", "ಭಾಗಶಃ ಮೋಡ"],
  ["overcast", "ದಟ್ಟ ಮೋಡ"],
  ["cloudy", "ಮೋಡ ಕವಿದ ವಾತಾವರಣ"],
  ["sunny", "ಬಿಸಿಲು"],
  ["clear", "ಸ್ವಚ್ಛ ಆಕಾಶ"],
  ["fog", "ದಟ್ಟ ಮಂಜು"],
  ["mist", "ಮಂಜು"],
  ["haze", "ಮಸುಕಾದ ವಾತಾವರಣ"],
  ["rain", "ಮಳೆ"],
]

function translateCondition(conditionText: string): string {
  const clean = conditionText.toLowerCase().trim()
  for (const [key, kn] of CONDITION_RULES_KN) {
    if (clean.includes(key)) return kn
  }
  return conditionText
}

function degreesToCompass(deg: unknown): string {
  const n = Number(deg)
  if (!Number.isFinite(n)) return "E"
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const idx = Math.round((((n % 360) + 360) % 360) / 22.5) % 16
  return dirs[idx]
}

function getSafeDayOfWeek(dateStr: string): number {
  const parsed = new Date(`${dateStr.slice(0, 10)}T12:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? new Date().getDay() : parsed.getUTCDay()
}

function formatHourLabel(isoOrLocalTime: string): string {
  const m = /(\d{2}):(\d{2})/.exec(isoOrLocalTime)
  if (!m) return isoOrLocalTime
  const hour24 = parseInt(m[1], 10)
  const suffix = hour24 >= 12 ? "PM" : "AM"
  const h12 = hour24 % 12 || 12
  return `${h12} ${suffix}`
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
  const chanceOfRain = Math.round(day1?.day?.daily_chance_of_rain ?? current?.chance_of_rain ?? 0)
  const precipMm = Math.round((Number(day1?.day?.totalprecip_mm ?? current?.precip_mm ?? 0)) * 10) / 10
  const windKph = Math.round(Number(current?.wind_kph ?? 0))
  const tempC = Math.round(Number(current?.temp_c ?? 28))
  const humidity = Math.round(Number(current?.humidity ?? 60))

  if (chanceOfRain >= 60 || precipMm >= 5) {
    return {
      category: "RAIN_ALERT",
      titleEn: "Rain Alert — Postpone Foliar Spraying",
      titleKn: "ಮಳೆ ಮುನ್ಸೂಚನೆ — ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ",
      bodyEn: `High rainfall risk (${chanceOfRain}%, ~${precipMm} mm). Avoid pesticide spraying and nitrogen top-dressing to prevent wash-off. Keep field drainage channels clear.`,
      bodyKn: `ಹೆಚ್ಚಿನ ಮಳೆ ಸಾಧ್ಯತೆ (${chanceOfRain}%, ~${precipMm} ಮಿ.ಮೀ). ರಸಗೊಬ್ಬರ ಮತ್ತು ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ, ಮಳೆಗೆ ಕೊಚ್ಚಿಹೋಗುವ ಸಂಭವವಿದೆ. ಜಮೀನಿನಲ್ಲಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿದುಹೋಗುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.`,
      sprayRecommended: false,
    }
  }

  if (windKph >= 20) {
    return {
      category: "WIND_ALERT",
      titleEn: "High Wind Alert — Avoid Pesticide Spraying",
      titleKn: "ವೇಗದ ಗಾಳಿ — ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ",
      bodyEn: `Wind speed is high (${windKph} km/h). Foliar pesticide or herbicide spraying is not recommended due to spray drift risk.`,
      bodyKn: `ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಾಗಿದೆ (${windKph} ಕಿ.ಮೀ/ಗಂ). ಸಿಂಪಡಿಸಿದ ಔಷಧ ಗಾಳಿಗೆ ಪಕ್ಕದ ಜಮೀನಿಗೆ ಹರಡುವ ಅಪಾಯವಿರುವುದರಿಂದ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ.`,
      sprayRecommended: false,
    }
  }

  if (tempC >= 34) {
    return {
      category: "HEAT_ALERT",
      titleEn: "High Temperature — Early Irrigation Recommended",
      titleKn: "ಹೆಚ್ಚಿನ ತಾಪಮಾನ — ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ",
      bodyEn: `Temperature is high (${tempC}°C). Schedule crop irrigation and foliar sprays during early morning (6–9 AM) or evening to avoid evaporation loss and leaf scorch.`,
      bodyKn: `ತಾಪಮಾನ ಹೆಚ್ಚಾಗಿದೆ (${tempC}°C). ಆವಿಯಾಗುವಿಕೆ ಮತ್ತು ಎಲೆ ಸುಡುವಿಕೆಯನ್ನು ತಡೆಗಟ್ಟಲು ಮುಂಜಾನೆ (6–9 ಗಂಟೆ) ಅಥವಾ ಸಂಜೆ ಮಾತ್ರ ನೀರು ಹಾಯಿಸಿ/ಸಿಂಪಡಿಸಿ.`,
      sprayRecommended: true,
    }
  }

  if (humidity >= 85) {
    return {
      category: "FAVORABLE",
      titleEn: "High Humidity — Monitor Leaves for Fungal Spots",
      titleKn: "ಹೆಚ್ಚಿನ ತೇವಾಂಶ — ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಬಗ್ಗೆ ಗಮನವಿರಲಿ",
      bodyEn: `Humidity is elevated (${humidity}%) with calm winds (${windKph} km/h). Safe for morning spraying, but inspect lower leaves for early blight or blast lesions.`,
      bodyKn: `ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ (${humidity}%) ಮತ್ತು ಗಾಳಿ ಸಾಧಾರಣವಾಗಿದೆ (${windKph} ಕಿ.ಮೀ/ಗಂ). ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಣೆ ಸುರಕ್ಷಿತ, ಆದರೆ ಕೆಳಗಿನ ಎಲೆಗಳಲ್ಲಿ ಅಂಗಮಾರಿ/ಬೆಂಕಿ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ.`,
      sprayRecommended: true,
    }
  }

  return {
    category: "FAVORABLE",
    titleEn: "Favorable Weather for Field Operations",
    titleKn: "ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಉತ್ತಮ ವಾತಾವರಣ",
    bodyEn: `Calm winds (${windKph} km/h), ${humidity}% humidity, and low rain risk (${chanceOfRain}%). Suitable window for weeding, fertilization, and foliar spraying.`,
    bodyKn: `ಸಾಧಾರಣ ಗಾಳಿ (${windKph} ಕಿ.ಮೀ/ಗಂ), ${humidity}% ತೇವಾಂಶ ಮತ್ತು ಕಡಿಮೆ ಮಳೆ ಸಂಭವ (${chanceOfRain}%). ಕಳೆ ಕೀಳಲು, ಗೊಬ್ಬರ ಹಾಕಲು ಮತ್ತು ಔಷಧ ಸಿಂಪಡಣೆಗೆ ಸಕಾಲ.`,
    sprayRecommended: true,
  }
}

const WMO_CODE_MAP: Record<number, { en: string; kn: string }> = {
  0: { en: "Clear sky", kn: "ಸ್ವಚ್ಛ ಆಕಾಶ" },
  1: { en: "Mainly clear", kn: "ಮುಖ್ಯವಾಗಿ ಸ್ವಚ್ಛ" },
  2: { en: "Partly cloudy", kn: "ಭಾಗಶಃ ಮೋಡ" },
  3: { en: "Overcast", kn: "ದಟ್ಟ ಮೋಡ" },
  45: { en: "Fog", kn: "ದಟ್ಟ ಮಂಜು" },
  48: { en: "Depositing rime fog", kn: "ಮಂಜು" },
  51: { en: "Light drizzle", kn: "ಹಗುರ ತುಂತುರು ಮಳೆ" },
  53: { en: "Moderate drizzle", kn: "ಸಾಧಾರಣ ತುಂತುರು ಮಳೆ" },
  61: { en: "Light rain", kn: "ಸಾಧಾರಣ ಮಳೆ" },
  63: { en: "Moderate rain", kn: "ಮಧ್ಯಮ ಮಳೆ" },
  65: { en: "Heavy rain", kn: "ಭಾರೀ ಮಳೆ" },
  80: { en: "Rain showers", kn: "ಮಳೆ ಸಿಂಚನ" },
  95: { en: "Thunderstorm", kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ" },
}

function describeWmoCode(code: number): { en: string; kn: string } {
  if (WMO_CODE_MAP[code]) return WMO_CODE_MAP[code]
  if (code >= 51 && code <= 67) return { en: "Light rain", kn: "ಸಾಧಾರಣ ಮಳೆ" }
  if (code >= 80 && code <= 82) return { en: "Rain showers", kn: "ಮಳೆ ಸಿಂಚನ" }
  if (code >= 95) return { en: "Thunderstorm", kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ" }
  return { en: "Partly cloudy", kn: "ಭಾಗಶಃ ಮೋಡ" }
}

async function fetchOpenMeteoFallback(lat: number, lng: number, days: number): Promise<LiveWeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.searchParams.set("latitude", String(lat))
  url.searchParams.set("longitude", String(lng))
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m"
  )
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m"
  )
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset"
  )
  url.searchParams.set("timezone", "Asia/Kolkata")
  url.searchParams.set("forecast_days", String(Math.max(1, Math.min(days, 7))))

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
  if (!res.ok) {
    throw new Error(`Open-Meteo returned HTTP ${res.status}`)
  }
  const om = (await res.json()) as any
  const cur = om.current || {}
  const daily = om.daily || {}
  const hourlyObj = om.hourly || {}
  const times: string[] = Array.isArray(daily.time) ? daily.time : []
  const hTimes: string[] = Array.isArray(hourlyObj.time) ? hourlyObj.time : []

  const forecast: ForecastDayItem[] = times.map((dateStr, idx) => {
    const dayOfWeek = getSafeDayOfWeek(dateStr)
    const maxT = Math.round(daily.temperature_2m_max?.[idx] ?? cur.temperature_2m ?? 28)
    const minT = Math.round(daily.temperature_2m_min?.[idx] ?? (maxT - 6))
    const code = Number(daily.weather_code?.[idx] ?? cur.weather_code ?? 1)
    const desc = describeWmoCode(code)

    // Average hourly humidity for the given date if available
    const dayHumidityValues: number[] = []
    hTimes.forEach((ht, hIdx) => {
      if (ht.startsWith(dateStr) && Number.isFinite(Number(hourlyObj.relative_humidity_2m?.[hIdx]))) {
        dayHumidityValues.push(Number(hourlyObj.relative_humidity_2m[hIdx]))
      }
    })
    const avgHum =
      dayHumidityValues.length > 0
        ? Math.round(dayHumidityValues.reduce((a, b) => a + b, 0) / dayHumidityValues.length)
        : Math.round(cur.relative_humidity_2m ?? 65)

    return {
      date: dateStr,
      dayNameEn: idx === 0 ? "Today" : DAYS_EN[dayOfWeek],
      dayNameKn: idx === 0 ? "ಇಂದು" : DAYS_KN[dayOfWeek],
      maxTempC: maxT,
      minTempC: minT,
      avgTempC: Math.round((maxT + minT) / 2),
      conditionTextEn: desc.en,
      conditionTextKn: desc.kn,
      iconUrl: "",
      chanceOfRain: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
      totalPrecipMm: Number(daily.precipitation_sum?.[idx] ?? 0),
      maxWindKph: Math.round(daily.wind_speed_10m_max?.[idx] ?? cur.wind_speed_10m ?? 10),
      humidity: avgHum,
      uv: Math.round(daily.uv_index_max?.[idx] ?? 5),
    }
  })

  // Extract next 8 upcoming 2-hour slots from current IST time
  const nowIsoPrefix = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 13)
  let startIdx = hTimes.findIndex((ht) => ht.slice(0, 13) >= nowIsoPrefix)
  if (startIdx < 0) startIdx = 0
  const hourly: HourlyWeatherItem[] = []
  for (let i = startIdx; i < hTimes.length && hourly.length < 8; i += 2) {
    const desc = describeWmoCode(Number(hourlyObj.weather_code?.[i] ?? 1))
    hourly.push({
      time: hTimes[i],
      label: formatHourLabel(hTimes[i]),
      tempC: Math.round(hourlyObj.temperature_2m?.[i] ?? cur.temperature_2m ?? 26),
      conditionTextEn: desc.en,
      conditionTextKn: desc.kn,
      chanceOfRain: Math.round(hourlyObj.precipitation_probability?.[i] ?? 0),
      windKph: Math.round(hourlyObj.wind_speed_10m?.[i] ?? cur.wind_speed_10m ?? 8),
      humidity: Math.round(hourlyObj.relative_humidity_2m?.[i] ?? cur.relative_humidity_2m ?? 60),
    })
  }

  const formatOmSunTime = (raw: unknown): string => {
    const s = String(raw || "")
    const m = /T(\d{2}):(\d{2})/.exec(s)
    if (!m) return "06:15 AM"
    const h = parseInt(m[1], 10)
    const ampm = h >= 12 ? "PM" : "AM"
    return `${String(h % 12 || 12).padStart(2, "0")}:${m[2]} ${ampm}`
  }

  const curTempC = Math.round(cur.temperature_2m ?? 28)
  const curDesc = describeWmoCode(Number(cur.weather_code ?? 1))
  const day0Rain = forecast[0]?.chanceOfRain ?? 0
  const curHumidity = Math.round(cur.relative_humidity_2m ?? 65)
  const advisory = generateFarmingAdvisory(
    {
      chance_of_rain: day0Rain,
      precip_mm: cur.precipitation ?? 0,
      wind_kph: cur.wind_speed_10m ?? 10,
      temp_c: curTempC,
      humidity: curHumidity,
    },
    {
      day: {
        daily_chance_of_rain: day0Rain,
        totalprecip_mm: forecast[0]?.totalPrecipMm ?? 0,
      },
    }
  )

  return {
    location: {
      name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      region: "Karnataka",
      country: "India",
      latitude: om.latitude ?? lat,
      longitude: om.longitude ?? lng,
      localtime: new Date().toISOString(),
    },
    current: {
      tempC: curTempC,
      tempF: Math.round((curTempC * 9) / 5 + 32),
      feelsLikeC: Math.round(cur.apparent_temperature ?? curTempC),
      conditionTextEn: curDesc.en,
      conditionTextKn: curDesc.kn,
      iconUrl: "",
      humidity: curHumidity,
      windKph: Math.round(cur.wind_speed_10m ?? 10),
      windDir: degreesToCompass(cur.wind_direction_10m),
      precipMm: Number(cur.precipitation ?? 0),
      chanceOfRain: day0Rain,
      uv: forecast[0]?.uv ?? 5,
      pressureMb: Math.round(cur.surface_pressure ?? 1013),
      airQualityIndex: null,
    },
    astro: {
      sunrise: formatOmSunTime(daily.sunrise?.[0]),
      sunset: formatOmSunTime(daily.sunset?.[0]),
    },
    hourly,
    forecast,
    advisory,
    source: "Open-Meteo (Live GPS Weather Fallback)",
  }
}

/**
 * Retrieves real-time weather and agricultural forecast (1-7 days + hourly) for GPS coordinates.
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

  const apiKey = process.env.WEATHER_API_KEY?.trim() || ""
  if (!apiKey) {
    const omResult = await fetchOpenMeteoFallback(lat, lng, days)
    weatherCache.set(cacheKey, { data: omResult, expiresAt: Date.now() + CACHE_TTL_MS })
    return omResult
  }

  const url = new URL("https://api.weatherapi.com/v1/forecast.json")
  url.searchParams.set("key", apiKey)
  url.searchParams.set("q", `${lat},${lng}`)
  url.searchParams.set("days", String(days))
  url.searchParams.set("aqi", "yes")

  console.log(`🌦️ [Weather API] Fetching live forecast for (${lat}, ${lng})...`)

  let response: Response | null = null
  let lastErr: unknown = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch(url.toString(), {
        signal: AbortSignal.timeout(attempt === 1 ? 6500 : 8000),
      })
      if (r.ok) {
        response = r
        break
      }
      lastErr = new Error(`WeatherAPI returned HTTP ${r.status}: ${r.statusText}`)
    } catch (err) {
      lastErr = err
      console.warn(`⚠️ [Weather API] Attempt ${attempt}/2 failed:`, err instanceof Error ? err.message : err)
    }
  }

  if (!response) {
    console.warn("⚠️ [Weather API] Falling back to live Open-Meteo:", lastErr instanceof Error ? lastErr.message : lastErr)
    const omResult = await fetchOpenMeteoFallback(lat, lng, days)
    weatherCache.set(cacheKey, { data: omResult, expiresAt: Date.now() + CACHE_TTL_MS })
    return omResult
  }

  const data = (await response.json()) as any

  const current = data.current || {}
  const location = data.location || {}
  const forecastDays = data.forecast?.forecastday || []

  const formattedForecast: ForecastDayItem[] = forecastDays.map((fd: any, idx: number) => {
    const dayOfWeek = getSafeDayOfWeek(fd.date || "")
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

  // Extract upcoming 2-hour slots across today & tomorrow
  const allHours: any[] = []
  forecastDays.slice(0, 2).forEach((fd: any) => {
    if (Array.isArray(fd.hour)) allHours.push(...fd.hour)
  })
  const curEpoch = Number(location.localtime_epoch || 0)
  let hStartIdx = allHours.findIndex((h) => Number(h.time_epoch || 0) >= curEpoch - 1800)
  if (hStartIdx < 0) hStartIdx = 0
  const hourly: HourlyWeatherItem[] = []
  for (let i = hStartIdx; i < allHours.length && hourly.length < 8; i += 2) {
    const h = allHours[i]
    const hCond = h.condition?.text || "Clear"
    hourly.push({
      time: h.time || "",
      label: formatHourLabel(h.time || ""),
      tempC: Math.round(h.temp_c ?? 0),
      conditionTextEn: hCond,
      conditionTextKn: translateCondition(hCond),
      chanceOfRain: Number(h.chance_of_rain ?? 0),
      windKph: Math.round(h.wind_kph ?? 0),
      humidity: Math.round(h.humidity ?? 0),
    })
  }

  const day0Astro = forecastDays[0]?.astro || {}
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
    astro: {
      sunrise: day0Astro.sunrise || "06:15 AM",
      sunset: day0Astro.sunset || "05:55 PM",
    },
    hourly,
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

