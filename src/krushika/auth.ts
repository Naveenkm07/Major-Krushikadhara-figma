// Demo authentication for previews and published prototype builds. Disable it
// explicitly with NEXT_PUBLIC_ENABLE_TEST_AUTH=false when real SMS auth is added.
const TEST_PHONE = "9591502209"
const TEST_OTP = "1234"

export const TEST_AUTH_ENABLED: boolean = process.env.NEXT_PUBLIC_ENABLE_TEST_AUTH !== "false"

export const DEV_TEST_PHONE: string | null = TEST_AUTH_ENABLED ? TEST_PHONE : null
export const DEV_TEST_OTP: string | null = TEST_AUTH_ENABLED ? TEST_OTP : null

export function isTestPhone(phone: string) {
  return TEST_AUTH_ENABLED && phone === TEST_PHONE
}

export function isValidIndianMobile(phone: string) {
  if (!/^\d{10}$/.test(phone)) return false
  return /^[6-9]/.test(phone) || isTestPhone(phone)
}

export function maskPhone(phone: string) {
  return `${"•".repeat(Math.max(phone.length - 4, 0))}${phone.slice(-4)}`
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function requestOtp(phone: string): Promise<{ ok: true } | { ok: false; reason: "notConfigured" }> {
  await wait(600)
  return isTestPhone(phone) ? { ok: true } : { ok: false, reason: "notConfigured" }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  await wait(700)
  return isTestPhone(phone) && code === TEST_OTP
}

const CONSENT_KEY = "krushikadhara.consent"

export function recordConsent() {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ accepted: true, acceptedAt: new Date().toISOString(), version: 1 }),
    )
  } catch {
    /* storage unavailable */
  }
}
