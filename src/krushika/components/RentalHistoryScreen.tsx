import { CalendarDays, ChevronRight } from "lucide-react"
import { useNav } from "@/krushika/nav"
import DetailShell from "./DetailShell"
import { StatusBadge } from "./equipment/ui"
import { useLang, fmt } from "@/krushika/i18n"
import { localizeName } from "@/krushika/locales/equipmentB"

const IMG = {
  tractor: "https://images.unsplash.com/photo-1605338803155-8b46c0fe7e5e?w=200&h=200&fit=crop&auto=format",
  rotavator: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&h=200&fit=crop&auto=format",
  sprayer: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=200&h=200&fit=crop&auto=format",
}

const history = [
  { equipment: "Tractor (45 HP)", party: "Suresh Kumar", role: "Renter", dates: "12 Aug – 14 Aug", total: 3600, image: IMG.tractor },
  { equipment: "Cultivator", party: "Prakash", role: "Renter", dates: "2 Aug – 3 Aug", total: 1400, image: IMG.rotavator },
  { equipment: "Power Sprayer", party: "Kumar", role: "Owner", dates: "28 Jul", total: 300, image: IMG.sprayer },
  { equipment: "Tractor (45 HP)", party: "Lokesh", role: "Renter", dates: "18 Jul – 20 Jul", total: 3600, image: IMG.tractor },
]

export default function RentalHistoryScreen() {
  useNav()
  const { t } = useLang()
  const L = t.x.equipmentB
  return (
    <DetailShell title={L.history.title} subtitle={L.history.subtitle}>
      <div className="space-y-3">
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              <img src={h.image} alt={localizeName(h.equipment, L.typeNames)} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-gray-800">{localizeName(h.equipment, L.typeNames)}</p>
                <StatusBadge value="completed" />
              </div>
              <p className="text-xs text-gray-400">{fmt(L.history.party, { role: L.roles[h.role] ?? h.role, name: h.party })}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5 text-[#2f7d32]" /> {h.dates}
                </p>
                <p className="font-bold text-gray-800">₹{h.total.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
          </div>
        ))}
      </div>
    </DetailShell>
  )
}
