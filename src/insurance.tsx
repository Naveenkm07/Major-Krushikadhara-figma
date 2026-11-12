import { createContext, Fragment, useContext, useMemo, useState, type ReactNode } from "react"
import { Text } from "react-native"
import { useProfile } from "./profile"

/** Look up a translated label for a stored internal value; falls back to the raw value. */
export function tr(map: Record<string, string>, key: string): string {
  return map[key] ?? key
}

/** Renders a translated string, turning <b>..</b> segments into bold text. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(<b>.*?<\/b>)/g)
  return (
    <Text>
      {parts.map((p, i) =>
        p.startsWith("<b>") ? (
          <Text key={i} style={{ fontWeight: "bold" }}>
            {p.slice(3, -4)}
          </Text>
        ) : (
          <Text key={i}>{p}</Text>
        ),
      )}
    </Text>
  )
}

export type AppStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "policy_issued"
  | "rejected"

export type ClaimStatus =
  | "submitted"
  | "initial_review"
  | "field_assessment"
  | "approved"
  | "rejected"
  | "payment_processing"
  | "completed"

export type InsuranceApplication = {
  id: string
  crop: string
  season: string
  district: string
  taluk: string
  area: string
  status: AppStatus
  submittedDate: string
  farmerName: string
  mobile: string
  coverage: number
  premium: number
  surveyNumber: string
  ownershipType: string
  sowingDate: string
  harvestDate: string
}

export type InsurancePolicy = {
  id: string
  policyNumber: string
  applicationId: string
  crop: string
  season: string
  area: string
  coverage: number
  premium: number
  startDate: string
  endDate: string
  farmerName: string
  district: string
}

export type InsuranceClaim = {
  id: string
  claimNumber: string
  policyId: string
  policyNumber: string
  crop: string
  lossType: string
  incidentDate: string
  area: string
  status: ClaimStatus
  submittedDate: string
  description: string
}

export type InsuranceDoc = {
  id: string
  name: string
  type: "policy" | "application_receipt" | "premium_receipt" | "claim_receipt" | "uploaded"
  date: string
  status: "available" | "pending"
  relatedId?: string
}

export type InsuranceNotifKind =
  | "application"
  | "documents_required"
  | "approved"
  | "policy_issued"
  | "claim"
  | "claim_update"
  | "deadline"

export type InsuranceNotifKey =
  | "application"
  | "approved"
  | "policy_issued"
  | "claim"
  | "claim_approved"
  | "claim_payment"

/** Notification text is resolved at render time from t.x.insurance.notif[key] using vars. */
export type InsuranceNotif = {
  id: string
  kind: InsuranceNotifKind
  key: InsuranceNotifKey
  vars: Record<string, string>
  at: number
  read: boolean
}

type InsuranceCtx = {
  applications: InsuranceApplication[]
  policies: InsurancePolicy[]
  claims: InsuranceClaim[]
  documents: InsuranceDoc[]
  notifications: InsuranceNotif[]
  unreadCount: number
  eligibilityResult: "idle" | "checking" | "eligible" | "needs_info" | "not_eligible"
  setEligibilityResult: (r: InsuranceCtx["eligibilityResult"]) => void
  submitApplication: (data: Partial<InsuranceApplication>) => string
  advanceApplicationStatus: (id: string) => void
  submitClaim: (data: {
    policyId: string
    policyNumber: string
    crop: string
    lossType: string
    incidentDate: string
    area: string
    description: string
  }) => string
  advanceClaimStatus: (id: string) => void
  markNotifsRead: () => void
}

const InsuranceContext = createContext<InsuranceCtx | null>(null)

let uid = 300
const nid = () => `ins${uid++}`

const APP_STEPS: AppStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "policy_issued",
]

const CLAIM_STEPS: ClaimStatus[] = [
  "submitted",
  "initial_review",
  "field_assessment",
  "approved",
  "payment_processing",
  "completed",
]

