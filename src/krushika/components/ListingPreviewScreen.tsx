import { useState } from "react"
import { MapPin, CheckCircle2 } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, type Equipment } from "@/krushika/equipment"
import DetailShell from "./DetailShell"
import { useLang, fmt } from "@/krushika/i18n"
import { localizeName } from "@/krushika/locales/equipmentB"
import { AvailabilityBadge } from "./equipment/ui"

export default function ListingPreviewScreen() {
  const { params, back, reset, open } = useNav()
  const { t } = useLang()
  const L = t.x.equipmentB
  const { listEquipment } = useEquipment()
  const draft = params.draft as Partial<Equipment>
  const [published, setPublished] = useState(false)

  function publish() {
    listEquipment(draft)
    setPublished(true)
  }

  if (published) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col bg-[#f7f8ec] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(4rem,calc(env(safe-area-inset-top)+2rem))]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-11 w-11 text-[#2f7d32]" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-[#256428]">{L.preview.publishedTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {fmt(L.preview.publishedBody, { name: draft?.name ?? "" })}
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => {
              reset()
              open("myEquipment")
            }}
            className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-[0.98]"
          >
            {L.preview.viewMine}
          </button>
          <button onClick={reset} className="w-full rounded-2xl py-3 font-semibold text-gray-500 transition active:scale-95">
            {L.preview.done}
          </button>
        </div>
      </div>
    )
  }

  return (
    <DetailShell title={L.preview.title} subtitle={L.preview.subtitle}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="aspect-[16/9] w-full bg-gray-100">
          <img src={draft?.image} alt={draft?.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-gray-800">{draft?.name}</p>
              <p className="text-sm text-gray-400">{localizeName(draft?.type, L.typeNames)} · Naveen Kumar km</p>
            </div>
            <AvailabilityBadge value={(draft?.availability as "available" | "booked") ?? "available"} />
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-[#2f7d32]" /> {L.location}
          </p>
          {draft?.crops && draft.crops !== "—" && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{draft.crops}</p>
          )}
          <p className="mt-3 text-2xl font-extrabold text-[#256428]">
            ₹{draft?.pricePerDay}
            <span className="text-sm font-medium text-gray-400">{L.perDay}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={back} className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition active:scale-95">
          {L.preview.edit}
        </button>
        <button onClick={publish} className="flex-1 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95">
          {L.preview.publish}
        </button>
      </div>
    </DetailShell>
  )
}
