import { useMemo, useState } from "react"
import {
  Search, MapPin, SlidersHorizontal, ArrowUpDown, Plus, LayoutDashboard,
  ClipboardList, Tractor, Bell, Check, X,
} from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText } from "@/krushika/equipment"
import { useLang, fmt } from "@/krushika/i18n"
import DetailShell from "./DetailShell"
import { AvailabilityBadge, Stars } from "./equipment/ui"

type SortKey = "distance" | "price" | "availability"
const radii = [5, 10, 25, 50]
const types = ["Tractor", "Rotavator", "Seed Drill", "Sprayer", "Harvester", "Cultivator", "Other"]
const priceBands = [
  { label: "₹0–₹500", min: 0, max: 500 },
  { label: "₹500–₹1000", min: 500, max: 1000 },
  { label: "₹1000–₹2000", min: 1000, max: 2000 },
]

export default function EquipmentRentalScreen() {
  const { open } = useNav()
  const { t } = useLang()
  const a = t.x.equipmentA
  const tx = useEquipText()
  const { equipment, unreadCount, toggleNotify } = useEquipment()

  const [query, setQuery] = useState("")
  const [radius, setRadius] = useState(25)
  const [sort, setSort] = useState<SortKey>("distance")
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [band, setBand] = useState<number | null>(null)
  const [availOnly, setAvailOnly] = useState(false)

  const list = useMemo(() => {
    let out = equipment.filter((e) => e.distanceKm <= radius)
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          tx.name(e.name).toLowerCase().includes(q) ||
          tx.type(e.type).toLowerCase().includes(q),
      )
    }
    if (typeFilter.length) out = out.filter((e) => typeFilter.includes(e.type))
    if (band !== null) {
      const b = priceBands[band]
      out = out.filter((e) => e.pricePerDay >= b.min && e.pricePerDay <= b.max)
    }
    if (availOnly) out = out.filter((e) => e.availability === "available")
    out = [...out].sort((a, b) => {
      if (sort === "price") return a.pricePerDay - b.pricePerDay
      if (sort === "availability")
        return Number(b.availability === "available") - Number(a.availability === "available")
      return a.distanceKm - b.distanceKm
    })
    return out
  }, [equipment, radius, query, typeFilter, band, availOnly, sort, tx])

  const toggleType = (ty: string) =>
    setTypeFilter((f) => (f.includes(ty) ? f.filter((x) => x !== ty) : [...f, ty]))

  return (
    <DetailShell
      title={a.rental.title}
      subtitle={a.rental.subtitle}
      action={
        <button
          onClick={() => open("rentalNotifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:scale-90"
          aria-label={a.rental.notifAria}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-bold text-white ring-2 ring-[#2f7d32]">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl bg-white px-3 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={a.rental.searchPlaceholder}
          className="w-full bg-transparent py-3 text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Location + filter + sort */}
      <div className="mt-3 flex items-center gap-2">
        <button className="flex flex-1 items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm">
          <MapPin className="h-4 w-4 text-[#2f7d32]" /> {a.rental.nearMandya}
        </button>
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition active:scale-95"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#2f7d32]" /> {a.rental.filter}
        </button>
        <button
          onClick={() => setShowSort((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition active:scale-95"
        >
          <ArrowUpDown className="h-4 w-4 text-[#2f7d32]" /> {a.rental.sort}
        </button>
      </div>

      {showSort && (
        <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-sm">
          {(["distance", "availability", "price"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                setSort(k)
                setShowSort(false)
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm capitalize text-gray-700 transition active:bg-gray-50"
            >
              {k === "distance" ? a.rental.sortNearest : k === "price" ? a.rental.sortPrice : a.rental.sortAvailable}
              {sort === k && <Check className="h-4 w-4 text-[#2f7d32]" />}
            </button>
          ))}
        </div>
      )}

      {/* Radius chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {radii.map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              radius === r ? "bg-[#2f7d32] text-white" : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            {fmt(a.rental.radius, { n: r })}
          </button>
        ))}
      </div>

      {/* Owner shortcuts */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => open("ownerDashboard")}
          className="flex items-center gap-2 rounded-2xl bg-white p-3 text-left shadow-sm transition active:scale-95"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
            <LayoutDashboard className="h-4.5 w-4.5 text-purple-500" />
          </span>
          <span className="text-sm font-semibold text-gray-700">{a.rental.ownerDashboard}</span>
        </button>
        <button
          onClick={() => open("myRentals")}
          className="flex items-center gap-2 rounded-2xl bg-white p-3 text-left shadow-sm transition active:scale-95"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
          </span>
          <span className="text-sm font-semibold text-gray-700">{a.rental.myRentals}</span>
        </button>
      </div>

      <button
        onClick={() => open("listEquipment")}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2f7d32]/40 bg-green-50/60 py-3 font-semibold text-[#2f7d32] transition active:scale-[0.99]"
      >
        <Plus className="h-5 w-5" /> {a.rental.listYours}
      </button>

      {/* Listings */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">{a.rental.nearYou}</h2>
        <span className="text-xs text-gray-400">{fmt(a.rental.found, { n: list.length })}</span>
      </div>
      <div className="mt-3 space-y-3">
        {list.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <button onClick={() => open("equipmentDetails", { id: e.id })} className="flex w-full gap-3 p-3 text-left">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img src={e.image} alt={tx.name(e.name)} className="h-full w-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-gray-800">{tx.name(e.name)}</p>
                  <AvailabilityBadge value={e.availability} />
                </div>
                <p className="text-xs text-gray-400">{tx.type(e.type)} · {e.owner}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-[#2f7d32]" /> {e.location} · {e.distanceKm} {a.km}
                </p>
                <div className="mt-auto flex items-center justify-between pt-1.5">
                  <p className="text-lg font-bold text-gray-800">
                    ₹{e.pricePerDay}
                    <span className="text-xs font-medium text-gray-400">{a.perDay}</span>
                  </p>
                  <Stars rating={e.rating} reviews={e.reviews} />
                </div>
              </div>
            </button>
            <div className="border-t border-gray-100 px-3 py-2">
              {e.availability === "available" ? (
                <button
                  onClick={() => open("requestRental", { id: e.id })}
                  className="w-full rounded-xl bg-[#2f7d32] py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-600/30 transition active:scale-95"
                >
                  {a.rental.rentNow}
                </button>
              ) : (
                <button
                  onClick={() => toggleNotify(e.id)}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
                    e.notifyMe ? "bg-green-50 text-[#2f7d32]" : "border border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {e.notifyMe ? <><Check className="h-4 w-4" /> {a.notifEnabled}</> : <><Bell className="h-4 w-4" /> {a.notifyMe}</>}
                </button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">{a.rental.noMatch}</p>
        )}
      </div>

      {/* Filter sheet */}
      {showFilter && (
        <div className="absolute inset-0 z-40 flex items-end bg-black/40" onClick={() => setShowFilter(false)}>
          <div
            className="w-full rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{a.rental.filters}</h3>
              <button onClick={() => setShowFilter(false)} className="text-gray-400"><X className="h-5 w-5" /></button>
            </div>

            <p className="mb-2 text-sm font-semibold text-gray-500">{a.rental.equipType}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {types.map((ty) => (
                <button
                  key={ty}
                  onClick={() => toggleType(ty)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    typeFilter.includes(ty) ? "bg-[#2f7d32] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tx.type(ty)}
                </button>
              ))}
            </div>

            <p className="mb-2 text-sm font-semibold text-gray-500">{a.rental.pricePerDay}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {priceBands.map((b, i) => (
                <button
                  key={b.label}
                  onClick={() => setBand(band === i ? null : i)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    band === i ? "bg-[#2f7d32] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAvailOnly((v) => !v)}
              className="mb-5 flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
            >
              <span className="text-sm font-semibold text-gray-700">{a.rental.availNow}</span>
              <span className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${availOnly ? "bg-[#2f7d32]" : "bg-gray-300"}`}>
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${availOnly ? "translate-x-[22px]" : "translate-x-1"}`} />
              </span>
            </button>

            <button
              onClick={() => setShowFilter(false)}
              className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
            >
              {a.rental.apply}
            </button>
          </div>
        </div>
      )}
    </DetailShell>
  )
}
