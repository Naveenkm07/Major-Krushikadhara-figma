import type { Tab } from "./BottomNav"
import { useLang, fmt } from "@/krushika/i18n"
import { useProfile } from "@/krushika/profile"
import { useNav, type Route } from "@/krushika/nav"
import {
  Languages,
  Bell,
  Sun,
  Droplets,
  RefreshCw,
  Camera,
  TrendingUp,
  CalendarDays,
  Tractor,
  ShieldCheck,
  Landmark,
  Leaf,
  Bug,
  ChevronRight,
  TrendingDown,
  Mic,
  Settings,
  Cloud,
  MapPin,
  AlertTriangle,
  BarChart3,
  Scan,
} from "lucide-react"

const QUICK_ACTIONS = [
  { label: "scanCrop", icon: Scan, bg: "bg-green-500", target: "scan" as Tab },
  { label: "govSchemes", icon: Landmark, bg: "bg-purple-500", target: "schemes" as Tab },
  { label: "farmInsights", icon: BarChart3, bg: "bg-blue-500", target: "insights" as Tab },
  { label: "market", icon: TrendingUp, bg: "bg-orange-500", route: "market" as Route },
] as const

const SECONDARY_ACTIONS = [
  { label: "insurance", icon: ShieldCheck, bg: "bg-teal-50", iconColor: "text-teal-600", route: "insurance" as Route },
  { label: "weather", icon: Cloud, bg: "bg-sky-50", iconColor: "text-sky-500", route: "weather" as Route },
  { label: "equipment", icon: Tractor, bg: "bg-amber-50", iconColor: "text-amber-600", route: "equipment" as Route },
  { label: "voiceAi", icon: Mic, bg: "bg-pink-50", iconColor: "text-pink-500", route: "voiceAssistant" as Route },
] as const

const RECENT_SCANS = [
  { crop: "Wheat", disease: "leafBlight", confidence: 78, status: "disease" as const, day: 25, month: "Sep" },
  { crop: "Rice", disease: "healthy", confidence: 91, status: "healthy" as const, day: 24, month: "Sep" },
  { crop: "Tomato", disease: "earlyBlight", confidence: 85, status: "disease" as const, day: 23, month: "Sep" },
] as const

const ALERTS = [
  { type: "disease", color: "border-l-red-500 bg-red-50", icon: Bug, iconColor: "text-red-500" },
  { type: "scheme", color: "border-l-purple-500 bg-purple-50", icon: Landmark, iconColor: "text-purple-500" },
  { type: "market", color: "border-l-blue-500 bg-blue-50", icon: TrendingUp, iconColor: "text-blue-500" },
] as const

type CropKey = "tomato" | "ragi" | "onion"
const marketPrices: { key: CropKey; price: number; change: number }[] = [
  { key: "tomato", price: 28, change: 4 },
  { key: "ragi", price: 42, change: 2 },
  { key: "onion", price: 19, change: -1 },
]

