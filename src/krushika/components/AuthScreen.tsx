import { useRef, useState } from "react"
import { Sprout, Phone, Loader2, Check, FlaskConical } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import {
  DEV_TEST_PHONE,
  TEST_AUTH_ENABLED,
  isValidIndianMobile,
  recordConsent,
  requestOtp,
} from "@/krushika/auth"
import OtpScreen from "./OtpScreen"
import LegalSheet, { type LegalDoc } from "./LegalSheet"

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

export default function AuthScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const L = t.x.login
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState<null | "phone" | "google">(null)
  const [notice, setNotice] = useState("")
  const [legal, setLegal] = useState<LegalDoc | null>(null)
  const submitting = useRef(false)

  const valid = isValidIndianMobile(phone)
  const showPhoneError = phone.length > 0 && (phone.length === 10 ? !valid : touched)
  const phoneError = phone.length < 10 ? L.phoneShort : L.phoneInvalid
  const canContinue = valid && consent && busy === null
  const showConsentHint = valid && !consent

  async function submitPhone() {
    if (!canContinue || submitting.current) return
    submitting.current = true
    setBusy("phone")
    setNotice("")
    try {
      const res = await requestOtp(phone)
      if (res.ok) {
        recordConsent()
        setStep("otp")
      } else {
        setNotice(L.noSms)
      }
    } catch {
      setNotice(L.error)
    } finally {
      submitting.current = false
      setBusy(null)
    }
  }

  function googleSignIn() {
    if (busy) return
    setBusy("google")
    setNotice("")
    // No Google OAuth client is configured in this build, so no sign-in is attempted.
    setTimeout(() => {
      setNotice(L.googleNotConfigured)
      setBusy(null)
    }, 600)
  }

  if (step === "otp")
    return (
      <OtpScreen
        phone={phone}
        onVerified={onDone}
        onEditPhone={() => {
          setNotice("")
          setStep("phone")
        }}
      />
    )

  const consentParts = L.consent.split(/(\{terms\}|\{privacy\})/)

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-[#f7f8ec] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(4rem,calc(env(safe-area-inset-top)+2rem))]">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3a9d3e] to-[#256428] shadow-lg shadow-green-900/20">
          <Sprout className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-[#256428]">
          {t.auth.welcome}
        </h1>
        <p className="mt-1 text-center text-base font-semibold text-gray-500">{t.auth.signIn}</p>

        {/* Phone login */}
        <div className="mt-8">
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-gray-600">
            {t.auth.phoneLabel}
          </label>
          <div
            className={`flex items-center gap-2 rounded-2xl border bg-white px-3 shadow-sm focus-within:border-[#2f7d32] ${
              showPhoneError ? "border-red-400" : "border-gray-200"
            }`}
          >
            <span className="flex items-center gap-1.5 border-r border-gray-200 py-3 pr-3 font-semibold text-gray-700">
              <Phone className="h-4 w-4 text-[#2f7d32]" /> +91
            </span>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={() => setTouched(true)}
              onKeyDown={(e) => e.key === "Enter" && submitPhone()}
              onFocus={(e) => e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })}
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              aria-invalid={showPhoneError}
              aria-describedby="phone-msg"
              placeholder={t.auth.phonePlaceholder}
              className="w-full bg-transparent py-3 text-gray-800 outline-none placeholder:text-gray-400"
            />
            {valid && <Check className="h-5 w-5 shrink-0 text-[#2f7d32]" aria-hidden="true" />}
          </div>
          <p id="phone-msg" role={showPhoneError ? "alert" : undefined} className="mt-1.5 min-h-5 text-sm text-red-600">
            {showPhoneError ? phoneError : ""}
          </p>

          {/* Consent */}
          <label className="mt-2 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#2f7d32]/40 ${
                consent ? "border-[#2f7d32] bg-[#2f7d32]" : "border-gray-300 bg-white"
              }`}
            >
              {consent && <Check className="h-4 w-4 text-white" />}
            </span>
            <span className="text-sm leading-relaxed text-gray-600">
              {consentParts.map((part, i) =>
                part === "{terms}" ? (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setLegal("terms")
                    }}
                    className="font-semibold text-[#2f7d32] underline underline-offset-2"
                  >
                    {L.termsLink}
                  </button>
                ) : part === "{privacy}" ? (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setLegal("privacy")
                    }}
                    className="font-semibold text-[#2f7d32] underline underline-offset-2"
                  >
                    {L.privacyLink}
                  </button>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </span>
          </label>
          {showConsentHint && (
            <p role="alert" className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {L.consentRequired}
            </p>
          )}

          <button
            onClick={submitPhone}
            disabled={!canContinue}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-900/20 transition active:scale-[0.98] disabled:opacity-40"
          >
            {busy === "phone" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> {L.wait}
              </>
            ) : (
              t.auth.continue
            )}
          </button>
        </div>

        {notice && (
          <p role="alert" className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-800">
            {notice}
          </p>
        )}

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400">{t.auth.or}</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google */}
        <button
          onClick={googleSignIn}
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : (
            <GoogleIcon />
          )}
          {busy === "google" ? t.auth.signingIn : t.auth.google}
        </button>

        {TEST_AUTH_ENABLED && DEV_TEST_PHONE && (
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
            <FlaskConical className="h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-semibold">{L.devBadge}</span> · {fmt(L.devPhone, { phone: DEV_TEST_PHONE })}
            </span>
          </p>
        )}
      </div>

      {legal && <LegalSheet doc={legal} onClose={() => setLegal(null)} />}
    </div>
  )
}
