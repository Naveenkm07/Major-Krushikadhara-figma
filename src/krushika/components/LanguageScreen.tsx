import { Check } from "lucide-react"
import { useLang, type Lang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

export default function LanguageScreen() {
  const { t, lang, setLang } = useLang()
  const p = t.pages.language

  const options: { id: Lang; label: string; sub: string }[] = [
    { id: "en", label: p.english, sub: p.englishSub },
    { id: "kn", label: p.kannada, sub: p.kannadaSub },
  ]

  return (
    <DetailShell title={p.title} subtitle={p.subtitle}>
      <div className="space-y-3">
        {options.map((o) => {
          const active = lang === o.id
          return (
            <button
              key={o.id}
              onClick={() => setLang(o.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left shadow-sm transition active:scale-[0.99] ${
                active ? "bg-white ring-2 ring-[#2f7d32]" : "bg-white"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${
                  active ? "bg-green-100 text-[#2f7d32]" : "bg-gray-100 text-gray-500"
                } ${o.id === "kn" ? "font-kannada" : ""}`}
              >
                {o.id === "kn" ? "ಅ" : "A"}
              </span>
              <div className="flex-1">
                <p className={`font-semibold text-gray-800 ${o.id === "kn" ? "font-kannada" : ""}`}>
                  {o.label}
                </p>
                <p className="text-sm text-gray-400">{o.sub}</p>
              </div>
              {active && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7d32]">
                  <Check className="h-4 w-4 text-white" />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">{p.note}</p>
    </DetailShell>
  )
}
