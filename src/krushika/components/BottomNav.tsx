import { Home, ScanLine, BarChart3, Landmark, User } from "lucide-react"
import { useLang } from "@/krushika/i18n"

export type Tab = "home" | "scan" | "insights" | "schemes" | "profile"

const items: { id: Tab; icon: typeof Home }[] = [
  { id: "home", icon: Home },
  { id: "scan", icon: ScanLine },
  { id: "insights", icon: BarChart3 },
  { id: "schemes", icon: Landmark },
  { id: "profile", icon: User },
]

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  const { t } = useLang()
  return (
    <nav className="absolute inset-x-0 bottom-0 mx-auto flex max-w-md items-center justify-around border-t border-gray-100 bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map(({ id, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 transition active:scale-90"
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-[#2f7d32]" : "text-gray-400"}`} />
            <span
              className={`text-[10px] font-medium ${
                isActive ? "text-[#2f7d32]" : "text-gray-400"
              }`}
            >
              {t.nav[id]}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
