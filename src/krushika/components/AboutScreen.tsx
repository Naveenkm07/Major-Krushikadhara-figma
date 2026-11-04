import { Sprout, Target } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

export default function AboutScreen() {
  const { t } = useLang()
  const p = t.pages.about

  return (
    <DetailShell title={p.title} subtitle={p.subtitle}>
      <div className="flex flex-col items-center pb-2 pt-2 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3a9d3e] to-[#256428] shadow-lg shadow-green-900/20">
          <Sprout className="h-10 w-10 text-white" />
        </div>
        <h2 className="mt-3 text-xl font-extrabold text-[#256428]">KrushikaDhara</h2>
        <p className="font-kannada text-base font-semibold text-gray-600">ಕೃಷಿಕಧಾರಾ</p>
        <p className="mt-1 text-xs text-gray-400">{p.version}</p>
      </div>

      <p className="mt-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-gray-600 shadow-sm">
        {p.body}
      </p>

      <section className="mt-4 rounded-2xl bg-teal-50 p-4">
        <h3 className="flex items-center gap-2 font-bold text-teal-800">
          <Target className="h-5 w-5 text-teal-600" /> {p.mission}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-teal-800/90">{p.missionBody}</p>
      </section>

      <p className="mt-6 text-center text-sm text-gray-400">{p.madeWith}</p>
      <p className="mt-1 text-center text-xs text-gray-300">{t.profile.version}</p>
    </DetailShell>
  )
}
