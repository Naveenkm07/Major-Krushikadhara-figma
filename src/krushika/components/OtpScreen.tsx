import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Loader2, FlaskConical, ShieldCheck } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { DEV_TEST_OTP, isTestPhone, maskPhone, requestOtp, verifyOtp } from "@/krushika/auth"

const COOLDOWN_S = 30

export default function OtpScreen({
  phone,
  onVerified,
  onEditPhone,
}: {
  phone: string
  onVerified: () => void
  onEditPhone: () => void
}) {
  const { t } = useLang()
  const L = t.x.login
  const [digits, setDigits] = useState<string[]>(["", "", "", ""])
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(COOLDOWN_S)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const verifying = useRef(false)
  const code = digits.join("")

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  function setAt(i: number, v: string) {
    setDigits((d) => d.map((x, idx) => (idx === i ? v : x)))
  }

  function onChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, "")
    setError("")
    if (!v) return setAt(i, "")
    if (v.length > 1) return fill(v, i)
    setAt(i, v)
    if (i < 3) refs.current[i + 1]?.focus()
  }

  function fill(text: string, start = 0) {
    const chars = text.replace(/\D/g, "").slice(0, 4 - start).split("")
    if (!chars.length) return
    setError("")
    setDigits((d) => d.map((x, idx) => (idx >= start && idx - start < chars.length ? chars[idx - start] : x)))
    refs.current[Math.min(start + chars.length, 3)]?.focus()
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault()
      setAt(i - 1, "")
      refs.current[i - 1]?.focus()
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === "ArrowRight" && i < 3) refs.current[i + 1]?.focus()
    else if (e.key === "Enter") submit()
  }

  async function submit() {
    if (code.length !== 4 || verifying.current) return
    verifying.current = true
    setBusy(true)
    setError("")
    ;(document.activeElement as HTMLElement | null)?.blur()
    try {
      const ok = await verifyOtp(phone, code)
      if (ok) {
        onVerified()
        return
      }
      setError(L.invalidCode)
      setDigits(["", "", "", ""])
      refs.current[0]?.focus()
    } catch {
      setError(L.error)
    } finally {
      verifying.current = false
      setBusy(false)
    }
  }

  async function resend() {
    if (cooldown > 0 || busy) return
    setCooldown(COOLDOWN_S)
    setError("")
    setDigits(["", "", "", ""])
    refs.current[0]?.focus()
    try {
      await requestOtp(phone)
    } catch {
      /* ignored: nothing is actually sent in this build */
    }
    setInfo(L.resendNoSms)
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-[#f7f8ec] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))]">
      <button
        onClick={onEditPhone}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm active:scale-95"
        aria-label={L.editPhone}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3a9d3e] to-[#256428] shadow-lg shadow-green-900/20">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold leading-tight text-[#256428]">{L.verifyTitle}</h1>
        <p className="mt-2 text-center text-base text-gray-600">{L.verifyDesc}</p>
        <p className="mt-1 text-center text-sm font-semibold text-gray-700">
          {fmt(L.verifyFor, { phone: `+91 ${maskPhone(phone)}` })}
        </p>

        <div className="mt-8 flex justify-center gap-3" onPaste={(e) => {
          e.preventDefault()
          fill(e.clipboardData.getData("text"))
        }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => {
                e.currentTarget.select()
                e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })
              }}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={4}
              disabled={busy}
              aria-label={fmt(L.digit, { n: i + 1 })}
              aria-invalid={!!error}
              className={`h-16 w-14 rounded-2xl border bg-white text-center text-2xl font-bold text-gray-900 shadow-sm outline-none transition focus:border-[#2f7d32] focus:ring-2 focus:ring-[#2f7d32]/30 disabled:opacity-60 ${
                error ? "border-red-400" : "border-gray-200"
              }`}
            />
          ))}
        </div>

        <p role="alert" className="mt-3 min-h-6 text-center text-sm font-medium text-red-600">
          {error}
        </p>

        <button
          onClick={submit}
          disabled={code.length !== 4 || busy}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-900/20 transition active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> {L.verifying}
            </>
          ) : (
            L.verify
          )}
        </button>

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            onClick={resend}
            disabled={cooldown > 0 || busy}
            className="min-h-11 px-3 text-sm font-semibold text-[#2f7d32] disabled:text-gray-400"
          >
            {cooldown > 0 ? fmt(L.resendIn, { s: cooldown }) : L.resend}
          </button>
          {info && <p className="text-center text-xs text-gray-500">{info}</p>}
          <button onClick={onEditPhone} className="min-h-11 px-3 text-sm font-semibold text-gray-600 underline underline-offset-2">
            {L.editPhone}
          </button>
        </div>

        {DEV_TEST_OTP && isTestPhone(phone) && (
          <p className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-gray-500 shadow-sm">
            <FlaskConical className="h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-semibold">{L.devBadge}</span> · {fmt(L.devCode, { code: DEV_TEST_OTP })}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
