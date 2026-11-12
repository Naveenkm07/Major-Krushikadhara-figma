import { useEffect, useState } from "react"

export interface AppSettingsState {
  notificationsOn: boolean
  offlineModeOn: boolean
  modelVersion: string
  cacheSizeMb: string
  lastSyncDate: string
}

let settingsState: AppSettingsState = {
  notificationsOn: true,
  offlineModeOn: true,
  modelVersion: "YOLO11s-pest v1.0 (102 classes)",
  cacheSizeMb: "19.2 MB",
  lastSyncDate: new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
}

const listeners = new Set<(state: AppSettingsState) => void>()

function emit() {
  const snapshot = { ...settingsState }
  listeners.forEach((cb) => cb(snapshot))
}

export function updateAppSettings(patch: Partial<AppSettingsState>) {
  settingsState = { ...settingsState, ...patch }
  emit()
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

