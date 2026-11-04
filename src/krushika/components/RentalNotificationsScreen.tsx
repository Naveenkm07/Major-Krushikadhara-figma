import { useEffect } from "react"
import { Inbox, Truck, CheckCircle2, XCircle, Clock, PackageCheck, Sprout } from "lucide-react"
import { useNav } from "@/krushika/nav"
import { useEquipment, useEquipText, type NotifKind } from "@/krushika/equipment"
import DetailShell from "./DetailShell"
import { useLang, fmt } from "@/krushika/i18n"
import { localizeName } from "@/krushika/locales/equipmentB"

const meta: Record<NotifKind, { icon: typeof Inbox; bg: string; color: string }> = {
  request: { icon: Inbox, bg: "bg-orange-50", color: "text-orange-500" },
  available: { icon: Truck, bg: "bg-green-50", color: "text-green-600" },
  accepted: { icon: CheckCircle2, bg: "bg-green-50", color: "text-green-600" },
  rejected: { icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
  starting: { icon: Clock, bg: "bg-blue-50", color: "text-blue-500" },
  ending: { icon: Clock, bg: "bg-amber-50", color: "text-amber-500" },
  returned: { icon: PackageCheck, bg: "bg-teal-50", color: "text-teal-600" },
  nearby: { icon: Sprout, bg: "bg-green-50", color: "text-green-600" },
}

export default function RentalNotificationsScreen() {
  const { open } = useNav()
  const { t } = useLang()
  const L = t.x.equipmentB
  const { notifications, markNotifsRead } = useEquipment()
  const eqText = useEquipText()

  useEffect(() => {
    const tm = setTimeout(markNotifsRead, 800)
    return () => clearTimeout(tm)
  }, [markNotifsRead])

  function localizeBody(body: string): string {
    const N = L.notifs
    const nm = (s: string) => localizeName(s, L.typeNames)
    let m: RegExpMatchArray | null
    if ((m = body.match(/^(.+) wants to rent your (.+) for (\d+) days\.$/)))
      return fmt(N.bodyWants, { renter: m[1], equipment: nm(m[2]), days: m[3] })
    if ((m = body.match(/^(.+) available (\d+) km from you\.$/)))
      return fmt(N.bodyNearby, { equipment: nm(m[1]), km: m[2] })
    if ((m = body.match(/^Your (.+) rental starts tomorrow\.$/)))
      return fmt(N.bodyStarts, { equipment: nm(m[1]) })
    if ((m = body.match(/^Your request for (.+) was sent to (.+)\.$/)))
      return fmt(N.bodySent, { equipment: nm(m[1]), owner: m[2] })
    if ((m = body.match(/^You accepted (.+)'s request for (.+)\.$/)))
      return fmt(N.bodyAccepted, { renter: m[1], equipment: nm(m[2]) })
    if ((m = body.match(/^You rejected (.+)'s request for (.+)\.$/)))
      return fmt(N.bodyRejected, { renter: m[1], equipment: nm(m[2]) })
    if ((m = body.match(/^You listed a (.+) for ₹(\d+)\/day\. Nearby farmers have been notified\.$/)))
      return fmt(N.bodyListed, { equipment: nm(m[1]), price: m[2] })
    return body
  }

  function actionFor(kind: NotifKind, equipmentId?: string) {
    if (kind === "request") return { label: L.notifs.viewRequest, onClick: () => open("ownerRequests") }
    if (kind === "accepted" || kind === "starting" || kind === "ending")
      return { label: L.notifs.viewRental, onClick: () => open("myRentals") }
    if ((kind === "nearby" || kind === "available") && equipmentId)
      return { label: L.notifs.viewEquipment, onClick: () => open("equipmentDetails", { id: equipmentId }) }
    return null
  }

  return (
    <DetailShell title={L.notifs.title} subtitle={L.notifs.subtitle}>
      <div className="space-y-3">
        {notifications.map((n) => {
          const m = meta[n.kind]
          const action = actionFor(n.kind, n.equipmentId)
          return (
            <div
              key={n.id}
              className={`rounded-2xl p-4 shadow-sm ${n.read ? "bg-white" : "bg-white ring-1 ring-green-100"}`}
            >
              <div className="flex gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{n.tpl ? eqText.notif(n).title : (L.notifs.titles[n.title] ?? n.title)}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-[#2f7d32]" />}
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-gray-500">{n.tpl ? eqText.notif(n).body : localizeBody(n.body)}</p>
                  <p className="mt-1 text-xs text-gray-400">{eqText.time(n.time)}</p>
                </div>
              </div>
              {action && (
                <button
                  onClick={action.onClick}
                  className="mt-3 w-full rounded-xl bg-green-50 py-2.5 text-sm font-semibold text-[#2f7d32] transition active:scale-95"
                >
                  {action.label}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </DetailShell>
  )
}
