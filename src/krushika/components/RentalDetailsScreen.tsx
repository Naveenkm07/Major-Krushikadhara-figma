import { Phone, MapPin, Truck, Info, XCircle } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText } from "@/krushika/equipment"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"
import { StatusBadge } from "./equipment/ui"

export default function RentalDetailsScreen() {
  const { params } = useNav()
  const { t } = useLang()
  const a = t.x.equipmentA
  const tx = useEquipText()
  const { getRental } = useEquipment()
  const r = getRental(String(params.rentalId))

  if (!r)
    return (
      <DetailShell title={a.rd.title}>
        <p className="py-10 text-center text-sm text-gray-400">{a.rd.notFound}</p>
      </DetailShell>
    )

  const rows = [
    { label: a.rd.owner, value: r.owner },
    { label: a.rd.renter, value: "Naveen Kumar km" },
    { label: a.rd.location, value: r.location },
    { label: a.rd.period, value: `${r.startDate} – ${r.endDate}` },
    { label: a.rd.duration, value: tx.days(r.days) },
    { label: a.rd.price, value: `₹${r.pricePerDay}${a.perDay}` },
  ]

  return (
    <DetailShell title={a.rd.title} subtitle={tx.name(r.equipmentName)}>
      <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="aspect-[16/9] w-full bg-gray-100">
          <img src={r.image} alt={tx.name(r.equipmentName)} className="h-full w-full object-cover" />
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-bold text-gray-800">{tx.name(r.equipmentName)}</p>
            <p className="text-sm text-gray-500">{r.location}</p>
          </div>
          <StatusBadge value={r.status} />
        </div>
      </div>

      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-semibold text-gray-800">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2.5">
            <span className="font-semibold text-gray-700">{a.rd.total}</span>
            <span className="text-lg font-extrabold text-[#256428]">
              ₹{r.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-4 space-y-3">
        <InfoCard icon={Truck} color="text-teal-600" bg="bg-teal-50" title={a.rd.pickupTitle}
          body={a.rd.pickupBody} />
        <InfoCard icon={Info} color="text-blue-500" bg="bg-blue-50" title={a.rd.instrTitle}
          body={a.rd.instrBody} />
        <InfoCard icon={XCircle} color="text-orange-500" bg="bg-orange-50" title={a.rd.cancelTitle}
          body={a.rd.cancelBody} />
      </section>

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-[0.98]">
        <Phone className="h-5 w-5" /> {a.rd.contactOwner}
      </button>
    </DetailShell>
  )
}

function InfoCard({
  icon: Icon,
  color,
  bg,
  title,
  body,
}: {
  icon: typeof Info
  color: string
  bg: string
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </span>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-gray-500">{body}</p>
      </div>
    </div>
  )
}
