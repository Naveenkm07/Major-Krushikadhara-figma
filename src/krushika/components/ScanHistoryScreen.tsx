import { useState } from "react"
import { Bug, Leaf, ScanLine, ChevronRight, Calendar, Filter } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang, fmt } from "@/krushika/i18n"

type HistoryItem = {
  id: number
  crop: string
  disease: string
  status: "disease" | "healthy" | "low_conf"
  confidence: number
  date: string
  time: string
  img: string
  mode: "pest" | "crop" | "leaf"
}

const HISTORY: HistoryItem[] = [
  { id: 1, crop: "Tomato", disease: "Early Blight", status: "disease", confidence: 92, date: "Sep 25, 2026", time: "10:42 AM", img: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=80&h=80&fit=crop&auto=format", mode: "pest" },
  { id: 2, crop: "Rice", disease: "Healthy — No disease", status: "healthy", confidence: 97, date: "Sep 24, 2026", time: "3:15 PM", img: "https://images.unsplash.com/photo-1536304993881-ff86e0c1e9c8?w=80&h=80&fit=crop&auto=format", mode: "leaf" },
  { id: 3, crop: "Potato", disease: "Late Blight (uncertain)", status: "low_conf", confidence: 48, date: "Sep 23, 2026", time: "11:00 AM", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=80&h=80&fit=crop&auto=format", mode: "pest" },
  { id: 4, crop: "Maize", disease: "Northern Leaf Blight", status: "disease", confidence: 88, date: "Sep 22, 2026", time: "8:30 AM", img: "https://images.unsplash.com/photo-1556801072-6e7f3f71fca0?w=80&h=80&fit=crop&auto=format", mode: "pest" },
  { id: 5, crop: "Grape", disease: "Healthy — No disease", status: "healthy", confidence: 99, date: "Sep 21, 2026", time: "4:50 PM", img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=80&h=80&fit=crop&auto=format", mode: "leaf" },
  { id: 6, crop: "Tomato", disease: "Septoria Leaf Spot", status: "disease", confidence: 81, date: "Sep 20, 2026", time: "9:05 AM", img: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=80&h=80&fit=crop&auto=format", mode: "pest" },
  { id: 7, crop: "Apple", disease: "Apple Scab", status: "disease", confidence: 76, date: "Sep 19, 2026", time: "2:20 PM", img: "https://images.unsplash.com/photo-1569870499705-504209102861?w=80&h=80&fit=crop&auto=format", mode: "pest" },
]

const FILTER_OPTIONS = ["All", "Disease", "Healthy", "Uncertain"] as const
type FilterKey = (typeof FILTER_OPTIONS)[number]

export default function ScanHistoryScreen() {
  const { t } = useLang()
  const sf = t.x.scanFlow
  const tr = (m: Record<string, string>, k: string) => m[k] ?? k
  const fmtDate = (d: string) => {
    const m = d.match(/^(\w{3}) (\d+), (\d+)$/)
    return m ? fmt(sf.dates.dateTemplate, { month: tr(sf.dates.months, m[1]), day: m[2], year: m[3] }) : d
  }
  const fmtTime = (tm: string) => {
    const m = tm.match(/^([\d:]+) (AM|PM)$/)
    return m ? fmt(sf.dates.timeTemplate, { time: m[1], ampm: m[2] === "AM" ? sf.dates.am : sf.dates.pm }) : tm
  }
  const { back, open } = useNav()
  const [filter, setFilter] = useState<FilterKey>("All")

  const filtered = HISTORY.filter((h) => {
    if (filter === "All") return true
    if (filter === "Disease") return h.status === "disease"
    if (filter === "Healthy") return h.status === "healthy"
    if (filter === "Uncertain") return h.status === "low_conf"
    return true
  })

  const diseaseCount = HISTORY.filter((h) => h.status === "disease").length
  const healthyCount = HISTORY.filter((h) => h.status === "healthy").length

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/80 transition active:opacity-70">
          {sf.common.back}
        </button>
        <div className="flex items-center gap-2">
          <ScanLine className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{sf.hist.title}</h1>
        </div>
        <p className="mt-1 text-sm text-white/80">{fmt(sf.hist.summary, { count: HISTORY.length })}</p>

        {/* Stats pills */}
        <div className="mt-4 flex gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-red-500/30 px-3 py-1.5">
            <Bug className="h-3.5 w-3.5 text-red-200" />
            <span className="text-xs font-semibold text-white">{fmt(sf.hist.diseases, { count: diseaseCount })}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/30 px-3 py-1.5">
            <Leaf className="h-3.5 w-3.5 text-green-200" />
            <span className="text-xs font-semibold text-white">{fmt(sf.hist.healthy, { count: healthyCount })}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-4">
        {/* Filter bar */}
        <div className="px-5 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filter === f
                    ? "bg-[#2f7d32] text-white"
                    : "bg-white text-gray-500 shadow-sm border border-gray-100"
                }`}
              >
                {sf.hist.filters[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 px-5">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => open("scanResult")}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
            >
              {/* Thumbnail */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img src={item.img} alt={tr(sf.names.crops, item.crop)} className="h-full w-full object-cover" />
                <div
                  className={`absolute bottom-0 left-0 right-0 flex h-4 items-center justify-center text-[9px] font-bold text-white ${
                    item.status === "disease" ? "bg-red-500" : item.status === "healthy" ? "bg-green-500" : "bg-amber-500"
                  }`}
                >
                  {item.status === "disease" ? sf.hist.badgeDisease : item.status === "healthy" ? sf.hist.badgeHealthy : sf.hist.badgeUnsure}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-gray-800">{tr(sf.names.crops, item.crop)}</p>
                  <span
                    className={`shrink-0 text-xs font-bold ${
                      item.confidence >= 80 ? "text-green-600" : item.confidence >= 55 ? "text-amber-600" : "text-red-500"
                    }`}
                  >
                    {item.confidence}%
                  </span>
                </div>
                <p
                  className={`mt-0.5 text-sm ${
                    item.status === "disease" ? "text-red-500" : item.status === "healthy" ? "text-green-600" : "text-amber-500"
                  }`}
                >
                  {tr(sf.names.diseases, item.disease)}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-300" />
                  <span className="text-[10px] text-gray-400">{fmtDate(item.date)} · {fmtTime(item.time)}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-400">{t.scan.modes[item.mode]}</span>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-gray-200" />
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-10">
            <Filter className="h-12 w-12 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-400">{sf.hist.emptyTitle}</p>
            <p className="text-sm text-gray-300 mt-1">{sf.hist.emptySub}</p>
          </div>
        )}

        <p className="mt-5 text-center text-[10px] text-gray-400">
          {sf.hist.demoNote}
        </p>
      </div>
    </div>
  )
}
