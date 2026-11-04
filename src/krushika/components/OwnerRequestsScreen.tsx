import { useState } from "react"
import { MapPin, CalendarDays, User } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment } from "@/krushika/equipment"
import DetailShell from "./DetailShell"
import { StatusBadge, ConfirmDialog } from "./equipment/ui"
import { useLang, fmt } from "@/krushika/i18n"
import { localizeName } from "@/krushika/locales/equipmentB"

const rejectReasons = ["booked", "dates", "maintenance", "other"] as const

export default function OwnerRequestsScreen() {
  const { params } = useNav()
  const { t } = useLang()
  const L = t.x.equipmentB
  const { ownerRequests, acceptRequest, rejectRequest } = useEquipment()
  const filterId = params.equipmentId ? String(params.equipmentId) : null

  const [acceptId, setAcceptId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState<(typeof rejectReasons)[number]>(rejectReasons[0])

  const list = filterId
    ? ownerRequests.filter((r) => r.equipmentId === filterId)
    : ownerRequests

  return (
    <DetailShell title={L.requests.title} subtitle={L.requests.subtitle}>
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{r.renter}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-[#2f7d32]" /> {r.location} · {r.distanceKm} km
                </p>
              </div>
              {r.status !== "pending" && <StatusBadge value={r.status} />}
            </div>

            <dl className="space-y-2 py-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{L.requests.equipment}</dt>
                <dd className="font-semibold text-gray-800">{localizeName(r.equipmentName, L.typeNames)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-1 text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5" /> {L.requests.dates}
                </dt>
                <dd className="font-semibold text-gray-800">{r.startDate} – {r.endDate} ({fmt(L.requests.daysShort, { days: r.days })})</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{L.requests.estimated}</dt>
                <dd className="text-base font-extrabold text-[#256428]">₹{r.total.toLocaleString("en-IN")}</dd>
              </div>
            </dl>

            {r.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectId(r.id)}
                  className="flex-1 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-500 transition active:scale-95"
                >
                  {L.requests.reject}
                </button>
                <button
                  onClick={() => setAcceptId(r.id)}
                  className="flex-1 rounded-xl bg-[#2f7d32] py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-600/30 transition active:scale-95"
                >
                  {L.requests.accept}
                </button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">{L.requests.empty}</p>
        )}
      </div>

      <ConfirmDialog
        open={acceptId !== null}
        title={L.requests.acceptTitle}
        body={L.requests.acceptBody}
        confirmLabel={L.requests.acceptConfirm}
        onConfirm={() => {
          if (acceptId) acceptRequest(acceptId)
          setAcceptId(null)
        }}
        onCancel={() => setAcceptId(null)}
      />

      <ConfirmDialog
        open={rejectId !== null}
        title={L.requests.rejectTitle}
        confirmLabel={L.requests.rejectConfirm}
        danger
        extra={
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-gray-600">{L.requests.reasonLabel}</p>
            <div className="flex flex-wrap gap-2">
              {rejectReasons.map((rr) => (
                <button
                  key={rr}
                  onClick={() => setReason(rr)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    reason === rr ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {L.requests.reasons[rr]}
                </button>
              ))}
            </div>
          </div>
        }
        onConfirm={() => {
          if (rejectId) rejectRequest(rejectId)
          setRejectId(null)
        }}
        onCancel={() => setRejectId(null)}
      />
    </DetailShell>
  )
}
