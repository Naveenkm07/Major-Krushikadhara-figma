import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  ChevronRight,
  AlertTriangle,
  Plus,
} from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "./DetailShell"

function AppStatusPill({ status }: { status: string }) {
  const { t } = useLang()
  const styles: Record<string, string> = {
    submitted: "bg-amber-50 text-amber-700",
    under_review: "bg-blue-50 text-blue-700",
    approved: "bg-green-50 text-green-700",
    policy_issued: "bg-green-100 text-green-800",
    rejected: "bg-red-50 text-red-600",
  }
  const labels = t.x.coreB.insurance.status as Record<string, string>
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function CropInsuranceScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.coreB.insurance
  const tr = (map: Record<string, string>, v: string) =>
    v.split(" ").map((w) => map[w] ?? w).join(" ")
  const { applications, policies } = useInsurance()
  const { open } = useNav()

  const activePolicy = policies[0] ?? null
  const latestApp = applications[0] ?? null

  const quickActions = [
    { icon: ShieldCheck, label: ins.checkEligibility, route: "eligibilityCheck" as const, color: "text-green-600 bg-green-50" },
    { icon: FileText, label: ins.documents, route: "insuranceDocuments" as const, color: "text-blue-600 bg-blue-50" },
    { icon: CalendarDays, label: ins.importantDates, route: "importantDates" as const, color: "text-orange-600 bg-orange-50" },
    { icon: HelpCircle, label: ins.help, route: "insuranceHelp" as const, color: "text-purple-600 bg-purple-50" },
    { icon: LayoutDashboard, label: ins.dashboard, route: "insuranceDashboard" as const, color: "text-indigo-600 bg-indigo-50" },
  ]

  return (
    <DetailShell title={ins.title} subtitle={ins.subtitle}>
      {/* Active policy card */}
      {activePolicy ? (
        <button
          onClick={() => open("policyDetails", { policyId: activePolicy.id })}
          className="mb-4 w-full rounded-2xl bg-gradient-to-br from-[#2f7d32] to-[#256428] p-4 text-left text-white shadow-md transition active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs text-white/70">{x.activePolicy}</p>
                <p className="font-bold">{activePolicy.policyNumber}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/60" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-white/10 p-3">
            <div className="text-center">
              <p className="text-xs text-white/60">{x.crop}</p>
              <p className="text-sm font-semibold">{tr(x.crops, activePolicy.crop)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/60">{x.coverage}</p>
              <p className="text-sm font-semibold">₹{(activePolicy.coverage / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/60">{x.season}</p>
              <p className="text-sm font-semibold">{tr(x.seasons, activePolicy.season)}</p>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/50">{x.demoShort}</p>
        </button>
      ) : (
        /* No policy banner */
        <div className="mb-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
            <ShieldCheck className="h-7 w-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700">{ins.noPolicies}</p>
          <p className="mt-1 text-xs text-gray-400">
            {x.noPolicyHint}
          </p>
        </div>
      )}

      {/* Pending application card */}
      {latestApp && latestApp.status !== "policy_issued" && (
        <button
          onClick={() => open("applicationStatus", { appId: latestApp.id })}
          className="mb-4 w-full rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <Clock className="h-5 w-5 text-amber-500" />
              </span>
              <div>
                <p className="text-xs text-gray-400">{fmt(x.application, { crop: tr(x.crops, latestApp.crop) })}</p>
                <p className="text-sm font-semibold text-gray-800">{tr(x.seasons, latestApp.season)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AppStatusPill status={latestApp.status} />
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>
        </button>
      )}

      {/* Primary CTA row */}
      <div className="mb-5 flex gap-3">
        {latestApp ? (
          <>
            <button
              onClick={() => open("claimHome")}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition active:scale-95"
            >
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {ins.makeClaim}
            </button>
            <button
              onClick={() => open("applicationStatus", { appId: latestApp.id })}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3 text-sm font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              {ins.trackApp}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => open("eligibilityCheck")}
              className="flex-1 rounded-2xl border border-[#2f7d32] bg-white py-3 text-sm font-semibold text-[#2f7d32] transition active:scale-95"
            >
              {ins.checkEligibility}
            </button>
            <button
              onClick={() => open("insurancePlan")}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3 text-sm font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {ins.applyNow}
            </button>
          </>
        )}
      </div>

      {/* Quick actions */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-gray-800">{x.moreOptions}</h2>
        <div className="divide-y divide-gray-50">
          {quickActions.map(({ icon: Icon, label, route, color }) => (
            <button
              key={route}
              onClick={() => open(route)}
              className="flex w-full items-center gap-3 py-3 text-left transition active:scale-[0.98]"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </button>
          ))}
        </div>
      </section>

      {/* Info card */}
      <div className="mt-4 rounded-2xl bg-green-50 p-4">
        <p className="text-xs font-semibold text-green-800">{x.aboutTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-green-700">
          {x.aboutBody}
        </p>
      </div>
    </DetailShell>
  )
}
