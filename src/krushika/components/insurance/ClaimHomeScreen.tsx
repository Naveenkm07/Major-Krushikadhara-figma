import { AlertTriangle, ChevronRight, Plus, Clock } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, tr, type ClaimStatus } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

const claimStatusStyle: Record<ClaimStatus, string> = {
  submitted: "bg-amber-50 text-amber-700",
  initial_review: "bg-blue-50 text-blue-700",
  field_assessment: "bg-indigo-50 text-indigo-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  payment_processing: "bg-purple-50 text-purple-700",
  completed: "bg-gray-100 text-gray-600",
}

export default function ClaimHomeScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { claims, policies } = useInsurance()
  const { open } = useNav()

  const hasPolicy = policies.length > 0

  return (
    <DetailShell title={ins.makeClaim} subtitle={x.claimHome.subtitle}>
      {/* Warning card */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-orange-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
        <div>
          <p className="text-sm font-semibold text-orange-800">{x.claimHome.warnTitle}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-orange-700">
            {x.claimHome.warnBody}
          </p>
        </div>
      </div>

      {/* Report new loss button */}
      {hasPolicy ? (
        <button
          onClick={() => open("reportCropLoss")}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-semibold text-white shadow-md shadow-orange-400/30 transition active:scale-95"
        >
          <Plus className="h-5 w-5" />
          {ins.reportLoss}
        </button>
      ) : (
        <div className="mb-5 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-4 text-center">
          <p className="text-sm font-semibold text-gray-600">{x.claimHome.noPolicy}</p>
          <p className="mt-1 text-xs text-gray-400">{x.claimHome.noPolicyHint}</p>
          <button
            onClick={() => open("insurancePlan")}
            className="mt-3 rounded-xl bg-[#2f7d32] px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95"
          >
            {x.claimHome.applyIns}
          </button>
        </div>
      )}

      {/* Claims list */}
      <h2 className="mb-3 font-bold text-gray-800">{x.claimHome.myClaims}</h2>

      {claims.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
          <Clock className="mx-auto h-10 w-10 text-gray-200" />
          <p className="mt-3 text-sm font-semibold text-gray-500">{ins.noClaims}</p>
          <p className="mt-1 text-xs text-gray-400">{x.claimHome.emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <button
              key={claim.id}
              onClick={() => open("claimDetails", { claimId: claim.id })}
              className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{tr(x.crops, claim.crop)}</p>
                  <p className="text-xs text-gray-400">{fmt(x.common.lossDot, { type: tr(ins.lossTypes, claim.lossType), date: claim.incidentDate })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${claimStatusStyle[claim.status]}`}>
                  {x.claimStatus[claim.status]}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </DetailShell>
  )
}
