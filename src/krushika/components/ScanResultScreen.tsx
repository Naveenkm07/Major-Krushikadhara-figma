import { useState } from "react"
import {
  AlertTriangle, CheckCircle2, ShieldCheck, RotateCcw,
  Bookmark, BookmarkCheck, ChevronLeft, Cpu,
  FlaskConical, Leaf, AlertCircle, TrendingDown,
} from "lucide-react"
import { useLang } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"

const CONFIDENCE = 92

const RESULT = {
  leaf: "Tomato Leaf",
  disease: "Early Blight",
  scientific: "Alternaria solani",
  severity: "Moderate" as const,
  affectedArea: "~35%",
  spread: "Moderate",
  img: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=450&fit=crop&auto=format",
  about:
    "Early Blight is a fungal disease caused by Alternaria solani. It appears as dark brown spots with concentric rings resembling a target, often surrounded by a yellow halo. It primarily affects older leaves first.",
  symptoms: [
    "Dark brown to black circular spots (3–10 mm)",
    "Concentric target-like ring pattern",
    "Yellow halo surrounding lesions",
    "Premature leaf drop from lower canopy",
    "Stem lesions near soil line (collar rot)",
  ],
  chemical: [
    "Mancozeb 75% WP @ 2.5 g/L water — spray every 7–10 days",
    "Chlorothalonil 75% WP @ 2 g/L water",
    "Copper oxychloride 50% WP @ 3 g/L water",
  ],
  organic: [
    "Neem oil 5 ml/L + 2 ml soap — apply at dusk",
    "Trichoderma viride bio-fungicide @ 5 g/L",
    "Bordeaux mixture 1% — traditional copper treatment",
  ],
  prevention: [
    "Practice 3-year crop rotation with non-Solanaceous crops",
    "Maintain 45–60 cm row spacing for airflow",
    "Water at base level, avoid wetting foliage",
    "Remove and burn infected plant debris after harvest",
    "Use certified disease-free seeds",
  ],
}

const SEV = {
  Low: { color: "text-green-700", bg: "bg-green-100" },
  Moderate: { color: "text-amber-700", bg: "bg-amber-100" },
  High: { color: "text-orange-700", bg: "bg-orange-100" },
  Critical: { color: "text-red-700", bg: "bg-red-100" },
} as const

type SectionKey = "symptoms" | "treatment" | "prevention"
const SECTIONS: SectionKey[] = ["symptoms", "treatment", "prevention"]

