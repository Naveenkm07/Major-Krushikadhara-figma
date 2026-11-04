import { CheckCircle2, XCircle, RefreshCw, ChevronRight } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, CLAIM_STATUS_STEPS, tr, type ClaimStatus } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

export default function ClaimTrackingScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { claims, advanceClaimStatus } = useInsurance()
  const { params, open } = useNav()

  const claimId = params.claimId as string | undefined
  const claim = claimId ? claims.find((c) => c.id === claimId) : claims[0]

  if (!claim) {
    return (
      <DetailShell title={ins.trackClaim} subtitle={x.tracking.subtitle}>
        <div className="py-16 text-center text-gray-400">
          <p className="font-semibold">{ins.noClaims}</p>
        </div>
      </DetailShell>
    )
  }

  const isComplete = claim.status === "completed"
  const isRejected = claim.status === "rejected"
  const canAdvance = !isComplete && !isRejected
  const currentIdx = CLAIM_STATUS_STEPS.findIndex((s) => s.key === claim.status)

  return (
    <DetailShell title={ins.trackClaim} subtitle={fmt(x.common.claimOf, { number: claim.claimNumber })}>
      {/* Summary */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{x.tracking.claimNumber}</p>
            <p className="font-bold text-gray-800">{claim.claimNumber}</p>
          </div>
          <ClaimPill status={claim.status} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-center">
          <div>
            <p className="text-xs text-gray-400">{x.tracking.crop}</p>
            <p className="text-sm font-semibold text-gray-700">{tr(x.crops, claim.crop)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{x.tracking.lossType}</p>
            <p className="text-sm font-semibold text-gray-700">{tr(ins.lossTypes, claim.lossType)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{x.tracking.area}</p>
            <p className="text-sm font-semibold text-gray-700">{fmt(x.common.ac, { n: claim.area })}</p>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">{x.common.demoData}</p>
      </div>

      {/* Timeline */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-800">{x.tracking.progress}</h2>
        <div className="space-y-0">
          {CLAIM_STATUS_STEPS.map(({ key }, idx) => {
            const isDone = idx <= currentIdx
            const isActive = claim.status === key
            const isFuture = idx > currentIdx

            return (
              <div key={key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    isRejected && isActive
                      ? "border-red-400 bg-red-50"
                      : isDone
                        ? "border-[#2f7d32] bg-[#2f7d32]"
                        : "border-gray-200 bg-white"
                  }`}>
                    {isRejected && isActive ? (
                      <XCircle className="h-4 w-4 text-red-400" />
                    ) : isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                    )}
                  </div>
                  {idx < CLAIM_STATUS_STEPS.length - 1 && (
                    <div
                      className={`mt-1 w-0.5 flex-1 rounded-full ${isDone && !isActive ? "bg-[#2f7d32]" : "bg-gray-100"}`}
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>
                <div className={`pb-5 pt-1 ${isFuture ? "opacity-40" : ""}`}>
                  <p className={`text-sm font-semibold ${isActive ? "text-[#2f7d32]" : "text-gray-700"}`}>{x.claimSteps[key]}</p>
                  {isActive && !isRejected && <p className="mt-0.5 text-xs text-gray-400">{x.common.inProgress}</p>}
                  {key === "payment_processing" && isDone && !isFuture && (
                    <p className="mt-0.5 text-xs text-purple-600">{x.tracking.paymentNote}</p>
                  )}
                  {key === "completed" && isDone && (
                    <p className="mt-0.5 text-xs text-green-600">{x.tracking.completedNote}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Demo advance button */}
      {canAdvance && (
        <div className="mb-4 rounded-2xl bg-gray-50 p-4">
          <p className="mb-2 text-xs text-gray-500">
            {x.tracking.demoAdvance}
          </p>
          <button
            onClick={() => advanceClaimStatus(claim.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition active:scale-95"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
            {x.common.simulate}
          </button>
        </div>
      )}

      {/* View full details */}
      <button
        onClick={() => open("claimDetails", { claimId: claim.id })}
        className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition active:scale-95"
      >
        <span className="font-semibold text-gray-700">{x.tracking.viewFull}</span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </button>
    </DetailShell>
  )
}

function ClaimPill({ status }: { status: ClaimStatus }) {
  const styles: Record<ClaimStatus, string> = {
    submitted: "bg-amber-50 text-amber-700",
    initial_review: "bg-blue-50 text-blue-700",
    field_assessment: "bg-indigo-50 text-indigo-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-600",
    payment_processing: "bg-purple-50 text-purple-700",
    completed: "bg-gray-100 text-gray-600",
  }
  const labels = useLang().t.x.insurance.claimPill
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
