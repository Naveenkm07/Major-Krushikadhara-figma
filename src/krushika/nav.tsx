import { createContext, useContext, useState, type ReactNode } from "react"

export type Route =
  | "notifications"
  | "market"
  | "calendar"
  | "insurance"
  | "schemes"
  | "help"
  | "about"
  | "saved"
  | "language"
  | "scanResult"
  | "editProfile"
  // Crop insurance workflow
  | "insuranceDashboard"
  | "eligibilityCheck"
  | "insurancePlan"
  | "insuranceApplication"
  | "applicationStatus"
  | "policyDetails"
  | "claimHome"
  | "reportCropLoss"
  | "claimTracking"
  | "claimDetails"
  | "insuranceDocuments"
  | "importantDates"
  | "insuranceHelp"
  // Equipment rental marketplace
  | "equipment"
  | "equipmentDetails"
  | "requestRental"
  | "requestSent"
  | "myRentals"
  | "rentalDetails"
  | "listEquipment"
  | "listingPreview"
  | "myEquipment"
  | "ownerRequests"
  | "ownerDashboard"
  | "rentalHistory"
  | "rentalNotifications"
  // AI scan workflow
  | "scanProcessing"
  | "aiAnalysis"
  | "diseaseResult"
  | "lowConfidence"
  | "aiPredictions"
  | "scanHistory"
  // New feature screens
  | "schemeDetail"
  | "weather"
  | "myFarm"
  | "voiceAssistant"
  // Informational
  | "offlineMode"
  | "howAiWorks"
  | "technicalArch"
  | "settings"

type Params = Record<string, unknown>
type StackItem = { name: Route; params?: Params }

type NavContextValue = {
  stack: StackItem[]
  current: StackItem | null
  params: Params
  open: (route: Route, params?: Params) => void
  back: () => void
  reset: () => void
}

const NavContext = createContext<NavContextValue | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<StackItem[]>([])
  const open = (route: Route, params?: Params) =>
    setStack((s) => [...s, { name: route, params }])
  const back = () => setStack((s) => s.slice(0, -1))
  const reset = () => setStack([])
  const current = stack.length ? stack[stack.length - 1] : null
  return (
    <NavContext.Provider
      value={{ stack, current, params: current?.params ?? {}, open, back, reset }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useNav must be used within NavProvider")
  return ctx
}
