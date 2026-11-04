import type { ReactNode, RefObject } from "react"
import { ChevronLeft } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useLang } from "@/krushika/i18n"

export default function DetailShell({
  title,
  subtitle,
  action,
  footer,
  scrollRef,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  footer?: ReactNode
  scrollRef?: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  const { back } = useNav()
  const { t } = useLang()
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#f7f8ec]">
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#256428] px-5 pb-6 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:scale-90"
            aria-label={t.pages.back}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-snug">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-white/80">{subtitle}</p>}
          </div>
          {action}
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-10 pt-5">{children}</div>
      {footer}
    </div>
  )
}
