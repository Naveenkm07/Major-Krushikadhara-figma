import type { ReactNode } from "react"
import { Star } from "lucide-react"
import type { Availability, RentalStatus, RequestStatus } from "@/krushika/equipment"
import { useLang } from "@/krushika/i18n"

export function AvailabilityBadge({ value }: { value: Availability }) {
  const { t } = useLang()
  const available = value === "available"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        available ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-green-500" : "bg-gray-400"}`} />
      {available ? t.x.equipmentA.available : t.x.equipmentA.booked}
    </span>
  )
}

const statusStyle: Record<RentalStatus | RequestStatus, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  active: "bg-blue-50 text-blue-600",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-gray-100 text-gray-400",
  rejected: "bg-red-50 text-red-500",
}

export function StatusBadge({ value }: { value: RentalStatus | RequestStatus }) {
  const { t } = useLang()
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[value]}`}>
      {t.x.equipmentA.status[value]}
    </span>
  )
}

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  const { t } = useLang()
  if (!rating) return <span className="text-xs text-gray-400">{t.x.equipmentA.newListing}</span>
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {reviews != null && <span className="text-gray-400">({reviews})</span>}
    </span>
  )
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  extra,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body?: string
  confirmLabel: string
  danger?: boolean
  extra?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useLang()
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {body && <p className="mt-1 text-sm text-gray-500">{body}</p>}
        {extra}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition active:scale-95"
          >
            {t.x.equipmentA.cancel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-2xl py-3 font-semibold text-white shadow-md transition active:scale-95 ${
              danger ? "bg-red-500 shadow-red-500/30" : "bg-[#2f7d32] shadow-green-600/30"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
