// ==============================================================================
// Weather Controller — GET /api/weather/forecast?lat=&lng=&days=
// Validates GPS coordinates and delegates to weather service.
// API key is kept server-side only — never exposed to frontend.
// ==============================================================================

import type { Request, Response } from "express"
import { getLiveWeatherForecast } from "../services/weather.service.js"
import { isValidCoordinate } from "../utils/geo.js"

export async function getWeatherForecast(req: Request, res: Response): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lng = parseFloat(req.query.lng as string)
    const parsedDays = parseInt((req.query.days as string) || "3", 10)
    const days = Math.min(Math.max(Number.isFinite(parsedDays) ? parsedDays : 3, 1), 7)

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        success: false,
        error: "Missing or invalid coordinates. Provide lat and lng as query parameters.",
      })
      return
    }

    if (!isValidCoordinate(lat, lng)) {
      res.status(400).json({
        success: false,
        error: `Coordinates out of valid range. Got lat=${lat}, lng=${lng}.`,
      })
      return
    }

    const weather = await getLiveWeatherForecast(lat, lng, days)

    res.json({
      success: true,
      data: weather,
    })
  } catch (err: any) {
    console.error("[Weather Controller] Error:", err?.message || err)
    res.status(500).json({
      success: false,
      error: "Failed to fetch weather data. Please try again.",
    })
  }
}

