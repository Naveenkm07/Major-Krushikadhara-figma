import { ShieldCheck, AlertTriangle, Download, Calendar } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, tr } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

export default function PolicyScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { policies } = useInsurance()
  const { params, open } = useNav()

  const policyId = params.policyId as string | undefined
  const policy = policyId ? policies.find((p) => p.id === policyId) : policies[0]

  if (!policy) {
    return (
      <DetailShell title={ins.myPolicy} subtitle={x.policy.subtitle}>
        <div className="py-16 text-center text-gray-400">
          <ShieldCheck className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-3 font-semibold">{ins.noPolicies}</p>
          <button
            onClick={() => open("insurancePlan")}
            className="mt-4 rounded-2xl bg-[#2f7d32] px-6 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95"
          >
            {ins.applyNow}
          </button>
        </div>
      </DetailShell>
    )
  }

  return (
    <DetailShell title={ins.myPolicy} subtitle={x.policy.pmfbyPolicy}>
      {/* Demo banner */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700">{ins.demoNote}</p>
      </div>

      {/* Policy hero */}
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#2f7d32] to-[#256428] p-5 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/60">{x.policy.policyNumber}</p>
            <p className="text-lg font-bold">{policy.policyNumber}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <ShieldCheck className="h-6 w-6" />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-white/60">{x.policy.coverage}</p>
            <p className="font-bold">₹{policy.coverage.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-white/60">{x.policy.premiumPaid}</p>
            <p className="font-bold">₹{policy.premium.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-800">{x.policy.detailsTitle}</h2>
        {[
          { label: x.policy.farmerName, value: policy.farmerName },
          { label: x.policy.crop, value: tr(x.crops, policy.crop) },
          { label: x.policy.season, value: tr(x.seasons, policy.season) },
          { label: x.policy.landArea, value: fmt(x.common.acres, { n: policy.area }) },
          { label: x.policy.district, value: policy.district },
          { label: x.policy.coverageAmount, value: `₹${policy.coverage.toLocaleString("en-IN")}` },
          { label: x.policy.premiumAmount, value: `₹${policy.premium.toLocaleString("en-IN")}` },
          { label: x.policy.validFrom, value: policy.startDate },
          { label: x.policy.validUntil, value: policy.endDate },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-gray-700">{value}</span>
          </div>
        ))}
      </div>

      {/* Validity bar */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2f7d32]" />
            <span className="text-sm font-semibold text-gray-700">{x.policy.validity}</span>
          </div>
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{x.common.active}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{policy.startDate}</span>
          <span>{policy.endDate}</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-gray-100">
          <div className="h-2 w-1/3 rounded-full bg-gradient-to-r from-[#2f7d32] to-green-400" />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => open("claimHome")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-semibold text-white shadow-md shadow-orange-500/30 transition active:scale-95"
        >
          <AlertTriangle className="h-4 w-4" />
          {ins.reportLoss}
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 shadow-sm transition active:scale-95">
          <Download className="h-4 w-4 text-gray-500" />
          {x.policy.download}
        </button>
      </div>
    </DetailShell>
  )
}
