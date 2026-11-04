import { useState } from "react"
import { Phone, MessageCircle, Flag, ChevronDown } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

export default function HelpSupportScreen() {
  const { t } = useLang()
  const p = t.pages.help
  const [open, setOpen] = useState<number | null>(0)

  const actions = [
    { icon: Phone, bg: "bg-green-100", color: "text-[#2f7d32]", title: p.call, hint: p.callHint },
    { icon: MessageCircle, bg: "bg-blue-100", color: "text-blue-500", title: p.chat, hint: p.chatHint },
    { icon: Flag, bg: "bg-orange-100", color: "text-orange-500", title: p.report, hint: p.reportHint },
  ]

  return (
    <DetailShell title={p.title} subtitle={p.subtitle}>
      <div className="space-y-3">
        {actions.map((a) => (
          <button
            key={a.title}
            className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full ${a.bg}`}>
              <a.icon className={`h-5 w-5 ${a.color}`} />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{a.title}</p>
              <p className="text-sm text-gray-400">{a.hint}</p>
            </div>
          </button>
        ))}
      </div>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-gray-500">{p.faq}</h2>
      <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {p.faqs.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex-1 font-medium text-gray-800">{f.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {open === i && (
              <p className="px-4 pb-4 text-sm leading-relaxed text-gray-500">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </DetailShell>
  )
}
