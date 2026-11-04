import { CalendarDays, Bell, AlertTriangle } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import DetailShell from "@/krushika/components/DetailShell"

type Category = "enrolment" | "sowing" | "harvest" | "claim" | "payment"

const DATE_META: { urgent: boolean; category: Category }[] = [
  { urgent: true, category: "enrolment" },
  { urgent: false, category: "sowing" },
  { urgent: false, category: "harvest" },
  { urgent: true, category: "claim" },
  { urgent: false, category: "enrolment" },
  { urgent: false, category: "payment" },
]

const catColors: Record<Category, string> = {
  enrolment: "bg-green-50 text-green-600",
  sowing: "bg-blue-50 text-blue-600",
  harvest: "bg-amber-50 text-amber-600",
  claim: "bg-red-50 text-red-600",
  payment: "bg-purple-50 text-purple-600",
}

export default function ImportantDatesScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance

  return (
    <DetailShell title={ins.importantDates} subtitle={x.dates.subtitle}>
      {/* Urgent banner */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-red-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-800">{fmt(x.dates.bannerTitle, { date: x.dates.bannerDate })}</p>
          <p className="mt-0.5 text-xs text-red-600">{x.dates.bannerBody}</p>
        </div>
      </div>

      {/* Date cards */}
      <div className="space-y-3">
        {DATE_META.map((meta, i) => {
          const entry = { ...meta, ...x.dates.items[i] }
          return (
          <div key={i} className={`rounded-2xl border ${entry.urgent ? "border-red-200 bg-red-50/50" : "border-transparent bg-white shadow-sm"} p-4`}>
            <div className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${catColors[entry.category]}`}>
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{entry.label}</p>
                  {entry.urgent && (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">{x.dates.urgent}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-[#2f7d32]">{entry.date}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{entry.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColors[entry.category]}`}>
                    {x.dates.cats[entry.category]}
                  </span>
                  <button className="flex items-center gap-1 text-[11px] text-gray-400 transition active:text-[#2f7d32]">
                    <Bell className="h-3 w-3" />
                    {x.dates.addReminder}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {/* Note */}
      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs leading-relaxed text-gray-500">
          {x.dates.note}
        </p>
      </div>
    </DetailShell>
  )
}
