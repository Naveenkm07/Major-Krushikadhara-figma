import { Cpu, Database, Layers, Smartphone, ArrowDown, ArrowRight, Wifi, WifiOff, CheckCircle2 } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang } from "@/krushika/i18n"

const STACK_COLORS = ["bg-blue-500", "bg-cyan-500", "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-green-600"]

const PIPELINE = [
  {
    step: 1,
    color: "border-blue-400 bg-blue-50",
    headerColor: "bg-blue-500",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    step: 2,
    color: "border-purple-400 bg-purple-50",
    headerColor: "bg-purple-500",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    step: 3,
    color: "border-green-400 bg-green-50",
    headerColor: "bg-[#2f7d32]",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    step: 4,
    color: "border-amber-400 bg-amber-50",
    headerColor: "bg-amber-500",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    step: 5,
    color: "border-teal-400 bg-teal-50",
    headerColor: "bg-teal-600",
    badgeColor: "bg-teal-100 text-teal-700",
  },
]

export default function TechnicalArchScreen() {
  const { back } = useNav()
  const { t } = useLang()
  const tx = t.x.info.arch

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-gray-900 to-gray-800 px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/70 transition active:opacity-70">
          {tx.back}
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
            <Cpu className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{tx.title}</h1>
            <p className="mt-0.5 text-sm text-white/60">{tx.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-4">
        {/* Offline badge */}
        <div className="mx-5 mb-4 flex items-center gap-3 rounded-2xl bg-green-800 p-3">
          <WifiOff className="h-5 w-5 shrink-0 text-green-300" />
          <div>
            <p className="text-sm font-semibold text-white">{tx.onDeviceTitle}</p>
            <p className="text-xs text-green-300/80">{tx.onDeviceDesc}</p>
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="mx-5 space-y-3">
          {PIPELINE.map((p, i) => (
            <div key={p.step}>
              <div className={`rounded-2xl border ${p.color} overflow-hidden shadow-sm`}>
                <div className={`flex items-center gap-3 px-4 py-2.5 ${p.headerColor}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs font-bold text-white">
                    {p.step}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/80">{tx.pipeline[i].phase}</p>
                    <p className="text-sm font-bold text-white">{tx.pipeline[i].title}</p>
                  </div>
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold ${p.badgeColor}`}>
                    {tx.pipeline[i].badge}
                  </span>
                </div>
                <ul className="space-y-1.5 px-4 py-3">
                  {tx.pipeline[i].items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Spec table */}
        <div className="mx-5 mt-5 rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="bg-gray-800 px-4 py-3">
            <p className="flex items-center gap-2 font-bold text-white">
              <Layers className="h-4 w-4 text-green-400" /> {tx.specsTitle}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {tx.specs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* App layer stack */}
        <div className="mx-5 mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
            <Smartphone className="h-5 w-5 text-[#2f7d32]" /> {tx.stackTitle}
          </h2>
          {STACK_COLORS.map((color, ci) => {
            const { label, value } = tx.stack[ci]
            return (
            <div key={label} className="flex items-center gap-3 py-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
              <span className="min-w-0 flex-1 text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-700">{value}</span>
            </div>
            )
          })}
        </div>

        {/* Data flow */}
        <div className="mx-5 mt-4 rounded-2xl bg-gray-900 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
            <Database className="h-4 w-4 text-green-400" /> {tx.privacyTitle}
          </h2>
          <div className="flex items-center gap-2 text-sm text-green-300">
            <WifiOff className="h-4 w-4 shrink-0" />
            {tx.privacy1}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-300">
            <Wifi className="h-4 w-4 shrink-0" />
            {tx.privacy2}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-300">
            <Database className="h-4 w-4 shrink-0" />
            {tx.privacy3}
          </div>
        </div>

        <p className="mt-5 px-5 text-center text-[10px] text-gray-400">
          {tx.footer}
        </p>
      </div>
    </div>
  )
}
