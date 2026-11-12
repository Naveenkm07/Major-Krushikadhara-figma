// src/api/scan.ts
// Frontend client for crop pest & leaf disease detection endpoints

import { Platform } from "react-native"
import { API_BASE } from "./config"
import { postMultipartFormData } from "./multipart"

export type ScanMode = "pest" | "crop" | "leaf"

export interface PestDetectionItem {
  class_id: number
  class_name: string
  confidence: number
  bbox?: number[]
  source?: "yolo11s" | "gemini_vision"
}

export interface PestDetectionResult {
  success: boolean
  scan_id?: string
  mode?: ScanMode
  is_plant?: boolean
  low_confidence?: boolean
  image_quality_issue?: "blurry" | "dark" | "too_far" | null
  detected_crop?: string
  scientific_name?: string
  issue_type?: "pest" | "fungal" | "bacterial" | "viral" | "nutrient" | "healthy" | "non_crop"
  pest_name: string | null
  pest_name_kn?: string | null
  confidence: number
  total_pests_found: number
  severity: string
  affected_area_pct?: number
  spread_risk?: string
  healthy: boolean
  message?: string
  message_kn?: string
  imageUrl?: string
  about: string
  about_kn?: string
  symptoms: string[]
  symptoms_kn?: string[]
  chemical: string[]
  chemical_kn?: string[]
  organic: string[]
  organic_kn?: string[]
  prevention: string[]
  prevention_kn?: string[]
  gemini_used: boolean
  yolo_used?: boolean
  all_detections: PestDetectionItem[]
  error?: string
}

/**
 * Upload a crop image for hybrid YOLO11s + Gemini Vision diagnosis.
 * Handles both React Native (Android/iOS via XHR) and Web FormData compatibility.
 */
export async function diagnoseCropImage(
  imageUri: string,
  options?: { mobile?: string; cropName?: string; mode?: ScanMode; language?: "en" | "kn" }
): Promise<PestDetectionResult> {
  const formData = new FormData()

  const rawName = imageUri.split("?")[0].split("/").pop() || `scan_${Date.now()}.jpg`
  const hasValidExt = /\.(jpe?g|png|webp|heic|heif)$/i.test(rawName)
  const filename = hasValidExt ? rawName : `scan_${Date.now()}.jpg`
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg"
  const mimeType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : ext === "heic" || ext === "heif"
      ? "image/heic"
      : "image/jpeg"

  if (Platform.OS === "web") {
    const response = await fetch(imageUri)
    const blob = await response.blob()
    formData.append("image", blob, filename)
  } else {
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any)
  }

  if (options?.mobile) formData.append("mobile", options.mobile)
  if (options?.cropName) formData.append("cropName", options.cropName)
  if (options?.mode) formData.append("mode", options.mode)
  if (options?.language) formData.append("language", options.language)

  return postMultipartFormData<PestDetectionResult>(
    `${API_BASE}/scan/diagnose`,
    formData,
    60000
  )
}

/**
 * Check scan service health.
 */
export async function checkScanHealth(): Promise<{
  model_loaded: boolean
  model_size?: string
  status: string
  classes: number
}> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(`${API_BASE}/scan/health`, { signal: controller.signal })
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export interface BackendCropScanRecord {
  id: string
  cropName: string
  diseaseName: string
  confidence: number
  severity: string
  imageUrl: string
  remediesJson?: {
    mode?: ScanMode
    scientificName?: string
    issueType?: PestDetectionResult["issue_type"]
    pestNameKn?: string
    detectedCrop?: string
    affectedAreaPct?: number
    spreadRisk?: string
    lowConfidence?: boolean
    message?: string
    messageKn?: string
    about?: string
    aboutKn?: string
    symptoms?: string[]
    symptomsKn?: string[]
    chemical?: string[]
    chemicalKn?: string[]
    organic?: string[]
    organicKn?: string[]
    prevention?: string[]
    preventionKn?: string[]
    allDetections?: PestDetectionItem[]
  } | null
  createdAt: string
}

/**
 * Fetch persisted crop scan history for a farmer from Neon PostgreSQL.
 */
export async function fetchScanHistoryFromBackend(mobile: string): Promise<BackendCropScanRecord[]> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/scan/history?mobile=${encodeURIComponent(mobile)}`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return []
    const json = await res.json()
    return json?.success && Array.isArray(json.scans) ? json.scans : []
  } catch {
    return []
  }
}

/**
 * Delete a persisted crop scan record from Neon PostgreSQL.
 */
export async function deleteScanHistoryFromBackend(
  scanId: string,
  mobile?: string
): Promise<boolean> {
  try {
    const qs = mobile ? `?mobile=${encodeURIComponent(mobile)}` : ""
    const res = await fetch(`${API_BASE}/scan/history/${encodeURIComponent(scanId)}${qs}`, {
      method: "DELETE",
    })
    const json = await res.json().catch(() => ({}))
    return Boolean(res.ok && json?.success)
  } catch {
    return false
  }
}

/**
 * Submit farmer helpfulness feedback on a diagnosis report.
 */
export async function submitScanFeedback(
  scanId: string,
  helpful: boolean
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/scan/${encodeURIComponent(scanId)}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpful }),
    })
    return res.ok
  } catch {
    return false
  }
}
