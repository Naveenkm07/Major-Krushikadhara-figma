import { useEffect, useState } from "react"
import { useNav } from "@/krushika/nav"
import { useLang } from "@/krushika/i18n"
import { Leaf, Zap, CheckCircle2 } from "lucide-react"

export default function AIAnalysisScreen() {
  const { t } = useLang()
  const sf = t.x.scanFlow
  const STAGES = sf.ai.stages
  const { open, back } = useNav()
  const [stage, setStage] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (stage < STAGES.length - 1) {
      const t = setTimeout(() => setStage((s) => s + 1), 600 + Math.random() * 300)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setDone(true)
        setTimeout(() => open("diseaseResult"), 600)
      }, 700)
      return () => clearTimeout(t)
    }
  }, [stage])

  const pct = Math.round(((stage + (done ? 1 : 0)) / STAGES.length) * 100)

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2e0c] to-[#1b5e20] px-8">
      {/* Animated orb */}
      <div className="relative mb-10 flex h-36 w-36 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "1.8s" }} />
        <div className="absolute inset-4 rounded-full bg-white/15 animate-ping" style={{ animationDuration: "1.4s" }} />
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          {done ? (
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          ) : (
            <Leaf className="h-12 w-12 animate-pulse text-green-300" />
          )}
        </div>
      </div>

      <h2 className="mb-2 text-xl font-bold text-white">
        {done ? sf.common.analysisComplete : sf.ai.analysing}
      </h2>
      <p className="mb-8 text-center text-sm text-white/60">
        {done ? sf.common.preparingResults : STAGES[stage].sub}
      </p>

      {/* Progress bar */}
      <div className="mb-6 w-full max-w-xs">
        <div className="mb-1.5 flex justify-between text-xs text-white/50">
          <span>{done ? STAGES[STAGES.length - 1].label : STAGES[stage].label}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-green-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage checklist */}
      <div className="w-full max-w-xs space-y-2">
        {STAGES.map((s, i) => {
          const isDone = i < stage || done
          const isActive = i === stage && !done
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                isActive ? "bg-white/10" : ""
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                isDone ? "bg-green-400" : isActive ? "bg-white/30" : "bg-white/10"
              }`}>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : isActive ? (
                  <Zap className="h-3 w-3 animate-pulse text-white" />
                ) : null}
              </span>
              <span className={`text-xs ${isDone || isActive ? "text-white" : "text-white/30"}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Cancel */}
      <button
        onClick={back}
        className="mt-8 rounded-xl px-6 py-2.5 text-sm text-white/40 transition hover:text-white/70 active:scale-95"
      >
        {sf.common.cancel}
      </button>
    </div>
  )
}
