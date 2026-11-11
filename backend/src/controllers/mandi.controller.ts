import type { Request, Response } from "express"
import {
  discoverNearbyMandisWithPrices,
  fetchGovtMandiPrices,
  DEFAULT_FARMER_COORDS,
} from "../services/mandi.service.js"
import { isValidCoordinate } from "../utils/geo.js"

/**
 * GET /api/mandi/nearby
 * Discovers the nearest verified agricultural mandis from PostgreSQL within the specified radius
 * and retrieves real-time official wholesale market prices for the selected crop from data.gov.in AGMARKNET.
 *
 * Query params:
 *   - lat: number (required) - farmer latitude
 *   - lng / lon: number (required) - farmer longitude
 *   - crop: string (optional, default "Tomato") - commodity/crop to query
 *   - radius / radiusKm: number (optional, default 50) - search radius in km
 *   - limit: number (optional, default 5) - number of nearest mandis
 */
export async function getNearbyMandis(req: Request, res: Response) {
  try {
    const latStr = (req.query.lat as string) || (req.query.latitude as string)
    const lngStr = (req.query.lng as string) || (req.query.lon as string) || (req.query.longitude as string)
    const cropStr = (req.query.crop as string) || (req.query.commodity as string) || "Tomato"
    const radiusStr = (req.query.radius as string) || (req.query.radiusKm as string) || "50"
    const limitStr = (req.query.limit as string) || "5"

    if (!latStr || !lngStr) {
      return res.status(400).json({
        success: false,
        message: "Missing required GPS parameters 'lat' and 'lng' (or 'lon').",
      })
    }

    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    const radiusKm = parseInt(radiusStr, 10)
    const limit = parseInt(limitStr, 10)

    if (!isValidCoordinate(lat, lng)) {
      return res.status(400).json({
        success: false,
        message: `Invalid latitude or longitude coordinates: lat=${latStr}, lng=${lngStr}. Latitude must be between -90 and 90, longitude between -180 and 180.`,
      })
    }

    const response = await discoverNearbyMandisWithPrices({
      lat,
      lng,
      crop: cropStr,
      radiusKm: isNaN(radiusKm) ? 50 : radiusKm,
      limit: isNaN(limit) ? 5 : limit,
    })

    return res.json(response)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : "Error discovering nearby mandis"
    const is429 = msg.includes("429") || msg.toLowerCase().includes("rate limit")
    console.error("❌ [Nearby Mandi Controller Error]:", error)

    return res.status(is429 ? 429 : 500).json({
      success: false,
      message: is429
        ? "Government AGMARKNET rate limit reached. Please wait a minute and try again."
        : msg,
      error: msg,
      rateLimited: is429,
    })
  }
}

/**
 * GET /api/mandi/prices
 * General live mandi price proxy (backward compatible).
 */
export async function getLiveMandiPrices(req: Request, res: Response) {
  try {
    const commodity = req.query.commodity as string | undefined
    const district = req.query.district as string | undefined
    const market = req.query.market as string | undefined
    const state = (req.query.state as string) || "Karnataka"
    const variety = req.query.variety as string | undefined
    const grade = req.query.grade as string | undefined

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0

    const userLat = req.query.lat
      ? parseFloat(req.query.lat as string)
      : DEFAULT_FARMER_COORDS.latitude
    const userLng = req.query.lng
      ? parseFloat(req.query.lng as string)
      : DEFAULT_FARMER_COORDS.longitude

    const result = await fetchGovtMandiPrices({
      state,
      district,
      market,
      commodity,
      variety,
      grade,
      limit: isNaN(limit) ? 10 : limit,
      offset: isNaN(offset) ? 0 : offset,
      userLat: isNaN(userLat) ? DEFAULT_FARMER_COORDS.latitude : userLat,
      userLng: isNaN(userLng) ? DEFAULT_FARMER_COORDS.longitude : userLng,
    })

    return res.json(result)
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : "Upstream Government API Error"
    const is429 = msg.includes("429") || msg.toLowerCase().includes("rate limit")
    console.error("❌ [Mandi Controller] Live API Error:", error)
    return res.status(is429 ? 429 : 502).json({
      success: false,
      message: is429
        ? "data.gov.in rate limit reached. Too many requests with the sample API key. Wait 1 minute and try again."
        : "Failed to fetch live prices from data.gov.in Government portal",
      error: msg,
      rateLimited: is429,
    })
  }
}
