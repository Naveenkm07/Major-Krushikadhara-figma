import { useState } from "react"
import {
  Bell, Globe, Moon, Download, WifiOff, Info,
  ChevronRight, Cpu, FileText, Shield, LogOut, Sun,
} from "lucide-react"
import { useLang } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!value)
      }}
      className={`relative h-7 w-12 rounded-full transition ${value ? "bg-[#2f7d32]" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${value ? "left-6" : "left-0.5"}`}
      />
    </button>
  )
}

function SettingsRow({
  icon: Icon,
  iconBg,
  label,
  sub,
  children,
  onPress,
}: {
  icon: typeof Bell
  iconBg: string
  label: string
  sub?: string
  children?: React.ReactNode
  onPress?: () => void
}) {
  return (
    <div
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
      onClick={onPress}
      onKeyDown={(e) => {
        if (onPress && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onPress()
        }
      }}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-50 ${onPress ? "cursor-pointer" : ""}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-4.5 w-4.5 text-white" size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      {children ?? <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />}
    </div>
  )
}

export default function SettingsScreen() {
  const { t } = useLang()
  const x = t.x.coreA.settings
  const { back, open } = useNav()
  const [notifs, setNotifs] = useState(true)
  const [offlineMode, setOfflineMode] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/80 transition active:opacity-70">
          ← {t.pages.back}
        </button>
        <h1 className="text-2xl font-bold">{t.pages.settings.title}</h1>
        <p className="mt-0.5 text-sm text-white/80">{x.subtitle}</p>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-5 space-y-4 px-5">
        {/* Preferences */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <p className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-wide text-gray-400">{x.preferences}</p>
          <div className="divide-y divide-gray-50">
            <SettingsRow icon={Bell} iconBg="bg-blue-500" label={x.notifications} sub={notifs ? x.notifOn : x.notifOff}>
              <Toggle value={notifs} onChange={setNotifs} label={x.notifications} />
            </SettingsRow>
            <SettingsRow icon={Globe} iconBg="bg-indigo-500" label={x.language} sub={x.languageSub} onPress={() => open("language")} />
            <SettingsRow icon={WifiOff} iconBg="bg-teal-600" label={x.offlineMode} sub={offlineMode ? x.offlineOn : x.offlineOff} onPress={() => open("offlineMode")}>
              <Toggle value={offlineMode} onChange={setOfflineMode} label={x.offlineMode} />
            </SettingsRow>
            <SettingsRow icon={darkMode ? Moon : Sun} iconBg="bg-gray-700" label={x.darkMode} sub={x.comingSoon}>
              <Toggle value={darkMode} onChange={setDarkMode} label={x.darkMode} />
            </SettingsRow>
          </div>
        </div>

        {/* AI & Data */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <p className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-wide text-gray-400">{x.aiData}</p>
          <div className="divide-y divide-gray-50">
            <SettingsRow icon={Cpu} iconBg="bg-[#2f7d32]" label={x.howAi} sub={x.howAiSub} onPress={() => open("howAiWorks")} />
            <SettingsRow icon={Download} iconBg="bg-orange-500" label={x.updateModel} sub={x.updateModelSub} onPress={() => {}} />
            <SettingsRow icon={WifiOff} iconBg="bg-gray-600" label={x.offlineData} sub={x.offlineDataSub} onPress={() => open("offlineMode")} />
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <p className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-wide text-gray-400">{x.about}</p>
          <div className="divide-y divide-gray-50">
            <SettingsRow icon={Info} iconBg="bg-gray-500" label={x.aboutApp} sub={x.aboutSub} onPress={() => open("about")} />
            <SettingsRow icon={Cpu} iconBg="bg-gray-800" label={x.techArch} sub={x.techArchSub} onPress={() => open("technicalArch")} />
            <SettingsRow icon={Shield} iconBg="bg-blue-600" label={x.privacy} sub={x.privacySub} onPress={() => {}} />
            <SettingsRow icon={FileText} iconBg="bg-purple-500" label={x.terms} sub={x.termsSub} onPress={() => {}} />
          </div>
        </div>

        {/* App info */}
        <div className="rounded-2xl bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7d32]">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <p className="font-bold text-white">KrushikaDhara</p>
              <p className="text-xs text-white/60">ಕೃಷಿಕಧಾರಾ · {t.pages.about.subtitle}</p>
              <p className="text-xs text-green-400 mt-0.5">{x.footerVersion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
