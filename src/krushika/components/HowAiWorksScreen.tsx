import { useState } from "react"
import { Brain, Camera, Cpu, Layers, Zap, ChevronDown, ChevronUp, Award } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang, fmt } from "@/krushika/i18n"

const STEPS = [
  {
    num: 1,
    icon: Camera,
    color: "bg-blue-500",
  },
  {
    num: 2,
    icon: Layers,
    color: "bg-purple-500",
  },
  {
    num: 3,
    icon: Brain,
    color: "bg-[#2f7d32]",
  },
  {
    num: 4,
    icon: Zap,
    color: "bg-amber-500",
  },
  {
    num: 5,
    icon: Award,
    color: "bg-teal-500",
  },
]

const STATS = ["87,848", "25", "10", "~94%", "PlantVillage", "3.2 MB"]

export default function HowAiWorksScreen() {
  const { back } = useNav()
  const { t } = useLang()
  const tx = t.x.info.howAi
  const [expanded, setExpanded] = useState<number | null>(null)

  function toggle(n: number) {
    setExpanded((prev) => (prev === n ? null : n))
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/80 transition active:opacity-70">
          {tx.back}
        </button>
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">{tx.title}</h1>
            <p className="mt-0.5 text-sm text-white/80">{tx.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-4 space-y-4 px-5">
        {/* Model callout */}
        <div className="rounded-2xl bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 shrink-0 text-green-400" />
            <div>
              <p className="font-bold text-white">MobileNetV3-Small</p>
              <p className="text-sm text-green-300">{tx.modelSub}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            {tx.modelDesc}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((s, si) => {
            const st = tx.steps[si]
            const isOpen = expanded === s.num
            return (
              <div key={s.num} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button
                  onClick={() => toggle(s.num)}
                  className="flex w-full items-center gap-3 p-4 text-left transition active:bg-gray-50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{fmt(tx.stepLabel, { n: s.num })}</p>
                    <p className="font-semibold text-gray-800">{st.title}</p>
                  </div>
                  {isOpen ? <ChevronUp className="h-5 w-5 shrink-0 text-gray-300" /> : <ChevronDown className="h-5 w-5 shrink-0 text-gray-300" />}
                </button>
                {isOpen && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-2">
                    <p className="text-sm leading-relaxed text-gray-600">{st.desc}</p>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs leading-relaxed text-gray-500">{st.detail}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats grid */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-bold text-gray-800">{tx.trainingData}</h2>
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((value, i) => (
              <div key={i} className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-base font-bold text-[#2f7d32]">{value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{tx.stats[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="rounded-2xl bg-amber-50 p-4">
          <h2 className="font-bold text-amber-800 mb-2">{tx.limitationsTitle}</h2>
          <ul className="space-y-2">
            {tx.limitations.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-[10px] text-gray-400 pb-2">
          {tx.footer}
        </p>
      </div>
    </div>
  )
}
