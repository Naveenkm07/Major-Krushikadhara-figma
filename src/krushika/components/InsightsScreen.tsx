import { useState } from "react"
import { useLang, fmt } from "@/krushika/i18n"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import {
  BarChart3,
  Sprout,
  IndianRupee,
  Droplets,
  TrendingUp,
  Leaf,
} from "lucide-react"

const yieldTrend = [
  { month: "Apr", yield: 320 },
  { month: "May", yield: 410 },
  { month: "Jun", yield: 380 },
  { month: "Jul", yield: 520 },
  { month: "Aug", yield: 610 },
  { month: "Sep", yield: 720 },
]

const cropSplit: { key: "rice" | "ragi" | "tomato" | "others"; value: number; color: string }[] = [
  { key: "rice", value: 45, color: "#2f7d32" },
  { key: "ragi", value: 25, color: "#7cc142" },
  { key: "tomato", value: 20, color: "#f4b400" },
  { key: "others", value: 10, color: "#14b8a6" },
]

const moneyFlow = [
  { month: "Jun", income: 42, expense: 28 },
  { month: "Jul", income: 55, expense: 31 },
  { month: "Aug", income: 61, expense: 34 },
  { month: "Sep", income: 74, expense: 38 },
]

const soil: { key: "n" | "p" | "k" | "moisture"; value: number; color: string }[] = [
  { key: "n", value: 78, color: "bg-green-500" },
  { key: "p", value: 54, color: "bg-amber-500" },
  { key: "k", value: 66, color: "bg-teal-500" },
  { key: "moisture", value: 42, color: "bg-blue-500" },
]

const ranges = ["6M", "1Y", "All"]

export default function InsightsScreen() {
  const { t } = useLang()
  const x = t.x.coreA
  const mon = (m: unknown) => (x.months as Record<string, string>)[String(m)] ?? String(m)
  const [range, setRange] = useState("6M")

  const stats = [
    { key: "yield", value: fmt(x.common.kg, { n: "2,960" }), icon: Sprout, tint: "bg-green-50", color: "text-green-600", delta: "+12%" },
    { key: "revenue", value: "₹74,200", icon: IndianRupee, tint: "bg-amber-50", color: "text-amber-600", delta: "+8%" },
    { key: "crops", value: "4", icon: Leaf, tint: "bg-teal-50", color: "text-teal-600", delta: t.insights.stats.ready },
    { key: "water", value: "18%", icon: Droplets, tint: "bg-blue-50", color: "text-blue-600", delta: t.insights.stats.vsYr },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t.insights.title}</h1>
        </div>
        <p className="mt-1 text-sm text-white/85">{t.insights.subtitle}</p>
      </header>

      {/* Stat tiles */}
      <section className="px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ key, value, icon: Icon, tint, color, delta }) => (
            <div key={key} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tint}`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                </span>
                <span className="text-[11px] font-semibold text-green-600">{delta}</span>
              </div>
              <p className="mt-3 text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400">{t.insights.stats[key]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Yield trend */}
      <section className="px-5 pt-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">{t.insights.yieldTrend}</h2>
              <p className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3.5 w-3.5" /> {t.insights.yieldUp}
              </p>
            </div>
            <div className="flex rounded-full bg-gray-100 p-0.5">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    range === r ? "bg-white text-[#2f7d32] shadow-sm" : "text-gray-400"
                  }`}
                >
                  {x.insights.ranges[r as keyof typeof x.insights.ranges]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f7d32" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2f7d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef1e8" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={mon} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  labelFormatter={mon}
                  formatter={(v) => [fmt(x.common.kg, { n: String(v) }), x.insights.yieldLabel]}
                />
                <Area type="monotone" dataKey="yield" stroke="#2f7d32" strokeWidth={2.5} fill="url(#yieldFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Crop distribution */}
      <section className="px-5 pt-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-bold text-gray-800">{t.insights.cropDist}</h2>
          <div className="mt-2 flex items-center">
            <div className="h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropSplit}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={62}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {cropSplit.map((c) => (
                      <Cell key={c.key} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: 12, border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 pl-2">
              {cropSplit.map((c) => (
                <li key={c.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    {t.insights.cropNames[c.key]}
                  </span>
                  <span className="font-semibold text-gray-800">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Income vs Expense */}
      <section className="px-5 pt-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">{t.insights.money}</h2>
            <span className="text-xs text-gray-400">{t.insights.moneyUnit}</span>
          </div>
          <div className="mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moneyFlow} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid vertical={false} stroke="#eef1e8" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={mon} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  labelFormatter={mon}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  formatter={(v, n) => [`₹${v}k`, n === "income" ? t.insights.income : t.insights.expense]}
                />
                <Bar dataKey="income" name={t.insights.income} fill="#2f7d32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name={t.insights.expense} fill="#f4b400" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-5 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2f7d32]" /> {t.insights.income}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4b400]" /> {t.insights.expense}
            </span>
          </div>
        </div>
      </section>

      {/* Soil health */}
      <section className="px-5 pt-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-bold text-gray-800">{t.insights.soil}</h2>
          <div className="mt-3 space-y-3">
            {soil.map(({ key, value, color }) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t.insights.soilRows[key]}</span>
                  <span className="font-semibold text-gray-800">{value}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