export function InsuranceProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const [applications, setApplications] = useState<InsuranceApplication[]>([])
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [documents, setDocuments] = useState<InsuranceDoc[]>([])
  const [notifications, setNotifications] = useState<InsuranceNotif[]>([])
  const [eligibilityResult, setEligibilityResult] =
    useState<InsuranceCtx["eligibilityResult"]>("idle")

  function pushNotif(n: Omit<InsuranceNotif, "id" | "at" | "read">) {
    setNotifications((prev) => [
      { id: nid(), at: Date.now(), read: false, ...n },
      ...prev,
    ])
  }

  function submitApplication(data: Partial<InsuranceApplication>): string {
    const id = nid()
    const acres = parseFloat(String(data.area ?? profile.farmSize)) || 2.0
    const coverage = Math.round(acres * 45000)
    const premium = Math.round(coverage * 0.02)
    const today = new Date().toLocaleDateString("en-IN")
    const app: InsuranceApplication = {
      id,
      crop: data.crop ?? profile.crops[0] ?? "Rice",
      season: data.season ?? "Kharif",
      district: data.district ?? profile.district ?? "Mandya",
      taluk: data.taluk ?? profile.taluk ?? "Pandavapura",
      area: data.area ?? profile.farmSize ?? "2.0",
      status: "submitted",
      submittedDate: today,
      farmerName: data.farmerName ?? profile.name ?? "Farmer",
      mobile: data.mobile ?? profile.mobile ?? "9591502209",
      coverage,
      premium,
      surveyNumber: data.surveyNumber ?? "SY-001",
      ownershipType: data.ownershipType ?? "Owned",
      sowingDate: data.sowingDate ?? "1 Jun 2026",
      harvestDate: data.harvestDate ?? "15 Oct 2026",
    }
    setApplications((prev) => [app, ...prev])
    setDocuments((prev) => [
      {
        id: nid(),
        name: "Application Receipt",
        type: "application_receipt",
        date: today,
        status: "available",
        relatedId: id,
      },
      ...prev,
    ])
    pushNotif({
      kind: "application",
      key: "application",
      vars: { crop: app.crop, season: app.season },
    })
    return id
  }

  function advanceApplicationStatus(appId: string) {
    const app = applications.find((a) => a.id === appId)
    if (!app) return
    const idx = APP_STEPS.indexOf(app.status)
    if (idx < 0 || idx >= APP_STEPS.length - 1) return
    const nextStatus = APP_STEPS[idx + 1]

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a)),
    )

    if (nextStatus === "approved") {
      pushNotif({
        kind: "approved",
        key: "approved",
        vars: { crop: app.crop },
      })
    } else if (nextStatus === "policy_issued") {
      const policyId = nid()
      const policyNumber = `PMFBY-DEMO-2026-${String(policyId).slice(-3).padStart(3, "0")}`
      const today = new Date().toLocaleDateString("en-IN")
      setPolicies((prev) => [
        {
          id: policyId,
          policyNumber,
          applicationId: appId,
          crop: app.crop,
          season: app.season,
          area: app.area,
          coverage: app.coverage,
          premium: app.premium,
          startDate: "1 Jun 2026",
          endDate: "30 Nov 2026",
          farmerName: app.farmerName,
          district: app.district,
        },
        ...prev,
      ])
      setDocuments((prev) => [
        {
          id: nid(),
          name: "Policy Document",
          type: "policy",
          date: today,
          status: "available",
          relatedId: policyId,
        },
        {
          id: nid(),
          name: "Premium Receipt",
          type: "premium_receipt",
          date: today,
          status: "available",
          relatedId: policyId,
        },
        ...prev,
      ])
      pushNotif({
        kind: "policy_issued",
        key: "policy_issued",
        vars: { policyNumber },
      })
    }
  }

  function submitClaim(data: {
    policyId: string
    policyNumber: string
    crop: string
    lossType: string
    incidentDate: string
    area: string
    description: string
  }): string {
    const id = nid()
    const claimNumber = `CLM-DEMO-${String(id).slice(-3).padStart(3, "0")}`
    const today = new Date().toLocaleDateString("en-IN")
    const claim: InsuranceClaim = {
      id,
      claimNumber,
      ...data,
      status: "submitted",
      submittedDate: today,
    }
    setClaims((prev) => [claim, ...prev])
    setDocuments((prev) => [
      {
        id: nid(),
        name: "Claim Receipt",
        type: "claim_receipt",
        date: today,
        status: "available",
        relatedId: id,
      },
      ...prev,
    ])
    pushNotif({
      kind: "claim",
      key: "claim",
      vars: { crop: data.crop, claimNumber },
    })
    return id
  }

  function advanceClaimStatus(claimId: string) {
    const claim = claims.find((c) => c.id === claimId)
    if (!claim) return
    const idx = CLAIM_STEPS.indexOf(claim.status)
    if (idx < 0 || idx >= CLAIM_STEPS.length - 1) return
    const nextStatus = CLAIM_STEPS[idx + 1]
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: nextStatus } : c)),
    )
    if (nextStatus === "approved") {
      pushNotif({
        kind: "claim_update",
        key: "claim_approved",
        vars: { crop: claim.crop, claimNumber: claim.claimNumber },
      })
    } else if (nextStatus === "payment_processing") {
      pushNotif({
        kind: "claim_update",
        key: "claim_payment",
        vars: { claimNumber: claim.claimNumber },
      })
    }
  }

  function markNotifsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  return (
    <InsuranceContext.Provider
      value={{
        applications,
        policies,
        claims,
        documents,
        notifications,
        unreadCount,
        eligibilityResult,
        setEligibilityResult,
        submitApplication,
        advanceApplicationStatus,
        submitClaim,
        advanceClaimStatus,
        markNotifsRead,
      }}
    >
      {children}
    </InsuranceContext.Provider>
  )
}

export function useInsurance() {
  const ctx = useContext(InsuranceContext)
  if (!ctx) throw new Error("useInsurance must be used within InsuranceProvider")
  return ctx
}

/** Step keys only; labels are translated at render via t.x.insurance.appSteps / claimSteps. */
export const APP_STATUS_STEPS: { key: Exclude<AppStatus, "rejected"> }[] = [
  { key: "submitted" },
  { key: "under_review" },
  { key: "approved" },
  { key: "policy_issued" },
]

export const CLAIM_STATUS_STEPS: { key: Exclude<ClaimStatus, "rejected"> }[] = [
  { key: "submitted" },
  { key: "initial_review" },
  { key: "field_assessment" },
  { key: "approved" },
  { key: "payment_processing" },
  { key: "completed" },
]
