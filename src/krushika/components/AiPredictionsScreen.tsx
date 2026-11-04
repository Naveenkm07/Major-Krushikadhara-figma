import { ChevronLeft, Cpu, Info } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang } from "@/krushika/i18n"

const PREDICTIONS = [
  { rank: 1, name: "Early Blight", scientific: "Alternaria solani", conf: 92, category: "Fungal", color: "#ef4444", severity: "Moderate" },
  { rank: 2, name: "Septoria Leaf Spot", scientific: "Septoria lycopersici", conf: 5, category: "Fungal", color: "#f97316", severity: "Moderate" },
  { rank: 3, name: "Late Blight", scientific: "Phytophthora infestans", conf: 1.8, category: "Oomycete", color: "#a855f7", severity: "High" },
  { rank: 4, name: "Tomato Mosaic Virus", scientific: "Tomato mosaic virus", conf: 0.7, category: "Viral", color: "#ec4899", severity: "High" },
  { rank: 5, name: "Healthy", scientific: "No pathogen detected", conf: 0.3, category: "—", color: "#22c55e", severity: "None" },
  { rank: 6, name: "Bacterial Spot", scientific: "Xanthomonas campestris", conf: 0.1, category: "Bacterial", color: "#3b82f6", severity: "Moderate" },
  { rank: 7, name: "Leaf Mold", scientific: "Passalora fulva", conf: 0.05, category: "Fungal", color: "#f59e0b", severity: "Low" },
  { rank: 8, name: "Spider Mite Damage", scientific: "Tetranychus urticae", conf: 0.03, category: "Pest", color: "#8b5cf6", severity: "Low" },
]

const SEV_COLOR: Record<string, string> = {
  None: "text-green-600 bg-green-50",
  Low: "text-teal-600 bg-teal-50",
  Moderate: "text-amber-600 bg-amber-50",
  High: "text-red-600 bg-red-50",
}

const CAT_COLOR: Record<string, string> = {
  Fungal: "bg-orange-100 text-orange-700",
  Oomycete: "bg-purple-100 text-purple-700",
  Viral: "bg-pink-100 text-pink-700",
  Bacterial: "bg-blue-100 text-blue-700",
  Pest: "bg-violet-100 text-violet-700",
  "—": "bg-green-100 text-green-700",
}

export default function AiPredictionsScreen() {
  const { t } = useLang()
  const sf = t.x.scanFlow
  const tr = (m: Record<string, string>, k: string) => m[k] ?? k
  const { back } = useNav()

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/80 transition active:opacity-70">
          {sf.common.back}
        </button>
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">{sf.pred.title}</h1>
            <p className="mt-0.5 text-sm text-white/80">{sf.pred.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-4">
        {/* Model info */}
        <div className="mx-5 mb-4 flex items-center gap-3 rounded-2xl bg-gray-800 p-3">
          <Cpu className="h-5 w-5 shrink-0 text-green-400" />
          <div>
            <p className="text-xs font-semibold text-white">{sf.pred.modelTitle}</p>
            <p className="text-[10px] text-white/60">{sf.pred.modelSub}</p>
          </div>
        </div>

        <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl bg-blue-50 p-3">
          <Info className="h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-700">
            {sf.pred.info}
          </p>
        </div>

        <div className="mx-5 space-y-2">
          {PREDICTIONS.map((p) => (
            <div
              key={p.name}
              className={`relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ${p.rank === 1 ? "ring-2 ring-[#2f7d32]" : ""}`}
            >
              {/* confidence fill bar */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 opacity-5"
                style={{ width: `${p.conf}%`, backgroundColor: p.color }}
              />

              <div className="relative flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-gray-800">{tr(sf.names.diseases, p.name)}</p>
                    <span className="shrink-0 text-base font-bold" style={{ color: p.color }}>
                      {p.conf}%
                    </span>
                  </div>
                  <p className="text-xs italic text-gray-400">{tr(sf.names.scientific, p.scientific)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${CAT_COLOR[p.category]}`}>
                      {tr(sf.names.categories, p.category)}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${SEV_COLOR[p.severity]}`}>
                      {tr(sf.names.severity, p.severity)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.conf}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              </div>

              {p.rank === 1 && (
                <span className="absolute right-3 top-3 rounded-full bg-[#2f7d32] px-2 py-0.5 text-[10px] font-bold text-white">
                  {sf.pred.topMatch}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-5 px-5 text-center text-[10px] text-gray-400">
          {sf.pred.footer}
        </p>
      </div>
    </div>
  )
}
