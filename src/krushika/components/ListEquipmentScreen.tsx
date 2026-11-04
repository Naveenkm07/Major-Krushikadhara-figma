import { useState } from "react"
import { ImagePlus, MapPin, Check } from "lucide-react"
import { useNav } from "@/krushika/nav"
import DetailShell from "./DetailShell"
import { useLang } from "@/krushika/i18n"
import { localizeName } from "@/krushika/locales/equipmentB"

const types = ["Tractor", "Rotavator", "Seed Drill", "Sprayer", "Harvester", "Cultivator", "Other"]

const photoChoices = [
  "https://images.unsplash.com/photo-1605338803155-8b46c0fe7e5e?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1571913196242-d0c1a45ee5c2?w=400&h=300&fit=crop&auto=format",
]

const optionKeys = ["optDelivery", "optPickup", "optOperator", "optFuel"] as const

export default function ListEquipmentScreen() {
  const { open } = useNav()
  const { t } = useLang()
  const L = t.x.equipmentB
  const options = optionKeys
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [image, setImage] = useState(photoChoices[0])
  const [desc, setDesc] = useState("")
  const [price, setPrice] = useState("")
  const [available, setAvailable] = useState(true)
  const [extras, setExtras] = useState<string[]>([])

  const toggleExtra = (o: string) =>
    setExtras((e) => (e.includes(o) ? e.filter((x) => x !== o) : [...e, o]))

  const valid = name.trim() && type && price

  function preview() {
    open("listingPreview", {
      draft: {
        name,
        type,
        image,
        crops: desc || "—",
        pricePerDay: Number(price) || 0,
        availability: available ? "available" : "booked",
      },
    })
  }

  const label = "mb-1.5 block text-sm font-semibold text-gray-600"
  const field =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-gray-800 outline-none focus:border-[#2f7d32]"

  return (
    <DetailShell title={L.list.title} subtitle={L.list.subtitle}>
      <div className="space-y-4">
        <div>
          <label className={label}>{L.list.nameLabel}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={L.list.namePh} className={field} />
        </div>

        <div>
          <label className={label}>{L.list.typeLabel}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${field} ${type ? "" : "text-gray-400"}`}>
            <option value="">{L.list.selectType}</option>
            {types.map((ty) => (
              <option key={ty} value={ty}>{localizeName(ty, L.typeNames)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>{L.list.photos}</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photoChoices.map((p) => (
              <button
                key={p}
                onClick={() => setImage(p)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                  image === p ? "ring-[#2f7d32]" : "ring-transparent"
                }`}
              >
                <img src={p} alt={L.list.photoAlt} className="h-full w-full object-cover" />
                {image === p && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7d32]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </button>
            ))}
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px]">{L.list.add}</span>
            </div>
          </div>
        </div>

        <div>
          <label className={label}>{L.list.description}</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder={L.list.descPh} className={`${field} resize-none`} />
        </div>

        <div>
          <label className={label}>{L.list.locationLabel}</label>
          <button className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-left font-medium text-gray-700">
            <MapPin className="h-4 w-4 text-[#2f7d32]" /> {L.location}
            <span className="ml-auto text-xs font-semibold text-[#2f7d32]">{L.list.useMyLocation}</span>
          </button>
        </div>

        <div>
          <label className={label}>{L.list.priceLabel}</label>
          <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:border-[#2f7d32]">
            <span className="text-gray-500">₹</span>
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="0" className="w-full bg-transparent px-2 py-3 text-gray-800 outline-none" />
            <span className="text-sm text-gray-400">{L.list.perDayUnit}</span>
          </div>
        </div>

        <div>
          <label className={label}>{L.list.availability}</label>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setAvailable(v)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  available === v ? "bg-[#2f7d32] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {v ? L.list.available : L.list.unavailable}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>{L.list.options}</label>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => toggleExtra(o)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  extras.includes(o) ? "bg-green-100 text-[#2f7d32]" : "bg-gray-100 text-gray-600"
                }`}
              >
                {L.list[o]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={preview}
        disabled={!valid}
        className="mt-6 w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-[0.98] disabled:opacity-40"
      >
        {L.list.preview}
      </button>
    </DetailShell>
  )
}
