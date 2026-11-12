import { Alert, Linking, Platform, Share } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { API_BASE } from "./config"
import {
  SCHEMES_CATALOG,
  type SchemeCatalogItem,
  type SchemeCategory,
  type SchemeLevel,
} from "../data/schemesCatalog"

export type { SchemeCatalogItem, SchemeCategory, SchemeLevel }

export type SchemeApplicationStatus =
  | "NOT_APPLIED"
  | "CHECKLIST_READY"
  | "APPLIED"
  | "APPROVED"

export interface SchemeProgress {
  bookmarked: boolean
  status: SchemeApplicationStatus
  checkedDocs: string[]
  appliedAt: string | null
  notes: string | null
  updatedAt: string | null
}

export interface SchemeEligibilityMatch {
  eligible: boolean
  matchCode: "ELIGIBLE" | "PRIORITY_KARNATAKA" | "CHECK_ACREAGE" | "OTHER_STATE"
  matchLabelEn: string
  matchLabelKn: string
}

export interface EnrichedScheme extends SchemeCatalogItem {
  eligibilityMatch: SchemeEligibilityMatch
  progress: SchemeProgress
}

export interface SchemesSummary {
  totalSchemes: number
  karnatakaCount: number
  centralCount: number
  eligibleCount: number
  bookmarkedCount: number
  appliedCount: number
}

function defaultProgress(): SchemeProgress {
  return {
    bookmarked: false,
    status: "NOT_APPLIED",
    checkedDocs: [],
    appliedAt: null,
    notes: null,
    updatedAt: null,
  }
}

