import { CheckCircle2, Clock, CalendarDays, IndianRupee } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText } from "@/krushika/equipment"
import { useLang, fmt } from "@/krushika/i18n"

export default function RequestSentScreen() {
  const { params, open, reset } = useNav()
  const { t } = useLang()
  const a = t.x.equipmentA
  const tx = useEquipText()
  const { getRental } = useEquipment()
  const rental = getRental(String(params.rentalId))

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#f7f8ec] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(4rem,calc(env(safe-area-inset-top)+2rem))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-11 w-11 text-[#2f7d32]" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-[#256428]">{a.sent.title}</h1>

        {rental && (
          <div className="mt-6 w-full rounded-2xl bg-white p-5 text-left shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                <img src={rental.image} alt={tx.name(rental.equipmentName)} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{tx.name(rental.equipmentName)}</p>
                <p className="text-sm text-gray-500">{fmt(a.ownerLabel, { name: rental.owner })}</p>
              </div>
            </div>
            <dl className="space-y-2.5 pt-4 text-sm">
              <Row icon={Clock} label={a.sent.status} value={a.sent.waiting} amber />
              <Row icon={CalendarDays} label={a.sent.dates} value={`${rental.startDate} – ${rental.endDate}`} />
              <Row icon={IndianRupee} label={a.sent.amount} value={`₹${rental.total.toLocaleString("en-IN")}`} />
            </dl>
          </div>
        )}

        <p className="mt-5 text-sm leading-relaxed text-gray-500">
          {a.sent.willNotify}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            reset()
            open("myRentals")
          }}
          className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-[0.98]"
        >
          {a.sent.viewStatus}
        </button>
        <button
          onClick={reset}
          className="w-full rounded-2xl py-3 font-semibold text-gray-500 transition active:scale-95"
        >
          {a.sent.home}
        </button>
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  amber,
}: {
  icon: typeof Clock
  label: string
  value: string
  amber?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${amber ? "text-amber-500" : "text-[#2f7d32]"}`} />
      <span className="text-gray-500">{label}</span>
      <span className={`ml-auto text-right font-semibold ${amber ? "text-amber-600" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  )
}
