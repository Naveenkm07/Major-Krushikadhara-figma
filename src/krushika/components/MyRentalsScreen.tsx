import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText, type RentalStatus } from "@/krushika/equipment"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"
import { StatusBadge, ConfirmDialog } from "./equipment/ui"

const tabKeys: ("all" | RentalStatus)[] = ["all", "pending", "approved", "active", "completed"]

export default function MyRentalsScreen() {
  const { open } = useNav()
  const { t } = useLang()
  const a = t.x.equipmentA
  const tx = useEquipText()
  const tabs = tabKeys.map((key) => ({
    key,
    label: key === "all" ? a.my.all : a.status[key].replace(" ✓", ""),
  }))
  const { rentals, cancelRental } = useEquipment()
  const [tab, setTab] = useState<"all" | RentalStatus>("all")
  const [cancelId, setCancelId] = useState<string | null>(null)

  const list = tab === "all" ? rentals : rentals.filter((r) => r.status === tab)

  function actionFor(status: RentalStatus, id: string) {
    if (status === "pending")
      return { label: a.my.cancelRequest, danger: true, onClick: () => setCancelId(id) }
    if (status === "approved")
      return { label: a.my.viewDetails, onClick: () => open("rentalDetails", { rentalId: id }) }
    if (status === "active")
      return { label: a.my.viewRental, onClick: () => open("rentalDetails", { rentalId: id }) }
    if (status === "completed") return { label: a.my.rate, onClick: () => {} }
    return null
  }

  return (
    <DetailShell title={a.my.title} subtitle={a.my.subtitle}>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              tab === t.key ? "bg-[#2f7d32] text-white" : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((r) => {
          const action = actionFor(r.status, r.id)
          return (
            <div key={r.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img src={r.image} alt={tx.name(r.equipmentName)} className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-800">{tx.name(r.equipmentName)}</p>
                    <StatusBadge value={r.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5 text-[#2f7d32]" /> {r.startDate} – {r.endDate}
                  </p>
                  <p className="mt-auto pt-1 text-lg font-bold text-gray-800">
                    ₹{r.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {action && (
                <div className="border-t border-gray-100 px-3 py-2">
                  <button
                    onClick={action.onClick}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
                      action.danger
                        ? "border border-red-200 bg-white text-red-500"
                        : "bg-[#2f7d32] text-white shadow-sm shadow-green-600/30"
                    }`}
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">{a.my.none}</p>
        )}
      </div>

      <ConfirmDialog
        open={cancelId !== null}
        title={a.my.cancelTitle}
        body={a.my.cancelBody}
        confirmLabel={a.my.cancelRequest}
        danger
        onConfirm={() => {
          if (cancelId) cancelRental(cancelId)
          setCancelId(null)
        }}
        onCancel={() => setCancelId(null)}
      />
    </DetailShell>
  )
}
