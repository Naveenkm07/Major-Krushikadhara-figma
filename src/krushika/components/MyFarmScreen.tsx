import { Leaf, Droplets, MapPin, PlusCircle, Ruler, Clock, ChevronRight } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"
import { useProfile } from "@/krushika/profile"
import DetailShell from "@/krushika/components/DetailShell"

const CROP_ICONS: Record<string, string> = {
  Rice: "🌾",
  Ragi: "🌿",
  Tomato: "🍅",
  Chilli: "🌶️",
  Onion: "🧅",
  Sugarcane: "🎋",
  Maize: "🌽",
}

const CROP_HEALTH = [
  { status: "healthy" },
  { status: "warning" },
  { status: "healthy" },
]

const IRRIGATION = [
  { crop: "Rice", schedule: "every3", next: "tomorrow", status: "due" },
  { crop: "Ragi", schedule: "weekly", next: "in3", status: "ok" },
  { crop: "Tomato", schedule: "every2", next: "today", status: "overdue" },
]

export default function MyFarmScreen() {
  const { t } = useLang()
  const { open } = useNav()
  const { profile } = useProfile()
  const mf = t.pages.myFarm
  const x = t.x.coreA
  const my = x.myFarm
  const cropName = (c: string) => (x.crops as Record<string, string>)[c] ?? c

  const cropList = profile.crops.length > 0 ? profile.crops : ["Rice", "Ragi", "Tomato"]

  return (
    <DetailShell title={mf.title} subtitle={mf.subtitle}>
      {/* Farm overview card */}
      <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#2f7d32] to-[#1b5e20] p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=80&h=80&fit=crop&auto=format"
            alt={my.farmAlt}
            className="h-16 w-16 rounded-2xl object-cover opacity-90"
          />
          <div>
            <p className="text-xs text-white/60">{my.farmOf}</p>
            <p className="font-bold">{profile.name}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-white/70">
              <MapPin className="h-3 w-3" />
              {profile.district}, {profile.state}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 text-center">
          <div>
            <p className="text-xs text-white/60">{mf.totalArea}</p>
            <p className="font-bold">{fmt(x.common.acAbbr, { size: profile.farmSize })}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">{mf.activeCrops}</p>
            <p className="font-bold">{cropList.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">{mf.soilType}</p>
            <p className="font-bold">{my.redLoam}</p>
          </div>
        </div>
      </div>

      {/* My crops */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">{my.myCrops}</h2>
          <button
            onClick={() => open("editProfile")}
            className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#2f7d32] transition active:scale-95"
          >
            <PlusCircle className="h-3 w-3" /> {mf.addCrop}
          </button>
        </div>
        <div className="space-y-2">
          {cropList.map((crop, i) => {
            const health = CROP_HEALTH[i % CROP_HEALTH.length]
            return (
              <div
                key={crop}
                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
              >
                <span className="text-2xl">{CROP_ICONS[crop] ?? "🌱"}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{cropName(crop)}</p>
                  <p className={`text-xs ${health.status === "healthy" ? "text-green-600" : "text-amber-600"}`}>
                    {health.status === "healthy" ? mf.healthy : mf.warning}
                  </p>
                </div>
                <button
                  onClick={() => open("scanHistory")}
                  className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition active:scale-95"
                >
                  <Leaf className="h-3 w-3" /> {my.scan}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Irrigation schedule */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <h2 className="font-bold text-gray-800">{mf.irrigationSchedule}</h2>
        </div>
        <div className="space-y-2">
          {IRRIGATION.map((ir) => {
            const statusStyle =
              ir.status === "overdue"
                ? "bg-red-50 text-red-600"
                : ir.status === "due"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-green-50 text-green-600"
            return (
              <div key={ir.crop} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <div>
                  <p className="font-semibold text-gray-800">{cropName(ir.crop)}</p>
                  <p className="text-xs text-gray-400">{my.schedules[ir.schedule as keyof typeof my.schedules]}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle}`}>
                    {mf.nextIrrigation}: {my.next[ir.next as keyof typeof my.next]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          {my.demo}
        </p>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{my.tools}</h2>
        <div className="space-y-1">
          {[
            { icon: Ruler, label: my.marketPrices, route: "market" as const },
            { icon: Clock, label: my.cropCalendar, route: "calendar" as const },
            { icon: Leaf, label: my.scanHistory, route: "scanHistory" as const },
          ].map(({ icon: Icon, label, route }) => (
            <button
              key={label}
              onClick={() => open(route)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-gray-50 active:scale-[0.98]"
            >
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-sm text-gray-700">{label}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </DetailShell>
  )
}
