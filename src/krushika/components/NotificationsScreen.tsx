import { CloudRain, Bug, Droplets, TrendingUp, Landmark } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "./DetailShell"

type Note = {
  icon: typeof Bug
  bg: string
  color: string
  id: "weather" | "pest" | "irrigation" | "market" | "scheme"
  time: "h2" | "h5" | "h8" | "yesterday" | "d2"
  unread?: boolean
}

export default function NotificationsScreen() {
  const { t } = useLang()
  const nx = t.x.coreA.notifications

  const today: Note[] = [
    {
      icon: CloudRain,
      bg: "bg-blue-50",
      color: "text-blue-500",
      id: "weather",
      time: "h2",
      unread: true,
    },
    {
      icon: Bug,
      bg: "bg-red-50",
      color: "text-red-500",
      id: "pest",
      time: "h5",
      unread: true,
    },
    {
      icon: Droplets,
      bg: "bg-teal-50",
      color: "text-teal-600",
      id: "irrigation",
      time: "h8",
    },
  ]

  const earlier: Note[] = [
    {
      icon: TrendingUp,
      bg: "bg-orange-50",
      color: "text-orange-500",
      id: "market",
      time: "yesterday",
    },
    {
      icon: Landmark,
      bg: "bg-purple-50",
      color: "text-purple-500",
      id: "scheme",
      time: "d2",
    },
  ]

  const Group = ({ label, notes }: { label: string; notes: Note[] }) => (
    <section className="pt-2">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">{label}</h3>
      <div className="space-y-3">
        {notes.map((n) => (
          <div
            key={n.id}
            className={`flex gap-3 rounded-2xl p-4 shadow-sm ${
              n.unread ? "bg-white ring-1 ring-green-100" : "bg-white"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.bg}`}>
              <n.icon className={`h-5 w-5 ${n.color}`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">{nx.items[n.id].title}</p>
                {n.unread && <span className="h-2 w-2 rounded-full bg-[#2f7d32]" />}
              </div>
              <p className="mt-0.5 text-sm leading-snug text-gray-500">{nx.items[n.id].body}</p>
              <p className="mt-1 text-xs text-gray-400">{nx.ago[n.time]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <DetailShell
      title={t.pages.notifications.title}
      subtitle={t.pages.notifications.subtitle}
      action={
        <button className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition active:scale-95">
          {t.pages.notifications.markAll}
        </button>
      }
    >
      <div className="space-y-4">
        <Group label={t.pages.notifications.groups.today} notes={today} />
        <Group label={t.pages.notifications.groups.earlier} notes={earlier} />
      </div>
    </DetailShell>
  )
}
