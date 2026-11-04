import { AlertTriangle, ChevronRight } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, tr, type ClaimStatus } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

export default function ClaimDetailsScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { claims } = useInsurance()
  const { params, open } = useNav()

  const claimId = params.claimId as string | undefined
  const claim = claimId ? claims.find((c) => c.id === claimId) : claims[0]

  if (!claim) {
    return (
      <DetailShell title={x.claimDetails.title} subtitle="">
        <div className="py-16 text-center text-gray-400">
          <p className="font-semibold">{ins.noClaims}</p>
        </div>
      </DetailShell>
    )
  }

  const rows = [
    { label: x.claimDetails.claimNumber, value: claim.claimNumber },
    { label: x.claimDetails.policyNumber, value: claim.policyNumber },
    { label: x.claimDetails.crop, value: tr(x.crops, claim.crop) },
    { label: x.claimDetails.lossType, value: tr(ins.lossTypes, claim.lossType) },
    { label: x.claimDetails.incidentDate, value: claim.incidentDate },
    { label: x.claimDetails.affectedArea, value: fmt(x.common.acres, { n: claim.area }) },
    { label: x.claimDetails.submittedOn, value: claim.submittedDate },
    { label: x.claimDetails.status, value: x.claimStatus[claim.status] },
  ]

  return (
    <DetailShell title={x.claimDetails.title} subtitle={claim.claimNumber}>
      {/* Demo note */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700">{ins.demoNote}</p>
      </div>

      {/* Details card */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm divide-y divide-gray-50">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-3">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-gray-700">{value}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      {claim.description && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium text-gray-400">{x.claimDetails.lossDescription}</p>
          <p className="text-sm leading-relaxed text-gray-700">{claim.description}</p>
        </div>
      )}

      {/* Track */}
      <button
        onClick={() => open("claimTracking", { claimId: claim.id })}
        className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition active:scale-95"
      >
        <span className="font-semibold text-gray-700">{x.claimDetails.trackProgress}</span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </button>

      {/* Status info */}
      <ClaimStatusInfo status={claim.status} />
    </DetailShell>
  )
}

function ClaimStatusInfo({ status }: { status: ClaimStatus }) {
  const infos = useLang().t.x.insurance.claimDetails.info
  const colors: Record<ClaimStatus, string> = {
    submitted: "bg-amber-50 text-amber-800",
    initial_review: "bg-blue-50 text-blue-800",
    field_assessment: "bg-indigo-50 text-indigo-800",
    approved: "bg-green-50 text-green-800",
    payment_processing: "bg-purple-50 text-purple-800",
    completed: "bg-green-50 text-green-800",
    rejected: "bg-red-50 text-red-800",
  }

  const info = infos[status]
  if (!info) return null

  return (
    <div className={`mt-4 rounded-2xl p-4 ${colors[status]}`}>
      <p className="font-semibold text-sm">{info.title}</p>
      <p className="mt-1 text-xs leading-relaxed">{info.body}</p>
    </div>
  )
}
