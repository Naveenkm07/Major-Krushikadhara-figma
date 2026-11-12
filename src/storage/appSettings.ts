import { useEffect, useState } from "react"
import { saveProfileToBackend } from "../api/profile"

export interface AppSettingsState {
  notificationsOn: boolean
  offlineModeOn: boolean
  modelVersion: string
  lastSyncDate: string
  lastSyncStatus: "synced" | "local"
}

function formatNowLabel(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }) + ", " + new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

let activeMobile = "9591502209"

let settingsState: AppSettingsState = {
  notificationsOn: true,
  offlineModeOn: true,
  modelVersion: "YOLO11s + Gemini Vision",
  lastSyncDate: formatNowLabel(),
  lastSyncStatus: "local",
}

const listeners = new Set<(state: AppSettingsState) => void>()

function emit() {
  const snapshot = { ...settingsState }
  listeners.forEach((cb) => cb(snapshot))
}

export function setAppSettingsMobile(mobile: string) {
  if (mobile) activeMobile = mobile
}

export function hydrateAppSettings(patch: Partial<AppSettingsState>) {
  settingsState = { ...settingsState, ...patch }
  emit()
}

export function markCloudSyncedNow() {
  settingsState = {
    ...settingsState,
    lastSyncDate: formatNowLabel(),
    lastSyncStatus: "synced",
  }
  emit()
}

export function updateAppSettings(patch: Partial<AppSettingsState>) {
  settingsState = { ...settingsState, ...patch }
  emit()

  // Persist notification / offline preferences to Neon PostgreSQL
  const dbPatch: Record<string, any> = {}
  if (typeof patch.notificationsOn === "boolean") dbPatch.notificationsOn = patch.notificationsOn
  if (typeof patch.offlineModeOn === "boolean") dbPatch.offlineModeOn = patch.offlineModeOn
  if (Object.keys(dbPatch).length > 0 && activeMobile) {
    saveProfileToBackend({ mobile: activeMobile, ...dbPatch })
      .then(() => markCloudSyncedNow())
      .catch(() => {})
  }
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettingsState>(() => ({
    ...settingsState,
  }))

  useEffect(() => {
    const listener = (next: AppSettingsState) => setSettings(next)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    settings,
    updateSettings: updateAppSettings,
  }
}
