import { useState } from "react"
import { ChevronRight, CheckCircle2 } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useInsurance, tr } from "@/krushika/insurance"
import { useNav } from "@/krushika/nav"
import DetailShell from "@/krushika/components/DetailShell"

type StepKey = "farmer" | "land" | "crop" | "documents" | "review"
const STEP_KEYS: StepKey[] = ["farmer", "land", "crop", "documents", "review"]

type FormData = {
  farmerName: string
  mobile: string
  aadhaar: string
  state: string
  district: string
  taluk: string
  village: string
  surveyNumber: string
  area: string
  ownershipType: string
  crop: string
  season: string
  sowingDate: string
  harvestDate: string
  bankName: string
  accountNumber: string
  ifsc: string
  aadhaarDoc: boolean
  landDoc: boolean
  bankDoc: boolean
}

const INITIAL: FormData = {
  farmerName: "", mobile: "", aadhaar: "", state: "Karnataka", district: "Mandya",
  taluk: "", village: "", surveyNumber: "", area: "", ownershipType: "Owned",
  crop: "", season: "Kharif 2026", sowingDate: "", harvestDate: "",
  bankName: "", accountNumber: "", ifsc: "",
  aadhaarDoc: false, landDoc: false, bankDoc: false,
}

const CROPS = ["Rice (Paddy)", "Wheat", "Maize", "Sugarcane", "Cotton", "Ragi", "Jowar", "Groundnut"]

export default function InsuranceApplicationScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { submitApplication } = useInsurance()
  const { open, back } = useNav()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [appId, setAppId] = useState("")

  function set(key: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function next() {
    if (step < STEP_KEYS.length - 1) setStep((s) => s + 1)
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1)
  }

  function submit() {
    const id = submitApplication({
      farmerName: form.farmerName || "Naveen Kumar KM",
      mobile: form.mobile || "9876543210",
      crop: form.crop || "Rice (Paddy)",
      season: form.season,
      district: form.district,
      taluk: form.taluk || "Mandya",
      area: form.area || "2.0",
      surveyNumber: form.surveyNumber || "SY-001",
      ownershipType: form.ownershipType,
      sowingDate: form.sowingDate || "1 Jun 2026",
      harvestDate: form.harvestDate || "15 Oct 2026",
    })
    setAppId(id)
    setSubmitted(true)
  }

  const stepLabel = ins.steps[STEP_KEYS[step]]

  if (submitted) {
    return (
      <DetailShell title={ins.submitApp} subtitle={x.apply.submittedSub}>
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <p className="mt-4 text-xl font-bold text-gray-800">{x.apply.submittedTitle}</p>
          <p className="mt-2 text-sm text-gray-500">
            {x.apply.submittedBody}
          </p>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-left">
            <p className="text-xs font-semibold text-amber-700">{x.apply.whatNext}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-amber-600">
              {x.apply.next.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[10px] text-gray-400">{x.apply.demoSubmitted}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => open("applicationStatus", { appId })}
              className="w-full rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
            >
              {ins.trackApp}
            </button>
            <button onClick={back} className="w-full py-2 text-sm text-gray-400">
              {x.apply.backToIns}
            </button>
          </div>
        </div>
      </DetailShell>
    )
  }

  return (
    <DetailShell title={ins.startApp} subtitle={fmt(x.common.stepOfNamed, { n: step + 1, total: STEP_KEYS.length, name: stepLabel })}>
      {/* Progress bar */}
      <div className="mb-5 flex gap-1.5">
        {STEP_KEYS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-[#2f7d32]" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {step === 0 && (
        <StepFarmer form={form} set={set} />
      )}
      {step === 1 && (
        <StepLand form={form} set={set} />
      )}
      {step === 2 && (
        <StepCrop form={form} set={set} crops={CROPS} />
      )}
      {step === 3 && (
        <StepDocuments form={form} set={set} />
      )}
      {step === 4 && (
        <StepReview form={form} ins={ins} />
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            onClick={prev}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition active:scale-95"
          >
            {x.common.back}
          </button>
        )}
        {step < STEP_KEYS.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-3 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
          >
            {x.common.continue} <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            className="flex-1 rounded-2xl bg-[#2f7d32] py-3 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
          >
            {ins.submitApp}
          </button>
        )}
      </div>

      {step === 4 && (
        <p className="mt-3 text-center text-[10px] text-gray-400">{x.apply.demoReview}</p>
      )}
    </DetailShell>
  )
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2f7d32] focus:ring-1 focus:ring-[#2f7d32]"
      />
    </div>
  )
}

