import { TrendingUp, TrendingDown, MapPin, Clock } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

const crops = [
  { id: "tomato", price: 28, change: 4, emoji: "🍅" },
  { id: "ragi", price: 42, change: 2, emoji: "🌾" },
  { id: "rice", price: 34, change: -1, emoji: "🌾" },
  { id: "onion", price: 19, change: -3, emoji: "🧅" },
]

const trend = [
  { p: 24 },
  { p: 25 },
  { p: 23 },
  { p: 26 },
  { p: 27 },
  { p: 26 },
  { p: 28 },
]

export default function MarketPricesScreen() {
  const { t } = useLang()
  const x = t.x.coreB.market
  const trendData = trend.map((r, i) => ({ ...r, d: x.days[i] }))

  return (
    <DetailShell title={t.pages.market.title} subtitle={t.pages.market.subtitle}>
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3 text-sm shadow-sm">
        <span className="flex items-center gap-1.5 font-semibold text-gray-700">
          <MapPin className="h-4 w-4 text-[#2f7d32]" /> {t.pages.market.mandi}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" /> {x.updatedAt}
        </span>
      </div>

      {/* Trend chart */}
      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-gray-800">{t.pages.market.trendTitle}</h2>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="mp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2f7d32" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2f7d32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)", fontSize: 12 }}
                formatter={(v) => [`₹${v}/kg`, x.crops.tomato]}
              />
              <Area type="monotone" dataKey="p" stroke="#2f7d32" strokeWidth={2.5} fill="url(#mp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Price list */}
      <div className="space-y-3">
        {crops.map((c) => {
          const up = c.change >= 0
          return (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                {c.emoji}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{x.crops[c.id as keyof typeof x.crops]}</p>
                <p className="text-xs text-gray-400">{t.pages.market.mandi}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  ₹{c.price}
                  <span className="text-xs font-medium text-gray-400">{t.pages.market.perKg}</span>
                </p>
                <p
                  className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                    up ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {Math.abs(c.change)}%
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </DetailShell>
  )
}