export function parseFarmAcres(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
    if (match) {
      const parsed = parseFloat(match[1])
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

export function evaluateSchemeEligibilityLocal(
  scheme: SchemeCatalogItem,
  farmerState?: string | null,
  farmAcres?: number | null
): SchemeEligibilityMatch {
  const normalizedState = (farmerState || "Karnataka").trim()

  if (scheme.rules.targetStates && scheme.rules.targetStates.length > 0) {
    const matchesState = scheme.rules.targetStates.some((target) =>
      normalizedState.toLowerCase().includes(target.toLowerCase())
    )
    if (!matchesState) {
      return {
        eligible: false,
        matchCode: "OTHER_STATE",
        matchLabelEn: `${scheme.rules.targetStates.join("/")} Farmers Only`,
        matchLabelKn: `${scheme.rules.targetStates.join("/")} ರೈತರಿಗೆ ಮಾತ್ರ`,
      }
    }
    return {
      eligible: true,
      matchCode: "PRIORITY_KARNATAKA",
      matchLabelEn: "Eligible · Karnataka State Scheme",
      matchLabelKn: "ಅರ್ಹ · ಕರ್ನಾಟಕ ರಾಜ್ಯ ಯೋಜನೆ",
    }
  }

  if (typeof scheme.rules.maxLandAcres === "number" && typeof farmAcres === "number") {
    if (farmAcres > scheme.rules.maxLandAcres) {
      return {
        eligible: false,
        matchCode: "CHECK_ACREAGE",
        matchLabelEn: `For Small Farmers <= ${scheme.rules.maxLandAcres} ac`,
        matchLabelKn: `ಗರಿಷ್ಠ ${scheme.rules.maxLandAcres} ಎಕರೆ ಸಣ್ಣ ರೈತರಿಗೆ`,
      }
    }
    return {
      eligible: true,
      matchCode: "ELIGIBLE",
      matchLabelEn: `Matches Farm Size (${farmAcres} ac)`,
      matchLabelKn: `ನಿಮ್ಮ ಜಮೀನಿಗೆ ಅರ್ಹ (${farmAcres} ಎಕರೆ)`,
    }
  }

  return {
    eligible: true,
    matchCode: "ELIGIBLE",
    matchLabelEn: "Eligible for Your Profile",
    matchLabelKn: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಅರ್ಹ",
  }
}

let cachedSchemes: EnrichedScheme[] = SCHEMES_CATALOG.map((item) => ({
  ...item,
  eligibilityMatch: evaluateSchemeEligibilityLocal(item, "Karnataka", 4.2),
  progress: defaultProgress(),
}))

const listeners = new Set<(schemes: EnrichedScheme[]) => void>()

function emit() {
  for (const fn of listeners) {
    fn(cachedSchemes)
  }
}

export function getCachedSchemes(): EnrichedScheme[] {
  return cachedSchemes
}

export function getCachedSchemeById(id: string): EnrichedScheme | undefined {
  return cachedSchemes.find((s) => s.id === id)
}

export function subscribeSchemes(listener: (schemes: EnrichedScheme[]) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function mergeProgressMap(prev: EnrichedScheme[], id: string, progress: SchemeProgress): EnrichedScheme[] {
  return prev.map((item) => (item.id === id ? { ...item, progress } : item))
}

export async function syncSchemesFromBackend(params?: {
  mobile?: string
  state?: string
  farmSize?: string | number
}): Promise<{ ok: boolean; schemes: EnrichedScheme[]; summary?: SchemesSummary }> {
  const query = new URLSearchParams()
  if (params?.mobile) query.append("mobile", params.mobile)
  if (params?.state) query.append("state", params.state)
  if (params?.farmSize !== undefined) query.append("farmSize", String(params.farmSize))

  const qs = query.toString()
  const url = `${API_BASE}/schemes${qs ? `?${qs}` : ""}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 9000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const json = await res.json()
    if (json?.success && Array.isArray(json.schemes) && json.schemes.length > 0) {
      cachedSchemes = json.schemes as EnrichedScheme[]
      emit()
      return { ok: true, schemes: cachedSchemes, summary: json.summary }
    }
  } catch (err: any) {
    console.warn("⚠️ [Schemes Sync Offline Fallback]:", err?.message || err)
    const farmAcres = parseFarmAcres(params?.farmSize)
    cachedSchemes = cachedSchemes.map((s) => ({
      ...s,
      eligibilityMatch: evaluateSchemeEligibilityLocal(s, params?.state || "Karnataka", farmAcres),
    }))
    emit()
  }

  return { ok: false, schemes: cachedSchemes }
}

export async function fetchSchemeDetailFromBackend(
  id: string,
  params?: { mobile?: string; state?: string; farmSize?: string | number }
): Promise<EnrichedScheme | null> {
  const query = new URLSearchParams()
  if (params?.mobile) query.append("mobile", params.mobile)
  if (params?.state) query.append("state", params.state)
  if (params?.farmSize !== undefined) query.append("farmSize", String(params.farmSize))

  const qs = query.toString()
  const url = `${API_BASE}/schemes/${encodeURIComponent(id)}${qs ? `?${qs}` : ""}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    const json = await res.json()
    if (json?.success && json.scheme) {
      const updated = json.scheme as EnrichedScheme
      cachedSchemes = cachedSchemes.map((item) => (item.id === updated.id ? updated : item))
      emit()
      return updated
    }
  } catch {
    // Keep cached fallback
  }
  return getCachedSchemeById(id) ?? null
}

export async function toggleSchemeBookmark(
  id: string,
  farmer?: { mobile?: string; name?: string; state?: string; district?: string; farmSize?: string | number }
): Promise<{ ok: boolean; progress?: SchemeProgress }> {
  const existing = getCachedSchemeById(id)
  const optimisticNextBookmarked = !(existing?.progress.bookmarked ?? false)

  if (existing) {
    cachedSchemes = mergeProgressMap(cachedSchemes, id, {
      ...existing.progress,
      bookmarked: optimisticNextBookmarked,
    })
    emit()
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/schemes/${encodeURIComponent(id)}/bookmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: farmer?.mobile || "9591502209",
        name: farmer?.name,
        state: farmer?.state,
        district: farmer?.district,
        farmSize: farmer?.farmSize,
        bookmarked: optimisticNextBookmarked,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json?.success && json.progress) {
      cachedSchemes = mergeProgressMap(cachedSchemes, id, json.progress as SchemeProgress)
      emit()
      return { ok: true, progress: json.progress as SchemeProgress }
    }
  } catch (err: any) {
    console.warn("⚠️ [Scheme Bookmark Sync Warning]:", err?.message || err)
  }
  return { ok: false }
}

export async function saveSchemeProgress(
  id: string,
  update: {
    status?: SchemeApplicationStatus
    checkedDocs?: string[]
    bookmarked?: boolean
    notes?: string | null
  },
  farmer?: { mobile?: string; name?: string; state?: string; district?: string; farmSize?: string | number }
): Promise<{ ok: boolean; progress?: SchemeProgress }> {
  const existing = getCachedSchemeById(id)
  if (existing) {
    const nextDocs = update.checkedDocs ?? existing.progress.checkedDocs
    let nextStatus = update.status ?? existing.progress.status
    if (!update.status && update.checkedDocs !== undefined) {
      if (existing.progress.status === "NOT_APPLIED" || existing.progress.status === "CHECKLIST_READY") {
        nextStatus =
          existing.documents.length > 0 && nextDocs.length >= existing.documents.length
            ? "CHECKLIST_READY"
            : "NOT_APPLIED"
      }
    }
    const nextAppliedAt =
      nextStatus === "APPLIED" || nextStatus === "APPROVED"
        ? existing.progress.appliedAt ?? new Date().toISOString()
        : update.status === "NOT_APPLIED" || update.status === "CHECKLIST_READY"
        ? null
        : existing.progress.appliedAt

    cachedSchemes = mergeProgressMap(cachedSchemes, id, {
      ...existing.progress,
      checkedDocs: nextDocs,
      status: nextStatus,
      appliedAt: nextAppliedAt,
      bookmarked: update.bookmarked ?? existing.progress.bookmarked,
      notes: update.notes !== undefined ? update.notes : existing.progress.notes,
    })
    emit()
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/schemes/${encodeURIComponent(id)}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: farmer?.mobile || "9591502209",
        name: farmer?.name,
        state: farmer?.state,
        district: farmer?.district,
        farmSize: farmer?.farmSize,
        ...update,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json?.success && json.progress) {
      cachedSchemes = mergeProgressMap(cachedSchemes, id, json.progress as SchemeProgress)
      emit()
      return { ok: true, progress: json.progress as SchemeProgress }
    }
  } catch (err: any) {
    console.warn("⚠️ [Scheme Progress Sync Warning]:", err?.message || err)
  }

  return { ok: false }
}

