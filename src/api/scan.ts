// src/api/scan.ts
// Frontend client for crop pest detection endpoint

import { Platform } from "react-native"
import { API_BASE } from "./config"

export interface PestDetectionResult {
  success: boolean
  pest_name: string | null
  confidence: number
  total_pests_found: number
  severity: string
  healthy: boolean
  message?: string
  message_kn?: string
  imageUrl?: string
  about: string
  symptoms: string[]
  chemical: string[]
  organic: string[]
  prevention: string[]
  gemini_used: boolean
  all_detections: Array<{
    class_id: number
    class_name: string
    confidence: number
  }>
  error?: string
}

/**
 * Upload a crop image for pest detection.
 * Handles both React Native (Android/iOS) and Web FormData compatibility.
 */
export async function diagnoseCropImage(imageUri: string): Promise<PestDetectionResult> {
  const formData = new FormData()

  const filename = imageUri.split("/").pop() || `scan_${Date.now()}.jpg`
  const match = /\.(\w+)$/.exec(filename)
  const ext = match ? match[1].toLowerCase() : "jpg"
  const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"

  if (Platform.OS === "web") {
    // On Web (browser / Expo web), fetch the blob and append it as a true File/Blob
    const response = await fetch(imageUri)
    const blob = await response.blob()
    formData.append("image", blob, filename)
  } else {
    // On React Native (Android / iOS), append the file descriptor object expected by react-native's polyfilled FormData
    const cleanUri = Platform.OS === "android" ? imageUri : imageUri.replace("file://", "")
    formData.append("image", {
      uri: cleanUri,
      name: filename,
      type: mimeType,
    } as any)
  }

  const res = await fetch(`${API_BASE}/scan/diagnose`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Scan failed with status ${res.status}`)
  }

  return res.json()
}

/**
 * Check scan service health.
 */
export async function checkScanHealth(): Promise<{
  model_loaded: boolean
  status: string
  classes: number
}> {
  const res = await fetch(`${API_BASE}/scan/health`)
  return res.json()
}
