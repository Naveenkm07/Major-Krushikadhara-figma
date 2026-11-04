import { useState } from "react"
import { CalendarDays, MapPin, MessageSquare } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText } from "@/krushika/equipment"
import { useLang, fmt } from "@/krushika/i18n"
import DetailShell from "./DetailShell"
import { ConfirmDialog } from "./equipment/ui"

// Prototype date options (no real date picker / calendar backend is wired).
const startOptions = ["12 Sep", "15 Sep", "18 Sep", "22 Sep"]

export default function RequestRentalScreen() {
  const { params, open } = useNav()
  const { t } = useLang()
  const a = t.x.equipmentA
  const tx = useEquipText()
  const { getEquipment, requestRental } = useEquipment()
  const eq = getEquipment(String(params.id))

  const [startIdx, setStartIdx] = useState(0)
  const [days, setDays] = useState(3)
  const [message, setMessage] = useState("")
  const [confirm, setConfirm] = useState(false)

  if (!eq)
    return (
      <DetailShell title={a.request.title}>
        <p className="py-10 text-center text-sm text-gray-400">{a.notFound}</p>
      </DetailShell>
    )

  const start = startOptions[startIdx]
  const startDay = parseInt(start)
  const endDay = startDay + days - 1
  const end = `${endDay} Sep`
  const total = eq.pricePerDay * days

  function send() {
    const id = requestRental(eq!.id, { start, end, days })
    setConfirm(false)
    open("requestSent", { rentalId: id })
  }

  return (
    <DetailShell title={a.request.title} subtitle={tx.name(eq.name)}>
      <div className="space-y-4">
        {/* Equipment summary */}
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
            <img src={eq.image} alt={tx.name(eq.name)} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{tx.name(eq.name)}</p>
            <p className="text-sm text-gray-500">{fmt(a.ownerLabel, { name: eq.owner })}</p>
            <p className="text-sm font-semibold text-[#256428]">₹{eq.pricePerDay}{a.perDay}</p>
          </div>
        </div>

        {/* Start date */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <CalendarDays className="h-4 w-4 text-[#2f7d32]" /> {a.request.startDate}
          </p>
          <div className="flex flex-wrap gap-2">
            {startOptions.map((d, i) => (
              <button
                key={d}
                onClick={() => setStartIdx(i)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  startIdx === i ? "bg-[#2f7d32] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        {/* Duration */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-gray-700">{a.request.duration}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                aria-label={a.request.decrease}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 transition active:scale-90"
              >
                −
              </button>
              <span className="min-w-16 text-center text-lg font-bold text-gray-800">
                {fmt(days === 1 ? a.dayN : a.daysN, { n: days })}
              </span>
              <button
                onClick={() => setDays((d) => Math.min(30, d + 1))}
                aria-label={a.request.increase}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 transition active:scale-90"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-500">{a.request.returnLabel} <span className="font-semibold text-gray-700">{end}</span></p>
          </div>
        </section>

        {/* Location */}
        <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <MapPin className="h-4 w-4 text-[#2f7d32]" />
          <span className="text-gray-500">{a.request.yourLocation}</span>
          <span className="ml-auto font-semibold text-gray-700">{a.request.locationValue}</span>
        </div>

        {/* Message */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <MessageSquare className="h-4 w-4 text-[#2f7d32]" /> {a.request.message}
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder={a.request.messagePlaceholder}
            className="w-full resize-none rounded-xl bg-gray-50 p-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </section>

        {/* Total */}
        <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
          <div>
            <p className="text-sm text-gray-500">{a.request.estTotal}</p>
            <p className="text-xs text-gray-400">{fmt(a.request.priceTimes, { price: eq.pricePerDay, n: days })}</p>
          </div>
          <p className="text-2xl font-extrabold text-[#256428]">₹{total.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <button
        onClick={() => setConfirm(true)}
        className="mt-5 w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-[0.98]"
      >
        {a.request.send}
      </button>

      <ConfirmDialog
        open={confirm}
        title={fmt(a.request.confirmTitle, { owner: eq.owner })}
        body={`${tx.name(eq.name)} · ${start} – ${end} · ₹${total.toLocaleString("en-IN")}`}
        confirmLabel={a.request.sendConfirm}
        onConfirm={send}
        onCancel={() => setConfirm(false)}
      />
    </DetailShell>
  )
}
