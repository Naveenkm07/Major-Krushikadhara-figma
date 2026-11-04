import { useState } from "react"
import { ChevronDown, ChevronUp, Shield, Leaf, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

const SECTIONS = [
  { id: "what" as const, icon: Shield, iconColor: "text-green-600 bg-green-50" },
  { id: "coverage" as const, icon: Leaf, iconColor: "text-blue-600 bg-blue-50" },
  { id: "premium" as const, icon: AlertTriangle, iconColor: "text-orange-600 bg-orange-50" },
  { id: "steps" as const, icon: CheckCircle2, iconColor: "text-purple-600 bg-purple-50" },
]

export default function InsurancePlanScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { open } = useNav()
  const [expanded, setExpanded] = useState<string | null>("what")

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <DetailShell title={x.plan.title} subtitle={ins.subtitle}>
      {/* Hero */}
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#2f7d32] to-[#256428] p-5 text-white">
        <Shield className="mb-2 h-8 w-8 text-white/80" />
        <p className="text-lg font-bold">Pradhan Mantri Fasal Bima Yojana</p>
        <p className="mt-1 text-sm text-white/70">{x.plan.heroBody}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white/10 p-3">
          <div className="text-center">
            <p className="text-xs text-white/60">{x.plan.kharif}</p>
            <p className="font-bold">2%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60">{x.plan.rabi}</p>
            <p className="font-bold">1.5%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60">{x.plan.commercial}</p>
            <p className="font-bold">5%</p>
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="mb-5 space-y-3">
        {SECTIONS.map(({ id, icon: Icon, iconColor }) => {
          const sec = x.plan[id]
          const title = sec.title
          const content = "content" in sec ? sec.content : undefined
          const items = "items" in sec ? sec.items : undefined
          return (
          <div key={id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 font-semibold text-gray-800 text-sm">{title}</span>
              {expanded === id ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expanded === id && (
              <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                {content && <p className="text-sm leading-relaxed text-gray-600">{content}</p>}
                {items && (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7d32]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          )
        })}
      </div>

      {/* Documents needed */}
      <div className="mb-5 rounded-2xl bg-amber-50 p-4">
        <p className="mb-2 font-semibold text-amber-800">{x.plan.docsRequired}</p>
        {x.plan.docsList.map((doc) => (
          <div key={doc} className="flex items-center gap-2 py-1.5 text-sm text-amber-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
            {doc}
          </div>
        ))}
      </div>

      <button
        onClick={() => open("insuranceApplication")}
        className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
      >
        {ins.applyNow}
      </button>
    </DetailShell>
  )
}
