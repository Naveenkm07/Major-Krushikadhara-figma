import { useEffect, useRef } from "react"
import { Check, Globe, Languages, Sprout } from "lucide-react"
import { useLang, type Lang } from "@/krushika/i18n"

const options: {
  id: Lang
  label: string
  action: string
  icon: typeof Globe
  kannada: boolean
}[] = [
  { id: "kn", label: "ಕನ್ನಡ", action: "ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ", icon: Languages, kannada: true },
  { id: "en", label: "English", action: "Continue in English", icon: Globe, kannada: false },
]

export default function LanguageSelectScreen({ onDone }: { onDone: () => void }) {
  const { lang, setLang } = useLang()
  const chosen = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function choose(id: Lang) {
    if (chosen.current) return
    chosen.current = true
    setLang(id)
    timer.current = setTimeout(onDone, 350)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#f7f8ec] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(4rem,calc(env(safe-area-inset-top)+2rem))]">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3a9d3e] to-[#256428] shadow-lg shadow-green-900/20">
          <Sprout className="h-10 w-10 text-white" />
        </div>

        <h1 className="font-kannada mt-6 text-center text-3xl font-extrabold leading-snug text-[#256428]">
          ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ
        </h1>
        <p className="mt-2 text-center text-xl font-semibold text-[#256428]">Choose Your Language</p>
        <p className="font-kannada mt-4 text-center text-sm leading-relaxed text-gray-600">
          ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.
        </p>
        <p className="mt-1 text-center text-sm text-gray-600">
          Select your preferred language to continue.
        </p>

        <div className="mt-8 space-y-4" role="radiogroup" aria-label="Language / ಭಾಷೆ">
          {options.map((o) => {
            const active = chosen.current && lang === o.id
            const Icon = o.icon
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={active}
                onClick={() => choose(o.id)}
                className={`flex min-h-24 w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-md shadow-green-900/5 transition active:scale-[0.98] ${
                  active ? "ring-2 ring-[#2f7d32]" : "ring-1 ring-gray-100"
                }`}
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    active ? "bg-[#2f7d32] text-white" : "bg-green-50 text-[#2f7d32]"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-2xl font-bold text-gray-900 ${o.kannada ? "font-kannada" : ""}`}>
                    {o.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-base leading-snug text-gray-600 ${o.kannada ? "font-kannada" : ""}`}
                  >
                    {o.action}
                  </span>
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-[#2f7d32] bg-[#2f7d32]" : "border-gray-300"
                  }`}
                >
                  {active && <Check className="h-5 w-5 text-white" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
