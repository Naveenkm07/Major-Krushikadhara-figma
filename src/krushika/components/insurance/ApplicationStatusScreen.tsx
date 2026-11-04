import { CheckCircle2, Clock, XCircle, ChevronRight, RefreshCw } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, APP_STATUS_STEPS, tr, type AppStatus } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

export default function ApplicationStatusScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { applications, advanceApplicationStatus } = useInsurance()
  const { params, open } = useNav()

  const appId = params.appId as string | undefined
  const app = appId ? applications.find((a) => a.id === appId) : applications[0]

  if (!app) {
    return (
      <DetailShell title={ins.trackApp} subtitle={x.appStatusScreen.subtitle}>
        <div className="py-16 text-center text-gray-400">
          <Clock className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-3 font-semibold">{ins.noApplications}</p>
          <button onClick={() => open("insurancePlan")} className="mt-4 rounded-2xl bg-[#2f7d32] px-6 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95">
            {ins.applyNow}
          </button>
        </div>
      </DetailShell>
    )
  }

  const isRejected = app.status === "rejected"
  const isComplete = app.status === "policy_issued"
  const canAdvance = !isRejected && !isComplete

  return (
    <DetailShell title={ins.trackApp} subtitle={fmt(x.common.cropSeason, { crop: tr(x.crops, app.crop), season: tr(x.seasons, app.season) })}>
      {/* Summary card */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{x.appStatusScreen.cropSeason}</p>
            <p className="font-bold text-gray-800">{fmt(x.common.cropSeason, { crop: tr(x.crops, app.crop), season: tr(x.seasons, app.season) })}</p>
          </div>
          <StatusPill status={app.status} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">{x.appStatusScreen.area}</p>
            <p className="text-sm font-semibold text-gray-700">{fmt(x.common.ac, { n: app.area })}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">{x.appStatusScreen.coverage}</p>
            <p className="text-sm font-semibold text-gray-700">₹{(app.coverage / 1000).toFixed(0)}K</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">{x.appStatusScreen.premium}</p>
            <p className="text-sm font-semibold text-gray-700">₹{app.premium}</p>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400">{x.appStatusScreen.demoAmounts}</p>
      </div>

      {/* Timeline */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-800">{x.appStatusScreen.progress}</h2>
        <div className="space-y-0">
          {APP_STATUS_STEPS.map(({ key }, idx) => {
            const currentIdx = APP_STATUS_STEPS.findIndex((s) => s.key === app.status)
            const isDone = idx < currentIdx || (app.status === key)
            const isActive = app.status === key
            const isFuture = idx > currentIdx

            return (
              <div key={key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    isRejected && isActive
                      ? "border-red-400 bg-red-50"
                      : isDone || isActive
                        ? "border-[#2f7d32] bg-[#2f7d32]"
                        : "border-gray-200 bg-white"
                  }`}>
                    {isRejected && isActive ? (
                      <XCircle className="h-4 w-4 text-red-400" />
                    ) : isDone || isActive ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                    )}
                  </div>
                  {idx < APP_STATUS_STEPS.length - 1 && (
                    <div className={`mt-1 w-0.5 flex-1 rounded-full ${isDone ? "bg-[#2f7d32]" : "bg-gray-100"}`} style={{ minHeight: 28 }} />
                  )}
                </div>
                <div className={`pb-5 pt-1 ${isFuture ? "opacity-40" : ""}`}>
                  <p className={`text-sm font-semibold ${isActive ? "text-[#2f7d32]" : "text-gray-700"}`}>{x.appSteps[key]}</p>
                  {isActive && !isRejected && (
                    <p className="mt-0.5 text-xs text-gray-400">{x.common.inProgress}</p>
                  )}
                  {isActive && isRejected && (
                    <p className="mt-0.5 text-xs text-red-400">{x.appStatusScreen.rejectedNote}</p>
                  )}
                  {key === "policy_issued" && app.status === "policy_issued" && (
                    <p className="mt-0.5 text-xs text-green-600">{x.appStatusScreen.issuedNote}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simulate progress button (demo) */}
      {canAdvance && (
        <div className="mb-4 rounded-2xl bg-gray-50 p-4">
          <p className="mb-2 text-xs text-gray-500">
            {x.appStatusScreen.demoAdvance}
          </p>
          <button
            onClick={() => advanceApplicationStatus(app.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition active:scale-95"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
            {x.common.simulate}
          </button>
        </div>
      )}

      {/* Policy issued CTA */}
      {app.status === "policy_issued" && (
        <button
          onClick={() => open("policyDetails")}
          className="mb-4 flex w-full items-center justify-between rounded-2xl bg-green-50 p-4 transition active:scale-95"
        >
          <div>
            <p className="font-semibold text-green-800">{ins.myPolicy}</p>
            <p className="text-xs text-green-600">{x.appStatusScreen.viewPolicyHint}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-green-500" />
        </button>
      )}

      {/* Details */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{x.appStatusScreen.detailsTitle}</h2>
        {[
          { label: x.appStatusScreen.farmerName, value: app.farmerName },
          { label: x.appStatusScreen.mobile, value: app.mobile },
          { label: x.appStatusScreen.district, value: app.district },
          { label: x.appStatusScreen.taluk, value: app.taluk },
          { label: x.appStatusScreen.surveyNo, value: app.surveyNumber },
          { label: x.appStatusScreen.ownership, value: tr(x.ownership, app.ownershipType) },
          { label: x.appStatusScreen.submitted, value: app.submittedDate },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-gray-700">{value}</span>
          </div>
        ))}
      </div>
    </DetailShell>
  )
}

function StatusPill({ status }: { status: AppStatus }) {
  const styles: Record<AppStatus, string> = {
    submitted: "bg-amber-50 text-amber-700",
    under_review: "bg-blue-50 text-blue-700",
    approved: "bg-green-50 text-green-700",
    policy_issued: "bg-green-100 text-green-800",
    rejected: "bg-red-50 text-red-600",
  }
  const labels = useLang().t.x.insurance.appStatus
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
