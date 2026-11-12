import { Platform } from "react-native"
import * as Location from "expo-location"

export type LocationResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; reason: "denied" | "timeout" | "unavailable"; message?: string }

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), ms)
    promise.then(
      (val) => {
        clearTimeout(timer)
        resolve(val)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

/**
 * Cross-platform GPS lookup using expo-location on iOS/Android
 * and navigator.geolocation on Web.
 */
export async function getCurrentLocation(timeoutMs: number = 9000): Promise<LocationResult> {
  if (Platform.OS === "web") {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return { ok: false, reason: "unavailable" }
    }
    return new Promise<LocationResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            ok: true,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (err) => {
          resolve({
            ok: false,
            reason: err.code === 1 ? "denied" : "timeout",
            message: err.message,
          })
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60000 }
      )
    })
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      return { ok: false, reason: "denied", message: "Location permission denied" }
    }

    // Try fast last known position first (<= 2 minutes old) to avoid indoor GPS hangs
    const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 120000 }).catch(() => null)
    if (lastKnown?.coords) {
      return {
        ok: true,
        lat: lastKnown.coords.latitude,
        lng: lastKnown.coords.longitude,
      }
    }

    const current = await withTimeout(
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      timeoutMs
    )
    return {
      ok: true,
      lat: current.coords.latitude,
      lng: current.coords.longitude,
    }
  } catch (err: any) {
    const msg = err?.message || ""
    return {
      ok: false,
      reason: msg === "LOCATION_TIMEOUT" ? "timeout" : "unavailable",
      message: msg,
    }
  }
}