export default function ScanResultScreen() {
  const { t } = useLang()
  const sf = t.x.scanFlow
  const rs = sf.result
  const tr = (m: Record<string, string>, k: string) => m[k] ?? k
  const { back, open, params } = useNav()
  const [saved, setSaved] = useState(false)
  const [section, setSection] = useState<SectionKey>("symptoms")
  const [treatMode, setTreatMode] = useState<"chemical" | "organic">("chemical")

  // Use the image uploaded by the user if available, otherwise fall back to the demo image
  const heroImage =
    typeof params.imageUrl === "string" ? params.imageUrl : RESULT.img

  const sev = SEV[RESULT.severity]
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (CONFIDENCE / 100) * circ

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 220 }}>
          <img src={heroImage} alt={rs.scannedLeaf} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
          <button
            onClick={back}
            className="absolute left-4 top-[max(3rem,calc(env(safe-area-inset-top)+0.75rem))] flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition active:scale-90"
            aria-label={sf.common.backLabel}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className="absolute right-4 top-[max(3rem,calc(env(safe-area-inset-top)+0.75rem))] flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition active:scale-90"
            aria-label={rs.save}
          >
            {saved ? <BookmarkCheck className="h-5 w-5 text-green-300" /> : <Bookmark className="h-5 w-5" />}
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {rs.detected}
            </span>
            <h1 className="mt-1.5 text-2xl font-bold text-white">{tr(sf.names.diseases, RESULT.disease)}</h1>
            <p className="text-sm text-white/80">{tr(sf.names.crops, RESULT.leaf)} · <em>{RESULT.scientific}</em></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pt-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
              <svg className="-rotate-90" viewBox="0 0 100 100" width={80} height={80}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="#f0f0f0" strokeWidth="8" />
                <circle cx="50" cy="50" r={r} fill="none" stroke="#2f7d32" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
              </svg>
              <span className="absolute text-lg font-bold text-[#2f7d32]">{CONFIDENCE}%</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.pages.scanResult.confidence}</p>
              <p className="mt-0.5 text-sm font-bold text-gray-800">{rs.confHigh}</p>
              <p className="mt-1 text-[10px] text-gray-400">MobileNetV3</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">{rs.severity}</p>
            <span className={`mt-2 inline-block rounded-lg px-3 py-1.5 text-sm font-bold ${sev.bg} ${sev.color}`}>
              {tr(sf.names.severity, RESULT.severity)}
            </span>
            <div className="mt-2 grid grid-cols-2 gap-x-1">
              <p className="text-[10px] text-gray-400">{rs.affected}</p>
              <p className="text-[10px] font-semibold text-gray-600">{rs.affectedValue}</p>
              <p className="text-[10px] text-gray-400">{rs.spread}</p>
              <p className="text-[10px] font-semibold text-gray-600">{rs.spreadValue}</p>
            </div>
          </div>
        </div>

        <div className="mx-5 mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-bold text-gray-800">{t.pages.scanResult.about}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{rs.about}</p>
        </div>

        <div className="mt-4 px-5">
          <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
            {SECTIONS.map((s) => (
              <button key={s} onClick={() => setSection(s)}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${section === s ? "bg-white text-[#2f7d32] shadow-sm" : "text-gray-500"}`}
              >
                {rs.sections[s]}
              </button>
            ))}
          </div>
        </div>

        {section === "symptoms" && (
          <div className="mx-5 mt-3 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-gray-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" /> {rs.visibleSymptoms}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {rs.symptoms.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                  <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {section === "treatment" && (
          <div className="mx-5 mt-3 space-y-3">
            <div className="flex gap-2 rounded-2xl bg-gray-100 p-1">
              {(["chemical", "organic"] as const).map((mode) => (
                <button key={mode} onClick={() => setTreatMode(mode)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${treatMode === mode ? "bg-white text-[#2f7d32] shadow-sm" : "text-gray-500"}`}
                >
                  {mode === "chemical" ? <FlaskConical className="h-3.5 w-3.5" /> : <Leaf className="h-3.5 w-3.5" />}
                  {mode === "chemical" ? rs.chemical : rs.organic}
                </button>
              ))}
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <ul className="space-y-3">
                {(treatMode === "chemical" ? rs.chemicalItems : rs.organicItems).map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-[#2f7d32]">{i + 1}</span>
                    <span className="text-sm leading-relaxed text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              {treatMode === "chemical" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {rs.safety}
                </div>
              )}
            </div>
          </div>
        )}

        {section === "prevention" && (
          <div className="mx-5 mt-3 rounded-2xl bg-teal-50 p-4 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-teal-800">
              <ShieldCheck className="h-5 w-5 shrink-0 text-teal-600" /> {t.pages.scanResult.prevention}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {rs.prevention.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-teal-800/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mx-5 mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gray-800 py-3">
          <Cpu className="h-4 w-4 text-green-400" />
          <span className="text-xs font-medium text-white/80">{sf.common.modelBadgeFull}</span>
        </div>

        <div className="mt-3 flex gap-2 px-5">
          <button onClick={() => open("aiPredictions")} className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95">
            {rs.allPredictions}
          </button>
          <button onClick={() => open("howAiWorks")} className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95">
            {rs.howAiWorks}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button onClick={back} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition active:scale-95">
          <RotateCcw className="h-5 w-5" /> {t.pages.scanResult.again}
        </button>
        <button onClick={() => setSaved(true)} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition active:scale-95 ${saved ? "border border-green-200 bg-green-50 text-green-700" : "bg-[#2f7d32] text-white shadow-md shadow-green-600/30"}`}>
          {saved ? <><BookmarkCheck className="h-5 w-5" /> {rs.saved}</> : <><Bookmark className="h-5 w-5" /> {t.pages.scanResult.save}</>}
        </button>
      </div>
    </div>
  )
}
