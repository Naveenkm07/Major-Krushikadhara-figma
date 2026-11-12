import { Platform } from "react-native"
import Constants from "expo-constants"

/**
 * Returns the base API URL for KrushikaDhara core services.
 * Priority:
 * 1. EXPO_PUBLIC_API_URL from .env
 * 2. Expo Go Metro host IP (auto-detected via expo-constants) on native
 * 3. Platform defaults (10.0.2.2 Android emulator / localhost iOS & Web)
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "")
  }

  if (Platform.OS !== "web") {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).expoGoConfig?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
      ""
    const hostIp = hostUri.split(":")[0]?.trim()
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:5000/api`
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api"
  }

  return "http://localhost:5000/api"
}

export const API_BASE = getApiBaseUrl()
