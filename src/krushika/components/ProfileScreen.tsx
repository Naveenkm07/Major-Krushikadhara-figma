import { useState } from "react"
import { useLang, fmt } from "@/krushika/i18n"
import { useProfile } from "@/krushika/profile"
import { useNav } from "@/krushika/nav"
import {
  Pencil,
  MapPin,
  Ruler,
  Sprout,
  ScanLine,
  CalendarClock,
  Languages,
  Bell,
  Bookmark,
  ShieldCheck,
  CircleHelp,
  Info,
  LogOut,
  ChevronRight,
  Settings,
  Mic,
  WifiOff,
  Tractor,
} from "lucide-react"

type Row = {
  label: string
  icon: typeof Languages
  hint?: string
  danger?: boolean
  onClick?: () => void
  isToggle?: boolean
  toggleValue?: boolean
  onToggle?: () => void
}

export default function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const { t, lang } = useLang()
  const { profile } = useProfile()
  const { open } = useNav()
  const [notificationsOn, setNotificationsOn] = useState(true)

  const x = t.x.coreA
  const cropName = (c: string) => (x.crops as Record<string, string>)[c] ?? c
  const location = profile.district ? `${profile.district}, ${profile.state}` : profile.state

  const farmStats = [
    { label: t.profile.stats.scans, value: "0", icon: ScanLine },
    { label: t.profile.stats.crops, value: String(profile.crops.length), icon: Sprout },
    { label: t.profile.stats.years, value: String(profile.experience), icon: CalendarClock },
  ]

  const farmDetails = [
    { label: t.profile.farm.size, value: fmt(x.common.acresValue, { size: profile.farmSize }), icon: Ruler },
    { label: t.profile.farm.crops, value: profile.crops.map(cropName).join(" · ") || "—", icon: Sprout },
    { label: t.profile.farm.location, value: location, icon: MapPin },
  ]

  const farmRows: Row[] = [
    { label: t.profile.myFarm, icon: Tractor, onClick: () => open("myFarm") },
    { label: x.profile.scanHistory, icon: ScanLine, onClick: () => open("scanHistory") },
    { label: t.profile.rows.insurance, icon: ShieldCheck, onClick: () => open("insurance") },
  ]

  const preferences: Row[] = [
    { label: t.profile.rows.language, icon: Languages, hint: lang === "kn" ? "ಕನ್ನಡ" : "English", onClick: () => open("language") },
    { label: t.profile.rows.notifications, icon: Bell, isToggle: true, toggleValue: notificationsOn, onToggle: () => setNotificationsOn((v) => !v) },
    { label: t.profile.rows.saved, icon: Bookmark, onClick: () => open("saved") },
    { label: t.pages.settings.title, icon: Settings, onClick: () => open("settings") },
    { label: t.pages.voice.title, icon: Mic, onClick: () => open("voiceAssistant") },
    { label: t.pages.offline.title, icon: WifiOff, onClick: () => open("offlineMode") },
  ]

  const support: Row[] = [
    { label: t.profile.rows.help, icon: CircleHelp, onClick: () => open("help") },
    { label: t.profile.rows.about, icon: Info, onClick: () => open("about") },
    { label: t.profile.rows.logout, icon: LogOut, danger: true, onClick: onLogout },
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {/* Header with avatar */}
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.profile.title}</h1>
          <button
            onClick={() => open("editProfile")}
            className="flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-semibold backdrop-blur-sm transition active:scale-95"
          >
            <Pencil className="h-4 w-4" /> {t.profile.edit}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-white/25 ring-4 ring-white/30">
            <img
              src={profile.photoUrl}
              alt={x.profile.photoAlt}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-white/85">{profile.nameKn}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5" /> {location}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {farmStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-white/12 py-3 text-center backdrop-blur-sm">
              <Icon className="mx-auto h-5 w-5 text-white/80" />
              <p className="mt-1 text-lg font-bold">{value}</p>
              <p className="text-xs text-white/75">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Farm details */}
      <section className="px-5 pt-5">
        <h3 className="mb-2 text-sm font-semibold text-gray-500">{t.profile.myFarm}</h3>
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {farmDetails.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <Icon className="h-4.5 w-4.5 text-green-600" />
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Farm links */}
      <section className="px-5 pt-5">
        <h3 className="mb-2 text-sm font-semibold text-gray-500">{x.profile.farmSection}</h3>
        <MenuGroup rows={farmRows} />
      </section>

      {/* Preferences */}
      <section className="px-5 pt-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-500">{t.profile.preferences}</h3>
        <MenuGroup rows={preferences} />
      </section>

      {/* Support */}
      <section className="px-5 pt-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-500">{t.profile.support}</h3>
        <MenuGroup rows={support} />
      </section>

      <p className="pt-6 text-center text-xs text-gray-400">{t.profile.version}</p>
    </div>
  )
}

function MenuGroup({ rows }: { rows: Row[] }) {
  return (
    <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
      {rows.map(({ label, icon: Icon, hint, danger, onClick, isToggle, toggleValue, onToggle }) => (
        <button
          key={label}
          onClick={isToggle ? onToggle : onClick}
          className="flex w-full items-center gap-3 p-4 text-left transition active:bg-gray-50"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              danger ? "bg-red-50" : "bg-gray-100"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 ${danger ? "text-red-500" : "text-gray-500"}`} />
          </span>
          <span className={`min-w-0 flex-1 font-medium ${danger ? "text-red-500" : "text-gray-800"}`}>
            {label}
          </span>
          {isToggle ? (
            <span
              role="switch"
              aria-checked={toggleValue}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                toggleValue ? "bg-[#2f7d32]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  toggleValue ? "translate-x-[22px]" : "translate-x-1"
                }`}
              />
            </span>
          ) : (
            <>
              {hint && <span className="text-sm text-gray-400">{hint}</span>}
              {!danger && <ChevronRight className="h-5 w-5 text-gray-300" />}
            </>
          )}
        </button>
      ))}
    </div>
  )
}
