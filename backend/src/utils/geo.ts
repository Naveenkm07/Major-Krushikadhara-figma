// ==============================================================================
// Geographical Distance Utility (Haversine Formula)
// Calculates straight-line distance in kilometers between two coordinates.
// ==============================================================================

const EARTH_RADIUS_KM = 6371

/**
 * Validates if coordinates are legally valid GPS values.
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Calculates straight-line distance in kilometers between two coordinates
 * using the standard Haversine formula.
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10
}

/**
 * Returns a bounding box [minLat, maxLat, minLng, maxLng] for a given radius in km.
 * Used for fast indexed database pre-filtering before exact Haversine calculation.
 */
export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.0
  const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180))

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}

