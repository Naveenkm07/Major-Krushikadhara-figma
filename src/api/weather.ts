// src/api/weather.ts
// Frontend client for the backend weather endpoint.

import { API_BASE } from "./config"

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

/**
 * Fetch live weather data for given coordinates.
 * @param lat latitude
 * @param lng longitude
 * @param days number of forecast days (default 3)
 */
export async function fetchLiveWeather(
  lat: number,
  lng: number,
  days = 3
): Promise<LiveWeatherData> {
  const url = `${API_BASE}/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`
  const resp = await fetch(url)
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err?.error || `Failed to fetch weather (status ${resp.status})`)
  }
  const json = await resp.json()
  if (!json.success) {
    throw new Error(json.error ?? "Weather API returned unsuccessful response")
  }
  return json.data as LiveWeatherData
}
