import { Sprout, Droplets, FlaskConical, Scissors, Wheat } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

type StageKey = "sowing" | "growing" | "irrigation" | "fertilizer" | "harvest"

const meta: Record<StageKey, { icon: typeof Sprout; color: string; bg: string }> = {
  sowing: { icon: Sprout, color: "text-green-600", bg: "bg-green-100" },
  growing: { icon: Wheat, color: "text-teal-600", bg: "bg-teal-100" },
  irrigation: { icon: Droplets, color: "text-blue-500", bg: "bg-blue-100" },
  fertilizer: { icon: FlaskConical, color: "text-orange-500", bg: "bg-orange-100" },
  harvest: { icon: Scissors, color: "text-purple-500", bg: "bg-purple-100" },
}

const timeline: { key: StageKey; current?: boolean; done?: boolean }[] = [
  { key: "sowing", done: true },
  { key: "growing", current: true },
  { key: "irrigation" },
  { key: "fertilizer" },
  { key: "harvest" },
]

export default function CropCalendarScreen() {
  const { t } = useLang()
  const x = t.x.coreB.calendar

  return (
    <DetailShell title={t.pages.calendar.title} subtitle={t.pages.calendar.subtitle}>
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#2f7d32] to-[#256428] p-4 text-white shadow-md">
        <p className="text-xs text-white/75">{t.pages.calendar.current}</p>
        <p className="mt-0.5 text-lg font-bold">{x.cropName}</p>
        <p className="mt-1 text-sm text-white/85">
          {t.pages.calendar.stages.growing} · {x.growingRange}
        </p>
      </div>

      <div className="relative pl-2">
        <span className="absolute bottom-4 left-[1.4rem] top-4 w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {timeline.map((stage) => {
            const m = meta[stage.key]
            return (
              <div key={stage.key} className="relative flex gap-4">
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${m.bg} ${
                    stage.current ? "ring-4 ring-green-200" : ""
                  }`}
                >
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </span>
                <div
                  className={`flex-1 rounded-2xl bg-white p-4 shadow-sm ${
                    stage.current ? "ring-1 ring-green-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{t.pages.calendar.stages[stage.key]}</p>
                    {stage.done && <span className="text-xs font-semibold text-green-600">✓</span>}
                    {stage.current && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-[#2f7d32]">
                        {t.pages.calendar.current}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{x.periods[stage.key]}</p>
                  {stage.key in x.notes && (
                    <p className="mt-0.5 text-xs font-medium text-orange-500">
                      {x.notes[stage.key as keyof typeof x.notes]}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DetailShell>
  )
}
