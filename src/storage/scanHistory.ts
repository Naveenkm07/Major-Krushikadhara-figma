// src/storage/scanHistory.ts
// In-memory + storage manager for crop pest scan history

import { type PestDetectionResult } from "../api/scan"

export interface ScanHistoryItem {
  id: string
  crop: string
  pest: string
  date: string
  status: "healthy" | "pest"
  confidence: number
  imageUrl: string
  diagnosis: PestDetectionResult
}

let scanHistoryStore: ScanHistoryItem[] = []
const listeners: Array<(items: ScanHistoryItem[]) => void> = []

export function getScanHistory(): ScanHistoryItem[] {
  return [...scanHistoryStore]
}

export function addScanToHistory(diagnosis: PestDetectionResult, imageUri: string, cropName: string = "Crop Leaf"): ScanHistoryItem {
  const isHealthy = diagnosis.healthy || !diagnosis.pest_name
  const pestTitle = isHealthy ? "Healthy Crop" : (diagnosis.pest_name || "Unknown Pest")

  const now = new Date()
  const dateFormatted = now.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  }) + ` · ` + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })

  const newItem: ScanHistoryItem = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    crop: cropName,
    pest: pestTitle,
    date: dateFormatted,
    status: isHealthy ? "healthy" : "pest",
    confidence: diagnosis.confidence || (isHealthy ? 96 : 90),
    imageUrl: diagnosis.imageUrl || imageUri,
    diagnosis,
  }

  // Prepend to list
  scanHistoryStore = [newItem, ...scanHistoryStore.slice(0, 19)]
  listeners.forEach((l) => l([...scanHistoryStore]))
  return newItem
}

export function subscribeScanHistory(cb: (items: ScanHistoryItem[]) => void) {
  listeners.push(cb)
  return () => {
    const idx = listeners.indexOf(cb)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}

