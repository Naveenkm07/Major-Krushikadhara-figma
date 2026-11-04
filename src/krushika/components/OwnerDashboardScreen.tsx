import { Tractor, Activity, Inbox, CheckCircle2, Wallet, Plus, ChevronRight } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment } from "@/krushika/equipment"
import DetailShell from "./DetailShell"
import { useLang, fmt } from "@/krushika/i18n"

export default function OwnerDashboardScreen() {
  const { open } = useNav()
  const { t } = useLang()
  const L = t.x.equipmentB.dashboard
  const { mine, ownerRequests } = useEquipment()

  const pending = ownerRequests.filter((r) => r.status === "pending").length
  const active = mine.filter((e) => e.availability === "booked").length

  const stats = [
    { label: L.listed, value: mine.length, icon: Tractor, bg: "bg-green-100", color: "text-[#2f7d32]" },
    { label: L.activeRentals, value: active + 1, icon: Activity, bg: "bg-blue-100", color: "text-blue-500" },
    { label: L.pendingRequests, value: pending, icon: Inbox, bg: "bg-orange-100", color: "text-orange-500" },
    { label: L.completed, value: 27, icon: CheckCircle2, bg: "bg-teal-100", color: "text-teal-600" },
  ]

  const sections = [
    { label: L.myEquipment, hint: fmt(L.hintListed, { n: mine.length }), route: "myEquipment" as const },
    { label: L.pendingRequests, hint: fmt(L.hintWaiting, { n: pending }), route: "ownerRequests" as const },
    { label: L.activeRentals, hint: fmt(L.hintOngoing, { n: active + 1 }), route: "myRentals" as const },
    { label: L.rentalHistory, hint: fmt(L.hintCompleted, { n: 27 }), route: "rentalHistory" as const },
  ]

  return (
    <DetailShell title={L.title} subtitle={L.subtitle}>
      {/* Earnings hero */}
      <div className="rounded-2xl bg-gradient-to-br from-[#2f7d32] to-[#256428] p-5 text-white shadow-md">
        <div className="flex items-center gap-2 text-white/80">
          <Wallet className="h-5 w-5" />
          <p className="text-sm">{L.earnings}</p>
        </div>
        <p className="mt-1 text-3xl font-extrabold">₹18,500</p>
        <p className="mt-1 text-xs text-white/70">{fmt(L.acrossRentals, { n: 27 })}</p>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${s.bg}`}>
              <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-4 divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {sections.map((s) => (
          <button
            key={s.label}
            onClick={() => open(s.route)}
            className="flex w-full items-center gap-3 p-4 text-left transition active:bg-gray-50"
          >
            <span className="flex-1 font-semibold text-gray-800">{s.label}</span>
            <span className="text-sm text-gray-400">{s.hint}</span>
            <ChevronRight className="h-5 w-5 text-gray-300" />
          </button>
        ))}
      </div>

      <button
        onClick={() => open("listEquipment")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" /> {L.listEquipment}
      </button>
    </DetailShell>
  )
}