/**
 * Opens an official government portal URL reliably across Android/iOS Expo Go and Web:
 * - "inapp" / default: uses expo-web-browser (Chrome Custom Tabs / SFSafariViewController),
 *   which never gets silently dropped by Android OEM Intent restrictions, and falls back to Linking.openURL.
 * - "external": launches the external system Browser app via Linking.openURL first, falling back to WebBrowser.
 */
export async function openOfficialPortalUrl(
  rawUrl: string,
  portalLabel?: string,
  lang: "en" | "kn" = "en",
  mode: "inapp" | "external" = "inapp"
): Promise<boolean> {
  const url = (rawUrl || "").trim()
  if (!/^https?:\/\//i.test(url)) {
    Alert.alert(
      lang === "kn" ? "ಅಮಾನ್ಯ ಲಿಂಕ್" : "Invalid Portal Link",
      url || "URL not available"
    )
    return false
  }

  console.log(`🌐 [Schemes Portal] Opening (${mode}): ${url}`)

  if (Platform.OS === "web") {
    try {
      const win = (globalThis as any)?.open?.(url, "_blank", "noopener,noreferrer")
      if (win) return true
    } catch {
      // fall through to Linking
    }
  }

  if (mode === "external") {
    try {
      await Linking.openURL(url)
      return true
    } catch (extErr: any) {
      console.warn("⚠️ [Portal External Linking Fallback -> WebBrowser]:", extErr?.message || extErr)
    }
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: "#256428",
        controlsColor: "#ffffff",
        showTitle: true,
        enableBarCollapsing: true,
      })
      return true
    } catch (wbErr: any) {
      console.warn("⚠️ [Portal WebBrowser Fallback Error]:", wbErr?.message || wbErr)
    }
  } else {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: "#256428",
        controlsColor: "#ffffff",
        showTitle: true,
        enableBarCollapsing: true,
      })
      return true
    } catch (wbErr: any) {
      console.warn("⚠️ [Portal WebBrowser Fallback -> Linking]:", wbErr?.message || wbErr)
    }
    try {
      await Linking.openURL(url)
      return true
    } catch (linkErr: any) {
      console.warn("⚠️ [Portal Linking Error]:", linkErr?.message || linkErr)
    }
  }

  Alert.alert(
    lang === "kn" ? "ಬ್ರೌಸರ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" : "Could Not Open Browser",
    `${portalLabel ? `${portalLabel}\n` : ""}${url}\n\n${
      lang === "kn"
        ? "ದಯವಿಟ್ಟು ಮೇಲಿನ ಅಧಿಕೃತ ಲಿಂಕ್ ಅನ್ನು ಹಂಚಿಕೊಳ್ಳಿ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ."
        : "Tap Share Link to send or open this official government portal URL in your browser."
    }`,
    [
      {
        text: lang === "kn" ? "ಲಿಂಕ್ ಹಂಚಿಕೊಳ್ಳಿ" : "Share Link",
        onPress: () => {
          Share.share({ message: `${portalLabel || "Official Portal"}: ${url}`, url }).catch(() => {})
        },
      },
      { text: "OK", style: "cancel" },
    ]
  )
  return false
}

