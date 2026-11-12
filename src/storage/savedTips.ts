import { useEffect, useState } from "react"
import type { PestDetectionResult } from "../api/scan"

export interface SavedTipItem {
  id: string
  categoryEn: string
  categoryKn: string
  titleEn: string
  titleKn: string
  bodyEn: string
  bodyKn: string
  isUserSaved?: boolean
}

const DEFAULT_TIPS: SavedTipItem[] = [
  {
    id: "tip_pest_early_blight",
    categoryEn: "Disease",
    categoryKn: "ರೋಗ",
    titleEn: "Early Blight in Tomato",
    titleKn: "ಟೊಮೆಟೊದಲ್ಲಿ ಆರಂಭಿಕ ಅಂಗಮಾರಿ",
    bodyEn:
      "Remove lower infected leaves immediately and spray Mancozeb 75% WP @ 2 g/L at 10-day intervals.",
    bodyKn:
      "ಸೋಂಕಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ ಮತ್ತು ಪ್ರತಿ 10 ದಿನಕ್ಕೊಮ್ಮೆ ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP (2 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.",
  },
  {
    id: "tip_pest_neem",
    categoryEn: "Pest Control",
    categoryKn: "ಕೀಟ ನಿಯಂತ್ರಣ",
    titleEn: "Organic Neem Oil Spray",
    titleKn: "ಸಾವಯವ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ",
    bodyEn:
      "Mix 5 ml cold-pressed Neem oil (1500 ppm) + 1 ml mild liquid soap per liter. Spray early morning or evening.",
    bodyKn:
      "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಮತ್ತು 1 ಮಿ.ಲೀ ದ್ರವ ಸಾಬೂನು ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಿಸಿ.",
  },
  {
    id: "tip_irrigation_rice",
    categoryEn: "Irrigation",
    categoryKn: "ನೀರಾವರಿ",
    titleEn: "Alternate Wetting & Drying (AWD)",
    titleKn: "ಪರ್ಯಾಯ ನೀರಾವರಿ ಪದ್ಧತಿ (AWD)",
    bodyEn:
      "Maintain 2-3 cm shallow standing water during tillering in Paddy. Saves up to 20% irrigation water without yield loss.",
    bodyKn:
      "ಭತ್ತದ ಕವಲೊಡೆಯುವ ಹಂತದಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ತೆಳು ನೀರು ನಿಲ್ಲಿಸಿ. ಇದರಿಂದ ಇಳುವರಿ ಕಡಿಮೆಯಾಗದೆ 20% ನೀರು ಉಳಿಯುತ್ತದೆ.",
  },
  {
    id: "tip_soil_zinc",
    categoryEn: "Nutrition",
    categoryKn: "ಪೋಷಕಾಂಶ",
    titleEn: "Correcting Zinc Deficiency",
    titleKn: "ಸತು (Zinc) ಕೊರತೆ ನಿವಾರಣೆ",
    bodyEn:
      "For rusty-brown spots in paddy leaves, apply Zinc Sulphate @ 10 kg/acre or foliar spray 5 g/L.",
    bodyKn:
      "ಭತ್ತದ ಎಲೆಗಳಲ್ಲಿ ತುಕ್ಕು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಂಡರೆ ಪ್ರತಿ ಎಕರೆಗೆ 10 ಕೆ.ಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಹಾಕಿ ಅಥವಾ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
  },
]

let savedTipsStore: SavedTipItem[] = [...DEFAULT_TIPS]
const listeners = new Set<(items: SavedTipItem[]) => void>()

function emit() {
  const snapshot = [...savedTipsStore]
  listeners.forEach((cb) => cb(snapshot))
}

export function isScanBookmarked(pestOrCropKey: string): boolean {
  const id = `scan_tip_${pestOrCropKey.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`
  return savedTipsStore.some((item) => item.id === id)
}

export function toggleBookmarkScanResult(
  diagnosis: PestDetectionResult,
  cropName: string
): boolean {
  const label = diagnosis.healthy
    ? `${cropName} Healthy Check`
    : diagnosis.pest_name || `${cropName} Diagnosis`
  const id = `scan_tip_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`

  const exists = savedTipsStore.some((item) => item.id === id)
  if (exists) {
    savedTipsStore = savedTipsStore.filter((item) => item.id !== id)
    emit()
    return false
  }

  const remedySummaryEn = [
    diagnosis.organic?.[0],
    diagnosis.chemical?.[0],
    diagnosis.prevention?.[0],
  ]
    .filter(Boolean)
    .join(" · ")

  const remedySummaryKn = [
    diagnosis.organic_kn?.[0] || diagnosis.organic?.[0],
    diagnosis.chemical_kn?.[0] || diagnosis.chemical?.[0],
    diagnosis.prevention_kn?.[0] || diagnosis.prevention?.[0],
  ]
    .filter(Boolean)
    .join(" · ")

  const titleKnName = diagnosis.healthy
    ? `${cropName} ಆರೋಗ್ಯ ತಪಾಸಣೆ`
    : diagnosis.pest_name_kn || label

  const newTip: SavedTipItem = {
    id,
    categoryEn: diagnosis.healthy ? "Healthy Scan" : "Saved Diagnosis",
    categoryKn: diagnosis.healthy ? "ಆರೋಗ್ಯ ತಪಾಸಣೆ" : "ಉಳಿಸಿದ ರೋಗನಿರ್ಣಯ",
    titleEn: `${label} (${cropName})`,
    titleKn: `${titleKnName} (${cropName})`,
    bodyEn: remedySummaryEn || diagnosis.about || "Saved from Crop Scan diagnosis report.",
    bodyKn:
      remedySummaryKn ||
      diagnosis.about_kn ||
      diagnosis.message_kn ||
      diagnosis.about ||
      "ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ವರದಿಯಿಂದ ಉಳಿಸಲಾಗಿದೆ.",
    isUserSaved: true,
  }

  savedTipsStore = [newTip, ...savedTipsStore]
  emit()
  return true
}

export function removeSavedTip(id: string) {
  savedTipsStore = savedTipsStore.filter((item) => item.id !== id)
  emit()
}

export function useSavedTips() {
  const [tips, setTips] = useState<SavedTipItem[]>(() => [...savedTipsStore])

  useEffect(() => {
    const listener = (next: SavedTipItem[]) => setTips(next)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    tips,
    removeTip: removeSavedTip,
    toggleBookmarkScanResult,
    isScanBookmarked,
  }
}

