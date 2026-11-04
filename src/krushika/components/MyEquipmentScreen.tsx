import { Pencil, CalendarRange, Inbox, Plus, MapPin } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment } from "@/krushika/equipment"
import DetailShell from "./DetailShell"
import { useLang, fmt } from "@/krushika/i18n"
import { localizeName } from "@/krushika/locales/equipmentB"
import { AvailabilityBadge } from "./equipment/ui"

export default function MyEquipmentScreen() {
  const { open } = useNav()
  const { t } = useLang()
  const L = t.x.equipmentB
  const { mine, ownerRequests } = useEquipment()

  const pendingFor = (id: string) =>
    ownerRequests.filter((r) => r.equipmentId === id && r.status === "pending").length

  return (
    <DetailShell
      title={L.mine.title}
      subtitle={L.mine.subtitle}
      action={
        <button
          onClick={() => open("listEquipment")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:scale-90"
          aria-label={L.mine.addAria}
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="space-y-3">
        {mine.map((e) => {
          const pending = pendingFor(e.id)
          return (
            <div key={e.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img src={e.image} alt={localizeName(e.name, L.typeNames)} className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-800">{localizeName(e.name, L.typeNames)}</p>
                    <AvailabilityBadge value={e.availability} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-[#2f7d32]" /> {e.location}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-1.5">
                    <p className="text-lg font-bold text-gray-800">
                      ₹{e.pricePerDay}
                      <span className="text-xs font-medium text-gray-400">{L.perDay}</span>
                    </p>
                    <span className="text-xs font-semibold text-orange-500">
                      {fmt(pending === 1 ? L.mine.requestOne : L.mine.requestMany, { n: pending })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 text-sm font-semibold">
                <button className="flex items-center justify-center gap-1.5 py-2.5 text-gray-600 transition active:bg-gray-50">
                  <Pencil className="h-4 w-4 shrink-0" /> {L.mine.edit}
                </button>
                <button className="flex items-center justify-center gap-1.5 py-2.5 text-gray-600 transition active:bg-gray-50">
                  <CalendarRange className="h-4 w-4 shrink-0" /> {L.mine.availability}
                </button>
                <button
                  onClick={() => open("ownerRequests", { equipmentId: e.id })}
                  className="relative flex items-center justify-center gap-1.5 py-2.5 text-[#2f7d32] transition active:bg-gray-50"
                >
                  <Inbox className="h-4 w-4 shrink-0" /> {L.mine.requests}
                  {pending > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                      {pending}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </DetailShell>
  )
}
