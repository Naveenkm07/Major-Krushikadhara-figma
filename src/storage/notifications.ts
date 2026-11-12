import { useEffect, useState } from "react"

export type NotificationKind = "weather" | "pest" | "irrigation" | "market" | "scheme"

export interface AppNotification {
  id: string
  kind: NotificationKind
  titleEn: string
  titleKn: string
  bodyEn: string
  bodyKn: string
  agoEn: string
  agoKn: string
  read: boolean
  route: string
}

function buildInitialNotifications(
  district: string = "Mandya",
  crops: string[] = ["Rice", "Ragi", "Tomato"]
): AppNotification[] {
  const primaryCrop = crops[0] || "Rice"
  const secondCrop = crops[1] || primaryCrop

  return [
    {
      id: "notif_weather",
      kind: "weather",
      titleEn: "Weather Advisory",
      titleKn: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ",
      bodyEn: `Check today's ${district} wind & humidity forecast before foliar spraying.`,
      bodyKn: `${district} ಭಾಗದಲ್ಲಿ ಔಷಧ ಸಿಂಪಡಣೆ ಮಾಡುವ ಮೊದಲು ಇಂದಿನ ಗಾಳಿ ಮತ್ತು ತೇವಾಂಶ ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ.`,
      agoEn: "2h ago",
      agoKn: "2 ಗಂಟೆ ಹಿಂದೆ",
      read: false,
      route: "weather",
    },
    {
      id: "notif_pest",
      kind: "pest",
      titleEn: "Crop Surveillance Alert",
      titleKn: "ಬೆಳೆ ಕೀಟ ನಿಗಾ ಎಚ್ಚರಿಕೆ",
      bodyEn: `Inspect ${primaryCrop} leaves for early pest or blight spots using AI Crop Scan.`,
      bodyKn: `${primaryCrop} ಎಲೆಗಳಲ್ಲಿ ಆರಂಭಿಕ ಕೀಟ ಅಥವಾ ರೋಗ ಚುಕ್ಕೆಗಳಿಗಾಗಿ AI ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಬಳಸಿ ಪರಿಶೀಲಿಸಿ.`,
      agoEn: "5h ago",
      agoKn: "5 ಗಂಟೆ ಹಿಂದೆ",
      read: false,
      route: "scan",
    },
    {
      id: "notif_irrigation",
      kind: "irrigation",
      titleEn: "Crop Calendar Stage Check",
      titleKn: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಹಂತದ ಜ್ಞಾಪನೆ",
      bodyEn: `Review today's irrigation and fertilizer schedule for your ${secondCrop} plot.`,
      bodyKn: `ನಿಮ್ಮ ${secondCrop} ಹೊಲಕ್ಕೆ ಇಂದಿನ ನೀರಾವರಿ ಮತ್ತು ಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.`,
      agoEn: "8h ago",
      agoKn: "8 ಗಂಟೆ ಹಿಂದೆ",
      read: false,
      route: "cropCalendar",
    },
    {
      id: "notif_market",
      kind: "market",
      titleEn: "Live Mandi Price Check",
      titleKn: "ನೇರ ಮಂಡಿ ದರ ಪರಿಶೀಲನೆ",
      bodyEn: `View today's AGMARKNET rates near ${district} APMC before transporting produce.`,
      bodyKn: `ಉತ್ಪನ್ನ ಮಾರಾಟದ ಮೊದಲು ${district} ಸುತ್ತಮುತ್ತಲಿನ APMC ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`,
      agoEn: "Yesterday",
      agoKn: "ನಿನ್ನೆ",
      read: true,
      route: "market",
    },
    {
      id: "notif_scheme",
      kind: "scheme",
      titleEn: "Government Schemes Portal",
      titleKn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಪೋರ್ಟಲ್",
      bodyEn: "Check your PM-KISAN & PMFBY eligibility and document checklist anytime.",
      bodyKn: "PM-KISAN ಮತ್ತು PMFBY ಅರ್ಹತೆ ಹಾಗೂ ದಾಖಲೆಗಳ ಪಟ್ಟಿಯನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.",
      agoEn: "2 days ago",
      agoKn: "2 ದಿನ ಹಿಂದೆ",
      read: true,
      route: "schemes",
    },
  ]
}

let notificationsStore: AppNotification[] = buildInitialNotifications()
let lastContextKey = "Mandya|Rice"
const listeners = new Set<(items: AppNotification[]) => void>()

function emit() {
  const snapshot = [...notificationsStore]
  listeners.forEach((cb) => cb(snapshot))
}

export function syncNotificationsContext(district: string, crops: string[]) {
  const key = `${district}|${crops[0] || "Rice"}`
  if (key === lastContextKey) return
  lastContextKey = key
  const readMap = new Map(notificationsStore.map((n) => [n.id, n.read]))
  notificationsStore = buildInitialNotifications(district, crops).map((n) => ({
    ...n,
    read: readMap.get(n.id) ?? n.read,
  }))
  emit()
}

export function markNotificationRead(id: string) {
  notificationsStore = notificationsStore.map((n) =>
    n.id === id ? { ...n, read: true } : n
  )
  emit()
}

export function markAllNotificationsRead() {
  notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }))
  emit()
}

export function useNotifications(district?: string, crops?: string[]) {
  const [items, setItems] = useState<AppNotification[]>(() => [
    ...notificationsStore,
  ])

  useEffect(() => {
    if (district) {
      syncNotificationsContext(district, crops || ["Rice"])
    }
  }, [district, crops])

  useEffect(() => {
    const listener = (next: AppNotification[]) => setItems(next)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const unreadCount = items.filter((n) => !n.read).length

  return {
    items,
    unreadCount,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
  }
}

