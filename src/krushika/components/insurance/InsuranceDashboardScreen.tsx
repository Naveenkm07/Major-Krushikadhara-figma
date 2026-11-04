import { ShieldCheck, FileText, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, RichText } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

export default function InsuranceDashboardScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { applications, policies, claims, documents, unreadCount } = useInsurance()
  const { open } = useNav()

  const activePolicy = policies[0] ?? null
  const pendingApps = applications.filter((a) => a.status !== "policy_issued" && a.status !== "rejected")
  const activeClaims = claims.filter((c) => c.status !== "completed" && c.status !== "rejected")
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverage, 0)

  const stats = [
    { label: x.dashboard.activePolicies, value: String(policies.length), icon: ShieldCheck, color: "bg-green-50 text-green-600", route: "policyDetails" as const },
    { label: x.dashboard.applications, value: String(applications.length), icon: FileText, color: "bg-blue-50 text-blue-600", route: "applicationStatus" as const },
    { label: x.dashboard.claims, value: String(claims.length), icon: AlertTriangle, color: "bg-orange-50 text-orange-600", route: "claimHome" as const },
    { label: x.dashboard.documents, value: String(documents.length), icon: FileText, color: "bg-purple-50 text-purple-600", route: "insuranceDocuments" as const },
  ]

  return (
    <DetailShell title={ins.dashboard} subtitle={x.dashboard.subtitle}>
      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, route }) => (
          <button
            key={label}
            onClick={() => open(route)}
            className="rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-95"
          >
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </button>
        ))}
      </div>

      {/* Coverage summary */}
      {totalCoverage > 0 && (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#2f7d32] to-[#256428] p-4 text-white shadow-md">
          <p className="text-xs text-white/60">{x.dashboard.totalCoverage}</p>
          <p className="mt-1 text-2xl font-bold">₹{totalCoverage.toLocaleString("en-IN")}</p>
          <p className="mt-0.5 text-xs text-white/50">{x.common.demoData}</p>
        </div>
      )}

      {/* Active alerts */}
      {(pendingApps.length > 0 || activeClaims.length > 0) && (
        <div className="mb-4 rounded-2xl bg-amber-50 p-4">
          <p className="mb-2 text-sm font-bold text-amber-800">{x.dashboard.activeItems}</p>
          {pendingApps.length > 0 && (
            <button
              onClick={() => open("applicationStatus")}
              className="flex w-full items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-700">{fmt(pendingApps.length > 1 ? x.dashboard.pendingMany : x.dashboard.pendingOne, { n: pendingApps.length })}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400" />
            </button>
          )}
          {activeClaims.length > 0 && (
            <button
              onClick={() => open("claimHome")}
              className="flex w-full items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-700">{fmt(activeClaims.length > 1 ? x.dashboard.activeClaimMany : x.dashboard.activeClaimOne, { n: activeClaims.length })}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400" />
            </button>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-gray-800">{x.dashboard.quickActions}</h2>
        <div className="space-y-1">
          {[
            { label: ins.checkEligibility, route: "eligibilityCheck" as const, icon: CheckCircle2 },
            { label: ins.applyNow, route: "insurancePlan" as const, icon: FileText },
            { label: ins.makeClaim, route: "claimHome" as const, icon: AlertTriangle },
            { label: ins.documents, route: "insuranceDocuments" as const, icon: FileText },
            { label: ins.importantDates, route: "importantDates" as const, icon: Clock },
            { label: ins.help, route: "insuranceHelp" as const, icon: ShieldCheck },
          ].map(({ label, route, icon: Icon }) => (
            <button
              key={route}
              onClick={() => open(route)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-gray-50 active:scale-[0.98]"
            >
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-sm text-gray-700">{label}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <RichText text={fmt(unreadCount > 1 ? x.dashboard.unreadMany : x.dashboard.unreadOne, { n: unreadCount })} />
          </p>
        </div>
      )}
    </DetailShell>
  )
}
