import { AlertTriangle, Camera, ChevronRight, HelpCircle, Lightbulb, RotateCcw } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang, fmt } from "@/krushika/i18n"

const PREDICTIONS = [
  { name: "Early Blight", scientific: "Alternaria solani", conf: 42, color: "bg-amber-400" },
  { name: "Septoria Leaf Spot", scientific: "Septoria lycopersici", conf: 31, color: "bg-orange-300" },
  { name: "Healthy Leaf", scientific: "No pathogen detected", conf: 18, color: "bg-green-400" },
]

export default function LowConfidenceScreen() {
  const { t } = useLang()
  const sf = t.x.scanFlow
  const TIPS = sf.low.tips
  const { back, open } = useNav()
  const tr = (m: Record<string, string>, k: string) => m[k] ?? k

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-b from-amber-600 to-amber-700 px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/80 transition active:opacity-70">
          {sf.common.back}
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{sf.low.title}</h1>
            <p className="mt-0.5 text-sm text-white/80">{sf.low.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-5 space-y-4 px-5">
        {/* Confidence indicator */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{sf.low.uncertain}</p>
              <p className="text-sm text-gray-500"><strong className="text-amber-600">{fmt(sf.low.bestMatch, { pct: 42 })}</strong></p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[42%] rounded-full bg-amber-400" />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {sf.low.requires}
          </p>
        </div>

        {/* Top predictions */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">{sf.low.possible}</h2>
            <button onClick={() => open("aiPredictions")} className="text-xs font-semibold text-[#2f7d32]">
              {sf.low.seeAll}
            </button>
          </div>
          <div className="space-y-3">
            {PREDICTIONS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{tr(sf.names.diseases, p.name)}</p>
                    <span className="shrink-0 text-sm font-bold text-gray-600">{p.conf}%</span>
                  </div>
                  <p className="text-xs italic text-gray-400">{tr(sf.names.scientific, p.scientific)}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.conf}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-blue-50 p-4">
          <h2 className="flex items-center gap-2 font-bold text-blue-800">
            <Lightbulb className="h-5 w-5 shrink-0 text-blue-500" /> {sf.low.tipsTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-blue-800/90">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* See all predictions */}
        <button
          onClick={() => open("aiPredictions")}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <div>
            <p className="font-semibold text-gray-800">{sf.low.viewAll}</p>
            <p className="text-sm text-gray-400">{sf.low.viewAllSub}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-100 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          onClick={back}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition active:scale-95"
        >
          <RotateCcw className="h-5 w-5" /> {sf.common.tryAgain}
        </button>
        <button
          onClick={back}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
        >
          <Camera className="h-5 w-5" /> {sf.common.rescan}
        </button>
      </div>
    </div>
  )
}
