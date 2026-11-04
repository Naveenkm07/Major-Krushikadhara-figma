import { useRef, useState } from "react"
import { useLang } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"
import {
  ScanLine,
  Camera,
  ImageUp,
  Leaf,
  Bug,
  Sprout,
  ChevronRight,
  Sparkles,
  History,
  Cpu,
  Settings,
  X,
} from "lucide-react"

type ModeKey = "pest" | "crop" | "leaf"
const scanModes: { id: ModeKey; icon: typeof Bug; color: string; bg: string }[] = [
  { id: "pest", icon: Bug, color: "text-red-500", bg: "bg-red-50" },
  { id: "crop", icon: Sprout, color: "text-green-600", bg: "bg-green-50" },
  { id: "leaf", icon: Leaf, color: "text-teal-600", bg: "bg-teal-50" },
]

const scanStatus = ["warning", "healthy", "warning"]

export default function ScanScreen() {
  const { t } = useLang()
  const sm = t.x.scanFlow.scanMain
  const { open } = useNav()
  const [mode, setMode] = useState<ModeKey>("pest")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    // reset the input so the same file can be re-selected
    e.target.value = ""
  }

  function openGallery() {
    fileInputRef.current?.click()
  }

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  function startScan() {
    open("scanProcessing", previewUrl ? { imageUrl: previewUrl } : undefined)
  }

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {/* Hidden file input — accepts images from camera or gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <div className="flex items-center gap-2">
          <ScanLine className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t.scan.title}</h1>
        </div>
        <p className="mt-1 text-sm text-white/85">{t.scan.subtitle}</p>
      </header>

      {/* Scan mode selector */}
      <section className="px-5 pt-5">
        <div className="flex gap-3">
          {scanModes.map(({ id, icon: Icon, color, bg }) => {
            const isActive = mode === id
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border p-3 text-center transition active:scale-95 ${
                  isActive
                    ? "border-[#2f7d32] bg-white shadow-md"
                    : "border-transparent bg-white/60 shadow-sm"
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </span>
                <span className="text-xs font-semibold leading-tight text-gray-700">
                  {t.scan.modes[id]}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Viewfinder */}
      <section className="px-5 pt-5">
        <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#e8f3e2] to-[#d4e9cc]">
          <img
            src={previewUrl ?? "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=750&fit=crop&auto=format"}
            alt={sm.cropPreview}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />

          {/* corner scan brackets */}
          <div className="pointer-events-none absolute inset-8 rounded-2xl">
            <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-white" />
            <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-white" />
            <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-white" />
            <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-white" />
          </div>

          {/* Clear uploaded image */}
          {previewUrl && (
            <button
              onClick={clearPreview}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition active:scale-90"
              aria-label={sm.removePhoto}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Upload from gallery tap-target overlay when no image selected */}
          {!previewUrl && (
            <button
              onClick={openGallery}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-transparent"
              aria-label={sm.uploadGallery}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                <ImageUp className="h-6 w-6 text-white" />
              </span>
              <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {sm.tapUpload}
              </span>
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {previewUrl ? sm.imageReady : t.scan.hint}
          </div>
        </div>
      </section>

      {/* Capture actions */}
      <section className="px-5 pt-5">
        <div className="flex items-center gap-3">
          <button
            onClick={startScan}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2f7d32] py-4 font-semibold text-white shadow-md shadow-green-600/30 transition active:scale-95"
          >
            <Camera className="h-5 w-5" /> {previewUrl ? sm.analyseImage : t.scan.scanNow}
          </button>
          <button
            onClick={openGallery}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-4 font-semibold shadow-sm transition active:scale-95 ${
              previewUrl
                ? "border-[#2f7d32] bg-green-50 text-[#2f7d32]"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <ImageUp className="h-5 w-5" /> {t.scan.gallery}
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => open("scanHistory")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95"
          >
            <History className="h-4 w-4 shrink-0 text-gray-400" /> {sm.history}
          </button>
          <button
            onClick={() => open("lowConfidence")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95"
          >
            <Cpu className="h-4 w-4 shrink-0 text-gray-400" /> {sm.lowConf}
          </button>
          <button
            onClick={() => open("technicalArch")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition active:scale-95"
          >
            <Settings className="h-4 w-4 shrink-0 text-gray-400" /> {sm.techArch}
          </button>
        </div>
      </section>

      {/* Recent scans */}
      <section className="px-5 pt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{t.scan.recent}</h2>
          <button onClick={() => open("scanHistory")} className="text-sm font-semibold text-[#2f7d32]">{sm.viewAll}</button>
        </div>
        <div className="mt-3 space-y-3">
          {t.scan.results.map(({ crop, result }, i) => {
            const status = scanStatus[i]
            return (
            <button
              key={i}
              onClick={() => open("scanProcessing")}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  status === "healthy" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {status === "healthy" ? (
                  <Leaf className="h-5 w-5 text-green-600" />
                ) : (
                  <Bug className="h-5 w-5 text-red-500" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">{crop}</p>
                <p
                  className={`mt-0.5 text-sm ${
                    status === "healthy" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {result}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
            </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
