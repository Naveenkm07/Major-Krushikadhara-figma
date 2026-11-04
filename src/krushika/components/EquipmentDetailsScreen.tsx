import { MapPin, Phone, Fuel, Gauge, Sprout, CalendarCheck, Timer, ShieldCheck, Bell, Check } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText } from "@/krushika/equipment"
import { useLang, fmt } from "@/krushika/i18n"
import DetailShell from "./DetailShell"
import { AvailabilityBadge, Stars } from "./equipment/ui"

export default function EquipmentDetailsScreen() {
  const { params, open, back } = useNav()
  const { t } = useLang()
  const a = t.x.equipmentA
  const tx = useEquipText()
  const { getEquipment, toggleNotify } = useEquipment()
  const eq = getEquipment(String(params.id))

  if (!eq)
    return (
      <DetailShell title={a.details.title}>
        <p className="py-10 text-center text-sm text-gray-400">{a.notFound}</p>
      </DetailShell>
    )

  const specs = [
    { icon: Gauge, label: a.details.hp, value: eq.hp },
    { icon: Fuel, label: a.details.fuel, value: tx.fuel(eq.fuel) },
    { icon: Sprout, label: a.details.crops, value: tx.crops(eq.crops) },
    { icon: ShieldCheck, label: a.details.condition, value: tx.condition(eq.condition) },
    { icon: Timer, label: a.details.minRental, value: tx.duration(eq.minDuration) },
    { icon: CalendarCheck, label: a.details.availDates, value: fmt(a.details.fromDate, { date: "12 Sep" }) },
  ]

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#d4e9cc]">
          <img src={eq.image} alt={tx.name(eq.name)} className="h-full w-full object-cover" />
          <button
            onClick={back}
            className="absolute left-4 top-[max(3rem,calc(env(safe-area-inset-top)+0.75rem))] flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition active:scale-90"
            aria-label={a.back}
          >
            ←
          </button>
          <div className="absolute right-4 top-[max(3rem,calc(env(safe-area-inset-top)+0.75rem))]">
            <AvailabilityBadge value={eq.availability} />
          </div>
        </div>

        <div className="space-y-4 px-5 pt-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{tx.name(eq.name)}</h1>
              <p className="shrink-0 text-xl font-bold text-[#256428]">
                ₹{eq.pricePerDay}
                <span className="text-sm font-medium text-gray-400">{a.perDay}</span>
              </p>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 text-[#2f7d32]" /> {eq.location} · {eq.distanceKm} {a.km}
              <span className="text-gray-300">•</span>
              <Stars rating={eq.rating} reviews={eq.reviews} />
            </p>
          </div>

          {/* Specs */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold text-gray-800">{a.details.info}</h2>
            <div className="grid grid-cols-2 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50">
                    <s.icon className="h-4.5 w-4.5 text-[#2f7d32]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">{s.label}</p>
                    <p className="break-words text-sm font-semibold text-gray-700">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Owner */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-gray-800">{a.owner}</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-[#2f7d32]">
                {eq.owner.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{eq.owner}</p>
                <p className="text-sm text-gray-500">{eq.location}</p>
              </div>
              <div className="text-right">
                <Stars rating={eq.rating || 4.7} />
                <p className="mt-0.5 text-xs text-gray-400">{fmt(a.details.rentals, { n: eq.reviews || 12 })}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky actions */}
      <div className="flex items-center gap-3 border-t border-gray-100 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-semibold text-gray-700 transition active:scale-95">
          <Phone className="h-5 w-5 text-[#2f7d32]" /> {a.contact}
        </button>
        {eq.availability === "available" ? (
          <button
            onClick={() => open("requestRental", { id: eq.id })}
            className="flex-1 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
          >
            {a.details.requestRental}
          </button>
        ) : (
          <button
            onClick={() => toggleNotify(eq.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition active:scale-95 ${
              eq.notifyMe ? "bg-green-50 text-[#2f7d32]" : "bg-gray-100 text-gray-700"
            }`}
          >
            {eq.notifyMe ? <><Check className="h-5 w-5" /> {a.notifEnabled}</> : <><Bell className="h-5 w-5" /> {a.notifyMe}</>}
          </button>
        )}
      </div>
    </div>
  )
}
