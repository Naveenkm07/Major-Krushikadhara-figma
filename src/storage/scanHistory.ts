// src/storage/scanHistory.ts
// In-memory + Neon PostgreSQL synced storage manager for crop scan history

import {
  deleteScanHistoryFromBackend,
  fetchScanHistoryFromBackend,
  type PestDetectionResult,
} from "../api/scan"

export interface ScanHistoryItem {
  id: string
  crop: string
  pest: string
  pestKn?: string
  date: string
  day: string
  month: string
  status: "healthy" | "pest"
  confidence: number
  imageUrl: string
  diagnosis: PestDetectionResult
}

let scanHistoryStore: ScanHistoryItem[] = []
const listeners: Array<(items: ScanHistoryItem[]) => void> = []

function notifyListeners() {
  const snapshot = [...scanHistoryStore]
  listeners.forEach((l) => l(snapshot))
}

function formatDateParts(dateObj: Date) {
  const day = String(dateObj.getDate())
  const month = dateObj.toLocaleDateString("en-IN", { month: "short" })
  const formatted =
    dateObj.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }) +
    " · " +
    dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  return { day, month, formatted }
}

export function getScanHistory(): ScanHistoryItem[] {
  return [...scanHistoryStore]
}

export function addScanToHistory(
  diagnosis: PestDetectionResult,
  imageUri: string,
  cropName: string = "Crop Leaf"
): ScanHistoryItem {
  const isHealthy = diagnosis.healthy || !diagnosis.pest_name
  const pestTitle = isHealthy ? "Healthy Crop" : diagnosis.pest_name || "Unknown Issue"
  const { day, month, formatted } = formatDateParts(new Date())
  const resolvedCrop = diagnosis.detected_crop || cropName

  const newItem: ScanHistoryItem = {
    id: diagnosis.scan_id || `scan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    crop: resolvedCrop,
    pest: pestTitle,
    pestKn: isHealthy ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ" : diagnosis.pest_name_kn || pestTitle,
    date: formatted,
    day,
    month,
    status: isHealthy ? "healthy" : "pest",
    confidence: diagnosis.confidence || (isHealthy ? 90 : 85),
    imageUrl: diagnosis.imageUrl || imageUri,
    diagnosis: { ...diagnosis, detected_crop: resolvedCrop },
  }

  scanHistoryStore = [newItem, ...scanHistoryStore.filter((s) => s.id !== newItem.id)].slice(0, 30)
  notifyListeners()
  return newItem
}

export async function removeScanFromHistory(scanId: string, mobile?: string): Promise<void> {
  scanHistoryStore = scanHistoryStore.filter((item) => item.id !== scanId)
  notifyListeners()
  if (scanId && !scanId.startsWith("scan_")) {
    await deleteScanHistoryFromBackend(scanId, mobile)
  }
}

export async function syncScanHistoryFromBackend(mobile: string): Promise<ScanHistoryItem[]> {
  if (!mobile) return getScanHistory()
  const records = await fetchScanHistoryFromBackend(mobile)
  if (!records.length) return getScanHistory()

  const mapped: ScanHistoryItem[] = records.map((rec) => {
    const isHealthy = rec.diseaseName.toLowerCase().includes("healthy") || rec.severity === "None"
    const parsedDate = new Date(rec.createdAt)
    const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
    const { day, month, formatted } = formatDateParts(safeDate)
    const remedies = rec.remediesJson || {}
    const validImage =
      rec.imageUrl && !rec.imageUrl.startsWith("local://")
        ? rec.imageUrl
        : "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=450&fit=crop&auto=format"

    const diagnosis: PestDetectionResult = {
      success: true,
      scan_id: rec.id,
      mode: remedies.mode || "pest",
      is_plant: true,
      low_confidence: Boolean(remedies.lowConfidence),
      detected_crop: remedies.detectedCrop || rec.cropName || "Crop Leaf",
      scientific_name: remedies.scientificName || "—",
      issue_type: remedies.issueType || (isHealthy ? "healthy" : "pest"),
      pest_name: isHealthy ? null : rec.diseaseName,
      pest_name_kn: isHealthy ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ" : remedies.pestNameKn || rec.diseaseName,
      confidence: rec.confidence,
      total_pests_found: isHealthy ? 0 : Math.max(1, remedies.allDetections?.length || 1),
      severity: rec.severity || (isHealthy ? "None" : "Moderate"),
      affected_area_pct: remedies.affectedAreaPct ?? (isHealthy ? 0 : 20),
      spread_risk: remedies.spreadRisk || (isHealthy ? "None" : "Moderate"),
      healthy: isHealthy,
      message: remedies.message,
      message_kn: remedies.messageKn,
      imageUrl: validImage,
      about: remedies.about || "",
      about_kn: remedies.aboutKn || remedies.about || "",
      symptoms: remedies.symptoms || [],
      symptoms_kn: remedies.symptomsKn || remedies.symptoms || [],
      chemical: remedies.chemical || [],
      chemical_kn: remedies.chemicalKn || remedies.chemical || [],
      organic: remedies.organic || [],
      organic_kn: remedies.organicKn || remedies.organic || [],
      prevention: remedies.prevention || [],
      prevention_kn: remedies.preventionKn || remedies.prevention || [],
      gemini_used: Boolean(remedies.about),
      yolo_used: true,
      all_detections: Array.isArray(remedies.allDetections) ? remedies.allDetections : [],
    }

    return {
      id: rec.id,
      crop: remedies.detectedCrop || rec.cropName || "Crop Leaf",
      pest: rec.diseaseName,
      pestKn: isHealthy ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ" : remedies.pestNameKn || rec.diseaseName,
      date: formatted,
      day,
      month,
      status: isHealthy ? "healthy" : "pest",
      confidence: rec.confidence,
      imageUrl: validImage,
      diagnosis,
    }
  })

  // Keep any very recent local-only scans not yet returned from backend
  const backendIds = new Set(mapped.map((m) => m.id))
  const backendUrls = new Set(mapped.map((m) => m.imageUrl))
  const localOnly = scanHistoryStore.filter(
    (local) => !backendIds.has(local.id) && !backendUrls.has(local.imageUrl)
  )

  scanHistoryStore = [...localOnly, ...mapped].slice(0, 30)
  notifyListeners()
  return getScanHistory()
}

export function subscribeScanHistory(cb: (items: ScanHistoryItem[]) => void) {
  listeners.push(cb)
  return () => {
    const idx = listeners.indexOf(cb)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}
