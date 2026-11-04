import { useState } from "react"
import { CheckCircle2, XCircle, Info, ChevronDown } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, tr, RichText } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

const STATES = ["Karnataka", "Maharashtra", "Punjab", "Uttar Pradesh", "Andhra Pradesh", "Telangana", "Tamil Nadu"]
const CROPS = ["Rice (Paddy)", "Wheat", "Maize", "Sugarcane", "Cotton", "Ragi", "Jowar", "Groundnut", "Soybean"]
const SEASONS = ["Kharif 2026", "Rabi 2026-27", "Zaid 2026"]

export default function EligibilityScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { eligibilityResult, setEligibilityResult } = useInsurance()
  const { open } = useNav()

  const [form, setForm] = useState({ state: "", crop: "", season: "", area: "", ownership: "owned" })
  const [checking, setChecking] = useState(false)

  function check() {
    if (!form.state || !form.crop || !form.season || !form.area) return
    setChecking(true)
    setEligibilityResult("checking")
    setTimeout(() => {
      setEligibilityResult("eligible")
      setChecking(false)
    }, 1800)
  }

  function reset() {
    setEligibilityResult("idle")
    setForm({ state: "", crop: "", season: "", area: "", ownership: "owned" })
  }

  const isIdle = eligibilityResult === "idle" || eligibilityResult === "checking"

  return (
    <DetailShell title={ins.checkEligibility} subtitle={x.elig.subtitle}>
      {isIdle ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-blue-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              {x.elig.info}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800">{x.elig.enterDetails}</h2>

            <SelectField label={x.elig.state} value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} options={STATES} names={x.states} />
            <SelectField label={x.elig.crop} value={form.crop} onChange={(v) => setForm((f) => ({ ...f, crop: v }))} options={CROPS} names={x.crops} />
            <SelectField label={x.elig.season} value={form.season} onChange={(v) => setForm((f) => ({ ...f, season: v }))} options={SEASONS} names={x.seasons} />

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{x.elig.landArea}</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                placeholder={x.elig.areaPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2f7d32] focus:ring-1 focus:ring-[#2f7d32]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{x.elig.ownership}</label>
              <div className="flex gap-3">
                {["owned", "sharecropper", "tenant"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, ownership: opt }))}
                    className={`flex-1 rounded-xl border px-1 py-2 text-xs font-medium transition ${
                      form.ownership === opt
                        ? "border-[#2f7d32] bg-green-50 text-[#2f7d32]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {tr(x.ownership, opt)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={check}
            disabled={!form.state || !form.crop || !form.season || !form.area || checking}
            className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {checking ? x.elig.checking : ins.checkEligibility}
          </button>
        </div>
      ) : eligibilityResult === "eligible" ? (
        <EligibleResult crop={form.crop} season={form.season} onApply={() => open("insurancePlan")} onReset={reset} ins={ins} />
      ) : (
        <NotEligibleResult onReset={reset} ins={ins} />
      )}
    </DetailShell>
  )
}

function SelectField({ label, value, onChange, options, names }: { label: string; value: string; onChange: (v: string) => void; options: string[]; names: Record<string, string> }) {
  const x = useLang().t.x.insurance
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2f7d32] focus:ring-1 focus:ring-[#2f7d32]"
        >
          <option value="">{fmt(x.elig.selectField, { label })}</option>
          {options.map((o) => (
            <option key={o} value={o}>{tr(names, o)}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}

function EligibleResult({ crop, season, onApply, onReset, ins }: { crop: string; season: string; onApply: () => void; onReset: () => void; ins: { eligible: string; applyNow: string; checkEligibility: string } }) {
  const x = useLang().t.x.insurance
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-green-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <p className="mt-3 text-xl font-bold text-green-800">{ins.eligible}!</p>
        <p className="mt-1 text-sm text-green-700">
          <RichText text={fmt(x.elig.eligibleFor, { crop: tr(x.crops, crop), season: tr(x.seasons, season) })} />
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800">{x.elig.whatYouGet}</h3>
        {x.elig.benefits.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={onApply}
        className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
      >
        {ins.applyNow}
      </button>
      <button onClick={onReset} className="w-full py-2 text-sm text-gray-400">
        {x.elig.checkAgain}
      </button>
    </div>
  )
}

function NotEligibleResult({ onReset, ins }: { onReset: () => void; ins: { notEligible: string } }) {
  const x = useLang().t.x.insurance
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-red-50 p-5 text-center">
        <XCircle className="mx-auto h-14 w-14 text-red-400" />
        <p className="mt-3 text-xl font-bold text-red-700">{ins.notEligible}</p>
        <p className="mt-1 text-sm text-red-600">
          {x.elig.notEligibleBody}
        </p>
      </div>
      <button onClick={onReset} className="w-full rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition active:scale-95">
        {x.elig.tryAgain}
      </button>
    </div>
  )
}