export default function HomeScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { t, toggle } = useLang()
  const { profile } = useProfile()
  const { open } = useNav()
  const h = t.x.coreA.home
  const cropName = (c: string) => (t.x.coreA.crops as Record<string, string>)[c] ?? c

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Header */}
        <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#1b5e20] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                {t.greeting} <span>🙏</span>
              </p>
              <h1 className="mt-0.5 text-xl font-bold leading-tight">{profile.name}</h1>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60">
                <MapPin className="h-3 w-3" /> {profile.district}, {profile.state}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button onClick={toggle} aria-label={h.languageAria} className="flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 text-xs font-semibold text-[#2f7d32] shadow-sm transition active:scale-95">
                <Languages className="h-3.5 w-3.5" /> {t.langLabel}
              </button>
              <button onClick={() => open("settings")} aria-label={h.settingsAria} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition active:scale-95">
                <Settings className="h-5 w-5" />
              </button>
              <button onClick={() => open("notifications")} aria-label={h.notificationsAria} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition active:scale-95">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-[#1b5e20]" />
              </button>
              <button onClick={() => onNavigate("profile")} aria-label={h.profileAria} className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/50 transition active:scale-95">
                <img src={profile.photoUrl.replace("w=160&h=160", "w=80&h=80")} alt={profile.name} className="h-full w-full object-cover" />
              </button>
            </div>
          </div>

          {/* Hero scan card */}
          <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-md">
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#2f7d32]">{h.aiCropDoctor}</p>
                <h2 className="mt-1 text-lg font-bold leading-tight text-gray-900">{h.checkCrop}</h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {h.scanDesc}
                </p>
                <button
                  onClick={() => onNavigate("scan")}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-[#2f7d32] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-green-700/30 transition active:scale-95"
                >
                  <Camera className="h-4 w-4" /> {h.scanNow}
                </button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=120&h=120&fit=crop&auto=format"
                alt={h.cropFieldAlt}
                className="h-28 w-28 shrink-0 rounded-2xl object-cover"
              />
            </div>
          </div>
        </header>

        {/* Quick actions 2×2 */}
        <section className="px-5 pt-5">
          <h2 className="text-base font-bold text-gray-800">{h.quickActions}</h2>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {(QUICK_ACTIONS as readonly { label: "scanCrop" | "govSchemes" | "farmInsights" | "market"; icon: typeof Scan; bg: string; target?: Tab; route?: Route }[]).map(({ label, icon: Icon, bg, target, route }) => (
              <button
                key={label}
                onClick={() => (target ? onNavigate(target) : route && open(route))}
                className="flex flex-col items-center gap-2 transition active:scale-95"
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bg} shadow-sm`}>
                  <Icon className="h-6 w-6 text-white" />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-gray-600 text-center">{h[label]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Secondary actions */}
        <section className="px-5 pt-4">
          <div className="grid grid-cols-4 gap-3">
            {SECONDARY_ACTIONS.map(({ label, icon: Icon, bg, iconColor, route }) => (
              <button
                key={label}
                onClick={() => open(route)}
                className="flex flex-col items-center gap-2 transition active:scale-95"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </span>
                <span className="text-[11px] font-medium leading-tight text-gray-500 text-center">{h[label]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* My Farm */}
        <section className="px-5 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">{h.myFarm}</h2>
            <button onClick={() => open("myFarm")} className="text-xs font-semibold text-[#2f7d32]">{h.edit}</button>
          </div>
          <button
            onClick={() => open("myFarm")}
            className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <Leaf className="h-7 w-7 text-[#2f7d32]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.district}, {profile.state}</p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                <span>{fmt(t.x.coreA.common.acresValue, { size: profile.farmSize })}</span>
                <span>·</span>
                <span>{profile.crops.slice(0, 3).map((c) => cropName(c)).join(", ")}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-200" />
          </button>
        </section>

        {/* Recent Activity */}
        <section className="px-5 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">{h.recentActivity}</h2>
            <button onClick={() => open("scanHistory")} className="text-xs font-semibold text-[#2f7d32]">{h.viewAll}</button>
          </div>
          <div className="space-y-2">
            {RECENT_SCANS.map((s, i) => (
              <button
                key={i}
                onClick={() => open("scanResult")}
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition active:scale-[0.99]"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.status === "healthy" ? "bg-green-50" : "bg-red-50"}`}>
                  {s.status === "healthy" ? <Leaf className="h-4.5 w-4.5 text-green-600" size={18} /> : <Bug className="h-4.5 w-4.5 text-red-500" size={18} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold text-gray-800">{h.scanCrops[s.crop]}</p>
                    <span className={`text-xs font-bold ${s.status === "healthy" ? "text-green-600" : "text-red-500"}`}>{s.confidence}%</span>
                  </div>
                  <p className={`text-xs ${s.status === "healthy" ? "text-green-600" : "text-red-400"}`}>{h.scanDiseases[s.disease]}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-300">{fmt(h.scanDate, { day: s.day, month: t.x.coreA.months[s.month] })}</span>
                  <ChevronRight className="h-4 w-4 text-gray-200" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Important Alerts */}
        <section className="px-5 pt-6 pb-2">
          <h2 className="mb-3 text-base font-bold text-gray-800">{h.importantAlerts}</h2>
          <div className="space-y-2">
            {ALERTS.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-2xl border-l-4 p-3 ${alert.color}`}>
                <alert.icon className={`mt-0.5 h-4 w-4 shrink-0 ${alert.iconColor}`} />
                <p className="text-sm text-gray-700">{h.alerts[alert.type]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Market quick prices */}
        <section className="px-5 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">{t.market.title}</h2>
            <button onClick={() => open("market")} className="text-xs font-semibold text-[#2f7d32]">{h.viewAll}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {marketPrices.map(({ key, price, change }) => {
              const up = change >= 0
              return (
                <button key={key} onClick={() => open("market")} className="min-w-[8rem] flex-1 rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.98]">
                  <p className="text-xs text-gray-400">{t.market.crops[key]}</p>
                  <p className="mt-1 text-xl font-bold text-gray-800">₹{price}<span className="text-xs font-medium text-gray-400">{t.market.perKg}</span></p>
                  <p className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
                    {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {Math.abs(change)}%
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* Floating voice AI button */}
      <button onClick={() => open("voiceAssistant")} aria-label={h.voiceAria} className="absolute bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#2f7d32] text-white shadow-lg shadow-green-800/40 transition active:scale-95">
        <Mic className="h-6 w-6" />
      </button>
    </>
  )
}