export async function callSchemeHelpline(
  phone: string,
  schemeTitle?: string,
  lang: "en" | "kn" = "en"
): Promise<boolean> {
  const digits = (phone || "").replace(/[^0-9+]/g, "")
  if (!digits) return false
  const telUrl = `tel:${digits}`
  try {
    await Linking.openURL(telUrl)
    return true
  } catch {
    Alert.alert(
      lang === "kn" ? "ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆ" : "Official Helpline",
      `${schemeTitle ? `${schemeTitle}\n` : ""}${phone}\n\n${
        lang === "kn"
          ? "ನಿಮ್ಮ ಫೋನ್ ಡಯಲರ್ ಮೂಲಕ ಈ ಟೋಲ್-ಫ್ರೀ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ."
          : "Dial this toll-free government helpline number from your phone."
      }`
    )
    return false
  }
}

export async function shareSchemeInfo(
  scheme: Pick<
    SchemeCatalogItem,
    "nameEn" | "nameKn" | "benefitAmountEn" | "benefitAmountKn" | "officialUrl" | "secondaryUrl" | "helpline"
  >,
  lang: "en" | "kn" = "en"
) {
  const title = lang === "kn" ? scheme.nameKn : scheme.nameEn
  const benefit = lang === "kn" ? scheme.benefitAmountKn : scheme.benefitAmountEn
  const lines = [
    title,
    `${lang === "kn" ? "ಸೌಲಭ್ಯ" : "Benefit"}: ${benefit}`,
    `${lang === "kn" ? "ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್" : "Official Portal"}: ${scheme.officialUrl}`,
  ]
  if (scheme.secondaryUrl) {
    lines.push(`${lang === "kn" ? "ರಾಜ್ಯ / ಪೂರಕ ಪೋರ್ಟಲ್" : "State Portal"}: ${scheme.secondaryUrl}`)
  }
  if (scheme.helpline) {
    lines.push(`${lang === "kn" ? "ಸಹಾಯವಾಣಿ" : "Helpline"}: ${scheme.helpline}`)
  }
  await Share.share({
    title,
    message: lines.join("\n"),
    url: scheme.officialUrl,
  })
}