function StepFarmer({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  const a = useLang().t.x.insurance.apply
  return (
    <div className="space-y-4">
      <Field label={a.fullName} value={form.farmerName} onChange={(v) => set("farmerName", v)} placeholder={a.asAadhaar} />
      <Field label={a.mobile} value={form.mobile} onChange={(v) => set("mobile", v)} placeholder={a.mobilePh} type="tel" />
      <Field label={a.aadhaar} value={form.aadhaar} onChange={(v) => set("aadhaar", v)} placeholder={a.aadhaarPh} type="number" />
      <Field label={a.bankName} value={form.bankName} onChange={(v) => set("bankName", v)} placeholder={a.bankNamePh} />
      <Field label={a.accountNo} value={form.accountNumber} onChange={(v) => set("accountNumber", v)} placeholder={a.accountNoPh} />
      <Field label={a.ifsc} value={form.ifsc} onChange={(v) => set("ifsc", v)} placeholder={a.ifscPh} />
    </div>
  )
}

function StepLand({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  const x = useLang().t.x.insurance
  const a = x.apply
  return (
    <div className="space-y-4">
      <Field label={a.state} value={form.state} onChange={(v) => set("state", v)} placeholder={a.state} />
      <Field label={a.district} value={form.district} onChange={(v) => set("district", v)} placeholder={a.district} />
      <Field label={a.taluk} value={form.taluk} onChange={(v) => set("taluk", v)} placeholder={a.taluk} />
      <Field label={a.village} value={form.village} onChange={(v) => set("village", v)} placeholder={a.villagePh} />
      <Field label={a.survey} value={form.surveyNumber} onChange={(v) => set("surveyNumber", v)} placeholder={a.surveyPh} />
      <Field label={a.landArea} value={form.area} onChange={(v) => set("area", v)} placeholder={a.areaPh} type="number" />
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">{a.ownershipType}</label>
        <div className="flex gap-2">
          {["Owned", "Sharecropper", "Tenant"].map((opt) => (
            <button
              key={opt}
              onClick={() => set("ownershipType", opt)}
              className={`flex-1 rounded-xl border py-2 text-xs font-medium transition ${
                form.ownershipType === opt
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
  )
}

function StepCrop({ form, set, crops }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void; crops: string[] }) {
  const x = useLang().t.x.insurance
  const a = x.apply
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">{a.selectCrop}</label>
        <div className="grid grid-cols-2 gap-2">
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => set("crop", c)}
              className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                form.crop === c
                  ? "border-[#2f7d32] bg-green-50 text-[#2f7d32]"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {tr(x.crops, c)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">{a.season}</label>
        <div className="flex gap-2">
          {["Kharif 2026", "Rabi 2026-27"].map((s) => (
            <button
              key={s}
              onClick={() => set("season", s)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                form.season === s
                  ? "border-[#2f7d32] bg-green-50 text-[#2f7d32]"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {tr(x.seasons, s)}
            </button>
          ))}
        </div>
      </div>
      <Field label={a.sowing} value={form.sowingDate} onChange={(v) => set("sowingDate", v)} placeholder={a.datePh} />
      <Field label={a.harvest} value={form.harvestDate} onChange={(v) => set("harvestDate", v)} placeholder={a.datePh} />
    </div>
  )
}

function StepDocuments({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  const a = useLang().t.x.insurance.apply
  const docs = (["aadhaarDoc", "landDoc", "bankDoc"] as const).map((key) => ({ key, ...a.docs[key] }))
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-amber-50 p-3">
        <p className="text-xs text-amber-700">
          {a.docDemo}
        </p>
      </div>
      {docs.map(({ key, label, desc }) => (
        <button
          key={key}
          onClick={() => set(key, !form[key])}
          className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
            form[key] ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
          }`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${form[key] ? "bg-green-500" : "bg-gray-100"}`}>
            <CheckCircle2 className={`h-5 w-5 ${form[key] ? "text-white" : "text-gray-300"}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${form[key] ? "text-green-800" : "text-gray-700"}`}>{label}</p>
            <p className="text-xs text-gray-400">{form[key] ? a.uploaded : desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function StepReview({ form, ins }: { form: FormData; ins: { demoNote: string } }) {
  const x = useLang().t.x.insurance
  const r = x.apply.rv
  const rows = [
    { label: r.farmerName, value: form.farmerName || "—" },
    { label: r.mobile, value: form.mobile || "—" },
    { label: r.district, value: form.district || "—" },
    { label: r.taluk, value: form.taluk || "—" },
    { label: r.survey, value: form.surveyNumber || "—" },
    { label: r.landArea, value: form.area ? fmt(x.common.acres, { n: form.area }) : "—" },
    { label: r.ownership, value: tr(x.ownership, form.ownershipType) },
    { label: r.crop, value: form.crop ? tr(x.crops, form.crop) : "—" },
    { label: r.season, value: tr(x.seasons, form.season) },
    { label: r.sowing, value: form.sowingDate || "—" },
    { label: r.harvest, value: form.harvestDate || "—" },
    { label: r.coverage, value: "₹1,20,000" },
    { label: r.premium, value: r.premiumValue },
  ]
  return (
    <div>
      <div className="mb-3 rounded-2xl bg-amber-50 px-4 py-2.5">
        <p className="text-xs text-amber-700">{ins.demoNote}</p>
      </div>
      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-50">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
