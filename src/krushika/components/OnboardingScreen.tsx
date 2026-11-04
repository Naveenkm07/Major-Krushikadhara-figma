import { useEffect, useState } from "react"
import { ChevronRight, Leaf, TrendingUp, Globe } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"

type Props = { onDone: () => void; initialIndex?: number; onStep?: (i: number) => void }

const slides = [
  {
    id: 0,
    icon: Leaf,
    iconBg: "bg-green-100",
    iconColor: "text-[#2f7d32]",
    img: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=500&fit=crop&auto=format",
    badgeColor: "bg-green-600",
    stat1: "25",
    stat2: "94%",
    stat3: "<2s",
  },
  {
    id: 1,
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=500&fit=crop&auto=format",
    badgeColor: "bg-blue-600",
    stat1: "8+",
    stat2: "daily",
    stat3: "PMFBY",
  },
  {
    id: 2,
    icon: Globe,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=500&fit=crop&auto=format",
    badgeColor: "bg-amber-500",
    stat1: "2",
    stat2: "offline",
    stat3: "100%",
  },
]

export default function OnboardingScreen({ onDone, initialIndex = 0, onStep }: Props) {
  const { t } = useLang()
  const [idx, setIdx] = useState(() => Math.min(Math.max(initialIndex, 0), slides.length - 1))
  useEffect(() => {
    onStep?.(idx)
  }, [idx, onStep])
  const slide = slides[idx]
  const txt = t.x.info.onboarding.slides[idx]
  const sv = t.x.info.onboarding.statValues
  const statText = (v: string) => (v === "daily" ? sv.daily : v === "offline" ? sv.offline : v)
  const isLast = idx === slides.length - 1

  function next() {
    if (isLast) onDone()
    else setIdx((i) => i + 1)
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Skip */}
      <div className="flex items-center justify-between px-5 pt-[max(3rem,calc(env(safe-area-inset-top)+1rem))]">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={fmt(t.x.info.onboarding.goToSlide, { n: i + 1 })}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-7 bg-[#2f7d32]" : "w-2 bg-gray-200"}`}
            />
          ))}
        </div>
        {!isLast && (
          <button onClick={onDone} className="text-sm font-medium text-gray-400">
            {t.x.info.onboarding.skip}
          </button>
        )}
      </div>

      {/* Image hero */}
      <div className="relative mx-5 mt-5 overflow-hidden rounded-3xl bg-gray-100" style={{ height: "38vh" }}>
        <img
          src={slide.img}
          alt={txt.title}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${slide.badgeColor}`}>
          {txt.badge}
        </span>
        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 flex divide-x divide-white/20 bg-black/40 backdrop-blur-sm">
          {[{ v: slide.stat1, l: txt.stat1 }, { v: slide.stat2, l: txt.stat2 }, { v: slide.stat3, l: txt.stat3 }].map(({ v, l }) => (
            <div key={l} className="flex flex-1 flex-col items-center py-2.5">
              <span className="text-base font-bold text-white">{statText(v)}</span>
              <span className="text-[10px] text-white/70">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-6 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.5rem))] pt-8">
        <div>
          <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${slide.iconBg}`}>
            <slide.icon className={`h-6 w-6 ${slide.iconColor}`} />
          </div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">{txt.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-gray-500">{txt.body}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={next}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-4 font-bold text-white shadow-lg shadow-green-700/30 transition active:scale-95"
          >
            {isLast ? t.x.info.onboarding.getStarted : t.x.info.onboarding.cont}
            <ChevronRight className="h-5 w-5" />
          </button>
          {isLast && (
            <p className="text-center text-xs text-gray-400">
              {t.x.info.onboarding.footer}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
