import { useEffect, useState } from "react"
import { CheckCircle2, Cpu } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang } from "@/krushika/i18n"

const STEP_MS = [500, 700, 900, 800, 500]

export default function ScanProcessingScreen() {
  const { t } = useLang()
  const sf = t.x.scanFlow
  const STEPS = sf.proc.steps.map((s, i) => ({ ...s, ms: STEP_MS[i] }))
  const { back, open, params } = useNav()
  const imageUrl = typeof params.imageUrl === "string" ? params.imageUrl : undefined
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    STEPS.forEach((s, i) => {
      elapsed += s.ms
      timers.push(setTimeout(() => setStep(i + 1), elapsed))
    })

    const total = elapsed + 400
    timers.push(
      setTimeout(() => {
        setDone(true)
        setTimeout(() => {
          back()
          open("scanResult", imageUrl ? { imageUrl } : undefined)
        }, 500)
      }, total),
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const progress = Math.round((step / STEPS.length) * 100)
  const r = 48
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a4c1c] to-[#0d2e0e]">
      {/* circular progress */}
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke="#6fcf73"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        {done ? (
          <CheckCircle2 className="h-14 w-14 text-green-400" />
        ) : (
          <div className="flex flex-col items-center">
            <Cpu className="h-8 w-8 animate-pulse text-green-400" />
            <span className="mt-1 text-lg font-bold text-white">{progress}%</span>
          </div>
        )}
      </div>

      <h2 className="mt-8 text-xl font-bold text-white">
        {done ? sf.common.analysisComplete : sf.proc.analyzing}
      </h2>
      <p className="mt-1.5 text-sm text-white/60">
        {done ? sf.common.preparingResults : sf.proc.offline}
      </p>

      {/* Step list */}
      <div className="mt-10 w-full max-w-xs space-y-3 px-6">
        {STEPS.map((s, i) => {
          const completed = step > i
          const active = step === i
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${
                completed
                  ? "bg-white/10"
                  : active
                    ? "bg-white/15 ring-1 ring-green-400/40"
                    : "opacity-30"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  completed
                    ? "bg-green-400 text-[#0d2e0e]"
                    : active
                      ? "border-2 border-green-400 text-green-400"
                      : "border border-white/20 text-white/40"
                }`}
              >
                {completed ? "✓" : i + 1}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${completed || active ? "text-white" : "text-white/40"}`}>
                  {s.label}
                </p>
                {active && <p className="text-xs text-green-300/80">{s.sub}</p>}
              </div>
              {active && (
                <span className="ml-auto text-xs text-green-400 animate-pulse">…</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Model badge */}
      <div className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
        <Cpu className="h-3.5 w-3.5 text-green-400" />
        <span className="text-xs text-white/70">{sf.common.modelBadge}</span>
      </div>
    </div>
  )
}
