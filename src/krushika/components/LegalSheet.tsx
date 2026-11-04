import { X } from "lucide-react"
import { useLang } from "@/krushika/i18n"

export type LegalDoc = "terms" | "privacy"

export default function LegalSheet({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const { t } = useLang()
  const L = t.x.login
  const d = doc === "terms" ? L.terms : L.privacy

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={d.title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl bg-[#f7f8ec] shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-xl font-bold text-[#256428]">{d.title}</h2>
          <button
            onClick={onClose}
            aria-label={L.close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto px-5 pb-4">
          <p className="text-xs text-gray-400">{L.legalUpdated}</p>
          {d.sections.map((s) => (
            <div key={s.h} className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800">{s.h}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.p}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-900/20 active:scale-[0.98]"
          >
            {L.close}
          </button>
        </div>
      </div>
    </div>
  )
}
