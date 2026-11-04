import {
  Cloud,
  Droplets,
  Wind,
  Eye,
  Sun,
  CloudRain,
  Thermometer,
  Leaf,
  RefreshCw,
} from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "@/krushika/components/DetailShell"

const FORECAST = [
  { icon: Sun, high: 34, low: 22, rain: "0%" },
  { icon: Sun, high: 35, low: 23, rain: "5%" },
  { icon: Cloud, high: 31, low: 21, rain: "25%" },
  { icon: CloudRain, high: 28, low: 19, rain: "70%" },
  { icon: CloudRain, high: 27, low: 20, rain: "60%" },
]

const ADVISORY_META = [
  { icon: Leaf, color: "text-green-600 bg-green-50" },
  { icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { icon: Thermometer, color: "text-orange-600 bg-orange-50" },
]

export default function WeatherScreen() {
  const { t } = useLang()
  const w = t.pages.weather
  const x = t.x.coreB.weather

  return (
    <DetailShell title={w.title} subtitle={w.subtitle}>
      {/* Current conditions hero */}
      <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1565c0] to-[#0d47a1] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70">{x.place}</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-6xl font-thin">32</span>
              <span className="mb-2 text-2xl font-light">°C</span>
            </div>
            <p className="text-sm font-medium">{x.condition}</p>
            <p className="mt-0.5 text-xs text-white/60">{w.feelsLike} 34°C</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Sun className="h-14 w-14 text-yellow-300" />
            <button className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              <RefreshCw className="h-3 w-3" /> {x.refresh}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-white/10 p-3">
          {[
            { icon: Droplets, label: w.humidity, value: "62%" },
            { icon: Wind, label: w.wind, value: "8 km/h" },
            { icon: CloudRain, label: w.rainfall, value: "2mm" },
            { icon: Eye, label: w.visibility, value: "10 km" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="h-4 w-4 text-white/70" />
              <span className="text-xs font-bold text-white">{value}</span>
              <span className="text-[9px] text-white/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{w.forecast}</h2>
        <div className="flex gap-2">
          {FORECAST.map(({ icon: Icon, high, low, rain }, i) => (
            <div
              key={i}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 ${
                i === 0 ? "bg-blue-50" : ""
              }`}
            >
              <p className={`text-xs font-semibold ${i === 0 ? "text-blue-700" : "text-gray-500"}`}>
                {i === 0 ? x.today : x.days[i]}
              </p>
              <Icon className={`h-5 w-5 ${i === 0 ? "text-blue-600" : "text-gray-400"}`} />
              <p className="text-xs font-bold text-gray-700">{high}°</p>
              <p className="text-[10px] text-gray-400">{low}°</p>
              <p className="text-[9px] text-blue-500">{rain}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Farm advisories */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{w.farmAdvice}</h2>
        <p className="mb-3 text-[10px] text-amber-600">{w.advisoryNote}</p>
        <div className="space-y-3">
          {ADVISORY_META.map(({ icon: Icon, color }, i) => (
            <div key={i} className="flex gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{x.adv[i].title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{x.adv[i].body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DetailShell>
  )
}
