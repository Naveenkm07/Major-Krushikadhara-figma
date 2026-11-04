import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Leaf,
  Repeat2,
  BookmarkPlus,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Sprout,
  FlaskConical,
} from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

const DEMO_RESULTS = [
  {
    crop: "Tomato",
    disease: "Early Blight",
    scientificName: "Alternaria solani",
    severity: "Moderate",
    confidence: 94,
    isHealthy: false,
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=400&fit=crop&auto=format",
    about: "Early blight is a common fungal disease affecting tomato plants. Dark concentric spots appear on older leaves, spreading upward under warm, humid conditions.",
    actions: [
      "Remove and destroy all affected leaves immediately.",
      "Apply copper-based fungicide (Bordeaux mixture) every 7–10 days.",
      "Avoid overhead irrigation; use drip irrigation instead.",
      "Ensure adequate plant spacing for airflow.",
    ],
    prevention: [
      "Rotate crops — avoid planting nightshades in the same bed for 2+ years.",
      "Use certified disease-free seed or resistant varieties.",
      "Mulch around plants to prevent soil splash.",
    ],
    products: [
      { name: "Mancozeb 75% WP", dose: "2.5 g/litre", frequency: "Every 10 days" },
      { name: "Copper Oxychloride", dose: "3 g/litre", frequency: "Every 7 days" },
    ],
  },
  {
    crop: "Rice",
    disease: "Healthy",
    scientificName: "",
    severity: "None",
    confidence: 97,
    isHealthy: true,
    image: "https://images.unsplash.com/photo-1536304993881-ff86e0c9d8db?w=600&h=400&fit=crop&auto=format",
    about: "Your rice plant appears healthy with no visible signs of disease, nutrient deficiency, or pest damage.",
    actions: [
      "Continue your current irrigation and fertilisation schedule.",
      "Monitor weekly for early signs of stem borer or leaf blast.",
      "Ensure adequate potassium application during the tillering stage.",
    ],
    prevention: [
      "Maintain proper water levels — avoid waterlogging.",
      "Apply zinc sulphate if yellowing appears.",
    ],
    products: [],
  },
]

export default function DiagnosisResultScreen() {
  const { t } = useLang()
  const { back, open, params } = useNav()
  const sr = t.pages.scanResult
  const sf = t.x.scanFlow
  const dg = sf.diag
  const tr = (m: Record<string, string>, k: string) => m[k] ?? k

  const resultIdx = (params.resultIdx as number | undefined) ?? 0
  const result = DEMO_RESULTS[resultIdx % DEMO_RESULTS.length]
  const loc = dg.results[resultIdx % DEMO_RESULTS.length]
  const cropName = tr(sf.names.crops, result.crop)
  const diseaseName = tr(sf.names.diseases, result.disease)
  const sevName = tr(sf.names.severity, result.severity)

  const [saved, setSaved] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [expandProducts, setExpandProducts] = useState(false)

  const severityColor = result.isHealthy
    ? "text-green-600 bg-green-50"
    : result.severity === "Moderate"
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50"

  return (
    <DetailShell title={sr.title} subtitle={`${cropName} · ${diseaseName}`}>
      {/* Hero image + result card */}
      <div className="relative mb-4 overflow-hidden rounded-3xl shadow-md">
        <img
          src={result.image}
          alt={cropName}
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-white/70">{cropName}</p>
              <h2 className="text-lg font-bold text-white">{diseaseName}</h2>
              {result.scientificName && (
                <p className="text-xs italic text-white/60">{result.scientificName}</p>
              )}
            </div>
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${severityColor}`}>
                {sevName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence + status */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-400">{sr.confidence}</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-800">{result.confidence}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#2f7d32] transition-all"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-400">{sr.status}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {result.isHealthy ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <span className={`font-semibold ${result.isHealthy ? "text-green-600" : "text-amber-700"}`}>
              {result.isHealthy ? dg.healthy : dg.issueFound}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">{dg.aiDemo}</p>
        </div>
      </div>

      {/* About */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-[#2f7d32]" />
          <h3 className="font-bold text-gray-800">{sr.about}</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">{loc.about}</p>
      </div>

      {/* Recommended actions */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sprout className="h-4 w-4 text-[#2f7d32]" />
          <h3 className="font-bold text-gray-800">{sr.actions}</h3>
        </div>
        <ol className="space-y-2.5">
          {loc.actions.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f7d32] text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {a}
            </li>
          ))}
        </ol>
      </div>

      {/* Pesticide products (if any) */}
      {result.products.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <button
            onClick={() => setExpandProducts((v) => !v)}
            className="flex w-full items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-gray-800">{dg.products}</span>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-gray-400 transition-transform ${expandProducts ? "rotate-90" : ""}`}
            />
          </button>
          {expandProducts && (
            <div className="border-t border-gray-50 px-4 pb-4">
              <p className="mb-3 text-[10px] text-amber-600">
                {dg.productNote}
              </p>
              {result.products.map((p) => (
                <div key={p.name} className="mb-2 rounded-xl bg-blue-50 p-3">
                  <p className="font-semibold text-blue-800">{p.name}</p>
                  <p className="text-xs text-blue-600">{fmt(dg.productLine, { dose: tr(dg.doses, p.dose), freq: tr(dg.freqs, p.frequency) })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prevention */}
      <div className="mb-4 rounded-2xl bg-green-50 p-4 shadow-sm">
        <h3 className="mb-2 font-bold text-green-800">{sr.prevention}</h3>
        <ul className="space-y-1.5">
          {loc.prevention.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-green-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">{dg.helpful}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setFeedback("up")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
              feedback === "up" ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-600"
            }`}
          >
            <ThumbsUp className="h-4 w-4" /> {dg.yes}
          </button>
          <button
            onClick={() => setFeedback("down")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
              feedback === "down" ? "bg-red-100 text-red-600" : "bg-gray-50 text-gray-600"
            }`}
          >
            <ThumbsDown className="h-4 w-4" /> {dg.no}
          </button>
        </div>
        {feedback && (
          <p className="mt-2 text-center text-xs text-gray-400">
            {feedback === "up" ? dg.thanksUp : dg.thanksDown}
          </p>
        )}
      </div>

      {/* CTA row */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => back()}
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95"
        >
          <Repeat2 className="h-5 w-5" />
          {sr.again}
        </button>
        <button
          onClick={() => setSaved(true)}
          className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold shadow-sm transition active:scale-95 ${
            saved ? "bg-green-50 text-green-700" : "bg-white text-gray-600"
          }`}
        >
          <BookmarkPlus className="h-5 w-5" />
          {saved ? sr.saved : sr.save}
        </button>
        <button
          onClick={() => open("scanHistory")}
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95"
        >
          <Share2 className="h-5 w-5" />
          {dg.history}
        </button>
      </div>
    </DetailShell>
  )
}
