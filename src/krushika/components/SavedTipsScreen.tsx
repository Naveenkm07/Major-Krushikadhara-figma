import { Droplets, Leaf, Bug, Bookmark } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

const meta = [
  { icon: Droplets, bg: "bg-blue-50", color: "text-blue-500" },
  { icon: Leaf, bg: "bg-green-50", color: "text-green-600" },
  { icon: Bug, bg: "bg-orange-50", color: "text-orange-500" },
]

export default function SavedTipsScreen() {
  const { t } = useLang()

  return (
    <DetailShell title={t.pages.saved.title} subtitle={t.pages.saved.subtitle}>
      <div className="space-y-3">
        {t.tips.items.map((tip, i) => {
          const m = meta[i % meta.length]
          return (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">{tip.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-gray-500">{tip.body}</p>
              </div>
              <Bookmark className="h-5 w-5 shrink-0 fill-[#2f7d32] text-[#2f7d32]" />
            </div>
          )
        })}
      </div>
    </DetailShell>
  )
}
