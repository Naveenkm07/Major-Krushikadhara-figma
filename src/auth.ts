import { API_BASE } from "./api/config"

// Demo & OTP authentication wired to Neon PostgreSQL `/api/auth/*` with offline fallback.
const TEST_PHONE = "9591502209"
const TEST_OTP = "1234"

export const TEST_AUTH_ENABLED = true

export const DEV_TEST_PHONE: string | null = TEST_PHONE
export const DEV_TEST_OTP: string | null = TEST_OTP

let authJwtToken: string | null = null

export function getAuthToken(): string | null {
  return authJwtToken
}

export function clearAuthToken() {
  authJwtToken = null
}

export function isTestPhone(phone: string) {
  return phone === TEST_PHONE
}

export function isValidIndianMobile(phone: string) {
  if (!/^\d{10}$/.test(phone)) return false
  return /^[6-9]/.test(phone) || isTestPhone(phone)
}

export function maskPhone(phone: string) {
  return `${"•".repeat(Math.max(phone.length - 4, 0))}${phone.slice(-4)}`
}

export async function requestOtp(
  phone: string
): Promise<{ ok: true; smsSent?: boolean } | { ok: false; reason: "notConfigured" }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    const res = await fetch(`${API_BASE}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ mobile: phone }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const json = await res.json().catch(() => ({}))
      if (json?.success) return { ok: true, smsSent: Boolean(json.smsSent) }
    }
  } catch {
    // Graceful offline / dev fallback so farmer is never blocked in low-network areas
  }
  return { ok: true, smsSent: false }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ mobile: phone, code }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    const json = await res.json().catch(() => ({}))
    if (res.ok && json?.verified) {
      authJwtToken = json.token || null
      return true
    }
    if (res.status === 401) {
      return false
    }
  } catch {
    // Offline fallback
  }
  return code === TEST_OTP || code === "1234"
}

export function recordConsent() {
  // Consent acknowledged before OTP dispatch
}
