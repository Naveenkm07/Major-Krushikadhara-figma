// Demo authentication for previews and mobile builds.
const TEST_PHONE = "9591502209"
const TEST_OTP = "1234"

export const TEST_AUTH_ENABLED = true

export const DEV_TEST_PHONE: string | null = TEST_PHONE
export const DEV_TEST_OTP: string | null = TEST_OTP

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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function requestOtp(phone: string): Promise<{ ok: true } | { ok: false; reason: "notConfigured" }> {
  await wait(600)
  // Allow test phone or any valid mobile in demo mode
  return { ok: true }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  await wait(700)
  return code === TEST_OTP || code === "1234"
}

export function recordConsent() {
  // Consent recorded
}

