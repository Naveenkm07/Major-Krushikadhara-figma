import { useState, useRef } from "react"
import { Camera, Plus, X, CheckCircle2, MapPin, ChevronDown } from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useProfile, type FarmerProfile } from "@/krushika/profile"
import { useNav } from "@/krushika/nav"
import DetailShell from "./DetailShell"

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=160&h=160&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=160&h=160&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=160&h=160&fit=crop&auto=format",
]

const CROP_OPTIONS = ["Rice", "Ragi", "Tomato", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut", "Jowar", "Onion"]
const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Punjab", "Uttar Pradesh", "Gujarat"]
const KARNATAKA_DISTRICTS = ["Mandya", "Mysuru", "Bengaluru Urban", "Bengaluru Rural", "Hassan", "Tumakuru", "Chikkamagaluru", "Shivamogga", "Raichur", "Belagavi", "Kalaburagi", "Dharwad"]

type Errors = Partial<Record<keyof FarmerProfile | "general", string>>

export default function EditProfileScreen() {
  const { t } = useLang()
  const e = t.x.coreA.editProfile
  const cropName = (c: string) => (t.x.coreA.crops as Record<string, string>)[c] ?? c
  const { profile, updateProfile } = useProfile()
  const { back } = useNav()

  const [form, setForm] = useState<FarmerProfile>({ ...profile })
  const [errors, setErrors] = useState<Errors>({})
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showCropPicker, setShowCropPicker] = useState(false)
  const [saved, setSaved] = useState(false)
  const cropInputRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof FarmerProfile>(key: K, value: FarmerProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function addCrop(crop: string) {
    if (!crop.trim() || form.crops.includes(crop.trim())) return
    set("crops", [...form.crops, crop.trim()])
    setShowCropPicker(false)
  }

  function removeCrop(crop: string) {
    set("crops", form.crops.filter((c) => c !== crop))
  }

  function validate(): boolean {
    const errs: Errors = {}
    if (!form.name.trim()) errs.name = e.errName
    if (form.mobile && !/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, "")))
      errs.mobile = e.errMobile
    if (!form.farmSize || isNaN(Number(form.farmSize)) || Number(form.farmSize) <= 0)
      errs.farmSize = e.errFarmSize
    if (form.experience < 0 || isNaN(Number(form.experience)))
      errs.experience = e.errExperience
    if (!form.district.trim()) errs.district = e.errDistrict
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function save() {
    if (!validate()) return
    updateProfile(form)
    setSaved(true)
    setTimeout(() => back(), 1400)
  }

  return (
    <DetailShell title={e.title} subtitle={e.subtitle}>
      {/* Avatar section */}
      <div className="mb-4 flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#2f7d32]/30">
            <img src={form.photoUrl} alt={e.photoAlt} className="h-full w-full object-cover" />
          </div>
          <button
            onClick={() => setShowAvatarPicker((v) => !v)}
            aria-label={e.changePhotoAria}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#2f7d32] text-white shadow-md transition active:scale-95"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">{e.photoHint}</p>

        {showAvatarPicker && (
          <div className="mt-3 flex gap-2">
            {AVATAR_OPTIONS.map((url) => (
              <button
                key={url}
                onClick={() => { set("photoUrl", url); setShowAvatarPicker(false) }}
                className={`h-14 w-14 overflow-hidden rounded-full ring-2 transition active:scale-95 ${
                  form.photoUrl === url ? "ring-[#2f7d32]" : "ring-gray-200"
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Personal Details */}
      <Card title={e.personal}>
        <Field
          label={e.fullName}
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder={e.fullNamePh}
          error={errors.name}
          required
        />
        <Field
          label={e.nameKn}
          value={form.nameKn}
          onChange={(v) => set("nameKn", v)}
          placeholder={e.nameKnPh}
        />
        <Field
          label={e.mobile}
          value={form.mobile}
          onChange={(v) => set("mobile", v)}
          placeholder={e.mobilePh}
          type="tel"
          error={errors.mobile}
        />
        <Field
          label={e.email}
          value={form.email}
          onChange={(v) => set("email", v)}
          placeholder={e.emailPh}
          type="email"
        />
      </Card>

      {/* Location */}
      <Card title={e.location}>
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">{e.state}</label>
          <div className="relative">
            <select
              value={form.state}
              onChange={(ev) => set("state", ev.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2f7d32] focus:ring-1 focus:ring-[#2f7d32]"
            >
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">{e.district} {errors.district && <span className="ml-1 text-red-500">{errors.district}</span>}</label>
          <div className="relative">
            <select
              value={form.district}
              onChange={(ev) => { set("district", ev.target.value); setErrors((e2) => ({ ...e2, district: undefined })) }}
              className={`w-full appearance-none rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-1 ${
                errors.district ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-[#2f7d32] focus:ring-[#2f7d32]"
              }`}
            >
              <option value="">{e.selectDistrict}</option>
              {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <Field label={e.taluk} value={form.taluk} onChange={(v) => set("taluk", v)} placeholder={e.talukPh} />
        <Field label={e.village} value={form.village} onChange={(v) => set("village", v)} placeholder={e.villagePh} />

        <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 text-[#2f7d32]" />
          {fmt(e.preview, { place: form.district ? `${form.district}, ${form.state}` : form.state })}
        </div>
      </Card>

      {/* Farm Details */}
      <Card title={e.farmDetails}>
        <Field
          label={e.farmSize}
          value={form.farmSize}
          onChange={(v) => set("farmSize", v)}
          placeholder={e.farmSizePh}
          type="number"
          error={errors.farmSize}
          required
        />

        <div className="mb-1">
          <label className="mb-2 block text-xs font-medium text-gray-500">{e.mainCrops}</label>
          <div className="flex flex-wrap gap-2">
            {form.crops.map((crop) => (
              <span
                key={crop}
                className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
              >
                {cropName(crop)}
                <button onClick={() => removeCrop(crop)} aria-label={fmt(e.removeCropAria, { crop: cropName(crop) })} className="ml-0.5 text-green-500 transition active:scale-90">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowCropPicker((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-dashed border-[#2f7d32] px-3 py-1 text-sm font-medium text-[#2f7d32] transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              {e.addCrop}
            </button>
          </div>

          {showCropPicker && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <div className="flex flex-wrap gap-2">
                {CROP_OPTIONS.filter((c) => !form.crops.includes(c)).map((c) => (
                  <button
                    key={c}
                    onClick={() => addCrop(c)}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition active:scale-95 active:bg-green-50 active:text-green-700"
                  >
                    {cropName(c)}
                  </button>
                ))}
              </div>
              <input
                ref={cropInputRef}
                onKeyDown={(ev) => { if (ev.key === "Enter") addCrop(ev.currentTarget.value) }}
                placeholder={e.customCropPh}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2f7d32]"
              />
            </div>
          )}
        </div>

        <Field
          label={e.experience}
          value={String(form.experience)}
          onChange={(v) => set("experience", Math.max(0, parseInt(v) || 0))}
          placeholder="0"
          type="number"
          error={errors.experience}
        />
      </Card>

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="font-semibold text-green-800">{e.saved}</p>
        </div>
      )}

      {/* Action buttons */}
      {!saved && (
        <div className="flex gap-3">
          <button
            onClick={back}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition active:scale-95"
          >
            {e.cancel}
          </button>
          <button
            onClick={save}
            className="flex-1 rounded-2xl bg-[#2f7d32] py-3.5 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
          >
            {e.save}
          </button>
        </div>
      )}
    </DetailShell>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-bold text-gray-800">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = "text", error, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-400"
            : "border-gray-200 focus:border-[#2f7d32] focus:ring-[#2f7d32]"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
