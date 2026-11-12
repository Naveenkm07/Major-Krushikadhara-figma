import { API_BASE } from "./config"
import type {
  InsuranceApplication,
  InsuranceClaim,
  InsuranceDoc,
  InsuranceNotif,
  InsurancePolicy,
} from "../insurance"

export interface InsuranceStateDTO {
  success?: boolean
  applications: InsuranceApplication[]
  policies: InsurancePolicy[]
  claims: InsuranceClaim[]
  documents: InsuranceDoc[]
  notifications: InsuranceNotif[]
}

async function fetchInsJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000
): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
      signal: controller.signal,
    })
    if (!res.ok) return null
    const json = await res.json().catch(() => null)
    if (!json || json.success === false) return null
    return json as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function syncInsuranceFromBackend(
  mobile: string
): Promise<InsuranceStateDTO | null> {
  return await fetchInsJson<InsuranceStateDTO>(
    `${API_BASE}/insurance?mobile=${encodeURIComponent(mobile)}`,
    { method: "GET" }
  )
}

export async function submitInsuranceApplicationOnBackend(
  mobile: string,
  data: Partial<InsuranceApplication>
): Promise<{ application: InsuranceApplication; state: InsuranceStateDTO } | null> {
  return await fetchInsJson(
    `${API_BASE}/insurance/applications`,
    {
      method: "POST",
      body: JSON.stringify({ mobile, ...data }),
    }
  )
}

export async function advanceInsuranceApplicationOnBackend(
  mobile: string,
  appId: string
): Promise<{ application: InsuranceApplication; state: InsuranceStateDTO } | null> {
  return await fetchInsJson(
    `${API_BASE}/insurance/applications/${encodeURIComponent(appId)}/advance`,
    {
      method: "PATCH",
      body: JSON.stringify({ mobile }),
    }
  )
}

export async function submitInsuranceClaimOnBackend(
  mobile: string,
  data: {
    id?: string
    policyId: string
    policyNumber: string
    crop: string
    lossType: string
    incidentDate: string
    area: string
    description: string
  }
): Promise<{ claim: InsuranceClaim; state: InsuranceStateDTO } | null> {
  return await fetchInsJson(
    `${API_BASE}/insurance/claims`,
    {
      method: "POST",
      body: JSON.stringify({ mobile, ...data }),
    }
  )
}

export async function advanceInsuranceClaimOnBackend(
  mobile: string,
  claimId: string
): Promise<{ claim: InsuranceClaim; state: InsuranceStateDTO } | null> {
  return await fetchInsJson(
    `${API_BASE}/insurance/claims/${encodeURIComponent(claimId)}/advance`,
    {
      method: "PATCH",
      body: JSON.stringify({ mobile }),
    }
  )
}

export async function addInsuranceDocumentOnBackend(
  mobile: string,
  data: { name: string; relatedId?: string }
): Promise<{ document: InsuranceDoc; state: InsuranceStateDTO } | null> {
  return await fetchInsJson(
    `${API_BASE}/insurance/documents`,
    {
      method: "POST",
      body: JSON.stringify({ mobile, ...data }),
    }
  )
}

export async function markInsuranceNotifsReadOnBackend(
  mobile: string
): Promise<{ updatedCount: number; state: InsuranceStateDTO } | null> {
  return await fetchInsJson(
    `${API_BASE}/insurance/notifications/read`,
    {
      method: "PATCH",
      body: JSON.stringify({ mobile }),
    }
  )
}

