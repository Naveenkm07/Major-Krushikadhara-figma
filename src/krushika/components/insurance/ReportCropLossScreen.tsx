import { useState } from "react"
import { CheckCircle2, ChevronRight, ChevronDown } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, tr, RichText } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

type Step = "details" | "description" | "review"

export default function ReportCropLossScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const L = x.loss
  const { policies, submitClaim } = useInsurance()
  const { open, back } = useNav()

  const policy = policies[0]

  const [step, setStep] = useState<Step>("details")
  const [form, setForm] = useState({
    lossType: "",
    incidentDate: "",
    area: "",
    description: "",
    photosTaken: false,
    bankNotified: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [claimId, setClaimId] = useState("")

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit() {
    if (!policy) return
    const id = submitClaim({
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      crop: policy.crop,
      lossType: form.lossType,
      incidentDate: form.incidentDate,
      area: form.area,
      description: form.description,
    })
    setClaimId(id)
    setSubmitted(true)
  }

  if (!policy) {
    return (
      <DetailShell title={ins.reportLoss} subtitle={L.noPolicySub}>
        <div className="py-16 text-center text-gray-400">
          <p className="font-semibold">{L.noPolicyTitle}</p>
          <p className="mt-1 text-xs">{L.noPolicyBody}</p>
        </div>
      </DetailShell>
    )
  }

  if (submitted) {
    return (
      <DetailShell title={ins.reportLoss} subtitle={L.submittedSub}>
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <p className="mt-4 text-xl font-bold text-gray-800">{L.submittedTitle}</p>
          <p className="mt-2 text-sm text-gray-500">
            {L.submittedBody}
          </p>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-left">
            <p className="text-xs font-semibold text-amber-700">{L.nextSteps}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-amber-600">
              {L.next.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[10px] text-gray-400">{L.demoSubmitted}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => open("claimTracking", { claimId })}
              className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
            >
              {ins.trackClaim}
            </button>
            <button onClick={back} className="w-full py-2 text-sm text-gray-400">
              {L.back}
            </button>
          </div>
        </div>
      </DetailShell>
    )
  }

  const steps: Step[] = ["details", "description", "review"]
  const stepIdx = steps.indexOf(step)

  return (
    <DetailShell title={ins.reportLoss} subtitle={fmt(x.common.stepOf, { n: stepIdx + 1, total: 3 })}>
      {/* Progress */}
      <div className="mb-5 flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= stepIdx ? "bg-orange-500" : "bg-gray-200"}`} />
        ))}
      </div>

      {/* Policy reference */}
      <div className="mb-4 rounded-xl bg-green-50 px-4 py-2.5">
        <p className="text-xs text-green-700">
          <RichText text={fmt(L.policyRef, { policy: policy.policyNumber, crop: tr(x.crops, policy.crop), season: tr(x.seasons, policy.season) })} />
        </p>
      </div>

      {step === "details" && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">{L.lossType}</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ins.lossTypes).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => set("lossType", key)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                    form.lossType === key
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">{L.incidentDate}</label>
            <input
              type="text"
              value={form.incidentDate}
              onChange={(e) => set("incidentDate", e.target.value)}
              placeholder={L.datePh}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">{L.affectedArea}</label>
            <input
              type="number"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder={L.areaPh}
              min="0.1"
              step="0.1"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <button
            onClick={() => setStep("description")}
            disabled={!form.lossType || !form.incidentDate || !form.area}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-semibold text-white shadow-md shadow-orange-400/30 transition active:scale-95 disabled:opacity-50"
          >
            {x.common.continue} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === "description" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">{L.describe}</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={L.describePh}
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div className="space-y-3">
            {[
              { key: "photosTaken" as const, label: L.photos },
              { key: "bankNotified" as const, label: L.bankNotified },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => set(key, !form[key])}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  form[key] ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${form[key] ? "bg-green-500" : "bg-gray-100"}`}>
                  {form[key] && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("details")}
              className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition active:scale-95"
            >
              {x.common.back}
            </button>
            <button
              onClick={() => setStep("review")}
              disabled={!form.description}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 font-semibold text-white shadow-md shadow-orange-400/30 transition active:scale-95 disabled:opacity-50"
            >
              {x.common.review} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-xs text-amber-700">{L.demoReview}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm divide-y divide-gray-50">
            {[
              { label: L.rPolicy, value: policy.policyNumber },
              { label: L.rCrop, value: tr(x.crops, policy.crop) },
              { label: L.rLoss, value: form.lossType ? tr(ins.lossTypes, form.lossType) : "" },
              { label: L.rDate, value: form.incidentDate },
              { label: L.rArea, value: fmt(x.common.acres, { n: form.area }) },
              { label: L.rPhotos, value: form.photosTaken ? x.common.yes : x.common.no },
              { label: L.rBank, value: form.bankNotified ? x.common.yes : x.common.no },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-700">{value}</span>
              </div>
            ))}
          </div>
          {form.description && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-1 text-xs text-gray-400">{L.rDesc}</p>
              <p className="text-sm leading-relaxed text-gray-700">{form.description}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("description")}
              className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition active:scale-95"
            >
              {x.common.back}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-2xl bg-orange-500 py-3 font-semibold text-white shadow-md shadow-orange-400/30 transition active:scale-95"
            >
              {ins.submitClaim}
            </button>
          </div>
        </div>
      )}

      <div className="hidden">
        <ChevronDown />
      </div>
    </DetailShell>
  )
}
