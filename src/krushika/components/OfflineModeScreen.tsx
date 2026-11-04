import { useState } from "react"
import { WifiOff, Wifi, CheckCircle2, XCircle, Download, RefreshCw, HardDrive } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang, fmt } from "@/krushika/i18n"

const CACHED = ["3.2 MB", "1.8 MB", "0.4 MB", "2.1 MB"]

export default function OfflineModeScreen() {
  const { back } = useNav()
  const { t } = useLang()
  const tx = t.x.info.offlineMode
  const [syncing, setSyncing] = useState(false)

  function sync() {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2000)
  }

  const total = CACHED.reduce((sum, c) => sum + parseFloat(c), 0).toFixed(1)

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <button onClick={back} className="mb-3 flex items-center gap-1.5 text-sm text-white/80 transition active:opacity-70">
          {tx.back}
        </button>
        <div className="flex items-center gap-3">
          <WifiOff className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">{tx.title}</h1>
            <p className="mt-0.5 text-sm text-white/80">{tx.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 pt-5 space-y-4 px-5">
        {/* Status card */}
        <div className="rounded-2xl bg-green-50 p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">{tx.online}</span>
            </div>
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">{tx.connected}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-700">{fmt(tx.lastSynced, { time: tx.lastSyncValue })}</p>
            <button
              onClick={sync}
              className={`flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 ${syncing ? "opacity-70" : ""}`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? tx.syncing : tx.syncNow}
            </button>
          </div>
        </div>

        {/* What works offline */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> {tx.worksOffline}
          </h2>
          <div className="space-y-3">
            {tx.works.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs internet */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
            <XCircle className="h-5 w-5 text-gray-400" /> {tx.requiresInternet}
          </h2>
          <div className="space-y-3">
            {tx.online_only.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cached data */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 font-bold text-gray-800">
              <HardDrive className="h-5 w-5 text-[#2f7d32]" /> {tx.cachedData}
            </h2>
            <span className="text-sm font-bold text-[#2f7d32]">{fmt(tx.totalMb, { total })}</span>
          </div>
          <div className="space-y-2">
            {CACHED.map((size, ci) => (
              <div key={ci} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-600">{tx.cached[ci]}</p>
                <span className="text-xs font-semibold text-gray-400">{size}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f7d32] py-3 font-semibold text-white shadow-md shadow-green-600/20 transition active:scale-95">
            <Download className="h-4 w-4" /> {tx.updateData}
          </button>
        </div>

        {/* Key feature callout */}
        <div className="rounded-2xl bg-gray-900 p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="h-6 w-6 shrink-0 text-green-400" />
            <div>
              <p className="font-bold text-white">{tx.ruralTitle}</p>
              <p className="mt-1 text-sm text-white/60">
                {tx.ruralDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
