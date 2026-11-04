import { useState } from "react"
import { ChevronDown, ChevronUp, Phone, Globe, HelpCircle } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "@/krushika/components/DetailShell"

const CONTACTS = [
  { id: "tollFree" as const, value: "14447", icon: Phone },
  { id: "portal" as const, value: "pmfby.gov.in", icon: Globe },
  { id: "kisan" as const, value: "1800-180-1551", icon: Phone },
]

export default function InsuranceHelpScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const [open, setOpen] = useState<number | null>(null)

  return (
    <DetailShell title={ins.help} subtitle={x.help.subtitle}>
      {/* Quick contacts */}
      <div className="mb-5 rounded-2xl bg-green-50 p-4">
        <p className="mb-3 font-semibold text-green-800">{x.help.quickContacts}</p>
        <div className="space-y-2">
          {CONTACTS.map(({ id, value, icon: Icon }) => (
            <div key={id} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                <Icon className="h-4 w-4 text-green-600" />
              </span>
              <div>
                <p className="text-xs text-green-600">{x.help[id]}</p>
                <p className="font-semibold text-green-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ header */}
      <div className="mb-3 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-[#2f7d32]" />
        <h2 className="font-bold text-gray-800">{x.help.faqTitle}</h2>
      </div>

      {/* Accordion */}
      <div className="space-y-2">
        {x.help.faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen((prev) => (prev === i ? null : i))}
              className="flex w-full items-start gap-3 p-4 text-left"
            >
              <span className="mt-0.5 shrink-0 text-xs font-bold text-[#2f7d32]">{i + 1}.</span>
              <span className="flex-1 text-sm font-semibold text-gray-800 leading-snug">{faq.q}</span>
              {open === i ? (
                <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              ) : (
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              )}
            </button>
            {open === i && (
              <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs leading-relaxed text-gray-500">
          {x.help.disclaimer}
        </p>
      </div>
    </DetailShell>
  )
}
