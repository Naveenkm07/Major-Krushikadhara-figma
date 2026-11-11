import { Platform } from "react-native"

/**
 * Returns the base API URL for KrushikaDhara core services.
 * Respects EXPO_PUBLIC_API_URL if set, otherwise chooses the appropriate host
 * (10.0.2.2 for Android emulator, localhost for iOS / Web).
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "")
  }
  
  if (Platform.OS === "android") {
    // 10.0.2.2 routes to the host development machine from Android emulator
    return "http://10.0.2.2:5000/api"
  }
  
  return "http://localhost:5000/api"
}

export const API_BASE = getApiBaseUrl()

