import { Platform } from "react-native"
import Constants from "expo-constants"

export const PRODUCTION_API_URL = "https://krushikadhara-api.onrender.com/api"

/**
 * Returns the base API URL for KrushikaDhara core services.
 * Priority:
 * 1. EXPO_PUBLIC_API_URL from .env (if valid remote or active LAN)
 * 2. Expo Go Metro host IP (auto-detected via expo-constants) on native development
 * 3. Default production URL: https://krushikadhara-api.onrender.com/api
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (
    envUrl &&
    envUrl.trim().startsWith("http") &&
    !envUrl.includes("10.168.198.75") &&
    !envUrl.includes("10.0.2.2")
  ) {
    return envUrl.trim().replace(/\/+$/, "")
  }

  // Always use the 24/7 Render cloud API in production builds
  return PRODUCTION_API_URL
}

export const API_BASE = getApiBaseUrl()
