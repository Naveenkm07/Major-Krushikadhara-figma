import { useState } from "react"
import {
  Landmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Phone,
} from "lucide-react"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"
import { useLang, fmt } from "@/krushika/i18n"

// Indices of eligibility lines that describe ineligibility (shown in red)
const NEGATIVE_ELIGIBILITY: Record<string, number[]> = { pmkisan: [2, 3] }

const SCHEME_DATA: Record<string, {
  color: string
  helpline: string
  portalUrl: string
}> = {
  pmkisan: {
    color: "from-purple-600 to-purple-800",
    helpline: "155261 / 1800-115-526",
    portalUrl: "pmkisan.gov.in",
  },
  pmfby: {
    color: "from-teal-600 to-teal-800",
    helpline: "14447 / 1800-180-1551",
    portalUrl: "pmfby.gov.in",
  },
  kcc: {
    color: "from-orange-600 to-orange-800",
    helpline: "1800-11-4000 (NABARD)",
    portalUrl: "nabard.org",
  },
}

const DEFAULT_SCHEME = SCHEME_DATA.pmkisan

export default function SchemeDetailScreen() {
  const { params, open } = useNav()
  const schemeId = (params.schemeId as string | undefined) ?? "pmkisan"
  const { t } = useLang()
  const tx = t.x.info.scheme
  const scheme = SCHEME_DATA[schemeId] ?? DEFAULT_SCHEME
  const resolvedId = SCHEME_DATA[schemeId] ? schemeId : "pmkisan"
  const txt = tx.items[resolvedId as keyof typeof tx.items]
  const negIdx = NEGATIVE_ELIGIBILITY[resolvedId] ?? []
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <DetailShell title={tx.title} subtitle={txt.name}>
      {/* Hero band */}
      <div className={`mb-4 rounded-3xl bg-gradient-to-br ${scheme.color} p-5 text-white shadow-lg`}>
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Landmark className="h-6 w-6 text-white" />
          </span>
          <div>
            <p className="font-bold leading-tight">{txt.name}</p>
            <p className="mt-1 text-xs text-white/70">{txt.ministry}</p>
            <p className="text-xs text-white/60">{fmt(tx.launched, { date: txt.launched })}</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-white/15 p-3">
          <p className="text-xs text-white/70">{tx.benefit}</p>
          <p className="text-xl font-bold">{txt.benefitAmount}</p>
          <p className="text-xs text-white/70">{txt.benefit}</p>
        </div>
        <p className="mt-2 text-[10px] text-white/40">
          {tx.demoNote}
        </p>
      </div>

      {/* Eligibility */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{tx.eligibility}</h2>
        <div className="space-y-2">
          {txt.eligibility.map((e, i) => (
            <div key={i} className={`flex gap-2 text-sm ${negIdx.includes(i) ? "text-red-600" : "text-gray-700"}`}>
              <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${negIdx.includes(i) ? "text-red-400" : "text-green-500"}`} />
              {e}
            </div>
          ))}
        </div>
      </div>

      {/* How to apply */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{tx.howToApply}</h2>
        <ol className="space-y-3">
          {txt.howToApply.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f7d32] text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Documents needed */}
      <div className="mb-4 rounded-2xl bg-blue-50 p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-blue-800">{tx.documents}</h2>
        <div className="flex flex-wrap gap-2">
          {txt.documents.map((doc) => (
            <span
              key={doc}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm"
            >
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Helpline + portal */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <a
          href={`tel:${scheme.helpline.split(" ")[0]}`}
          className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-sm transition active:scale-95"
        >
          <Phone className="h-5 w-5 text-[#2f7d32]" />
          <p className="text-center text-xs font-semibold text-gray-700">{tx.helpline}</p>
          <p className="text-center text-[10px] text-gray-400">{scheme.helpline}</p>
        </a>
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <ExternalLink className="h-5 w-5 text-blue-500" />
          <p className="text-center text-xs font-semibold text-gray-700">{tx.portal}</p>
          <p className="text-center text-[10px] text-blue-500">{scheme.portalUrl}</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{tx.faqs}</h2>
        <div className="space-y-2">
          {txt.faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-gray-100">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                {expandedFaq === i ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                )}
              </button>
              {expandedFaq === i && (
                <div className="border-t border-gray-50 px-3 pb-3">
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Apply CTA */}
      <button
        onClick={() => open("help")}
        className="w-full rounded-2xl bg-[#2f7d32] py-4 text-center text-base font-bold text-white shadow-lg shadow-green-600/20 transition active:scale-95"
      >
        {tx.applyBtn}
      </button>
      <p className="mt-2 text-center text-[10px] text-gray-400">
        {tx.applyNote}
      </p>
    </DetailShell>
  )
}
