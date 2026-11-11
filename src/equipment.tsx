import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { useLang, fmt } from "./i18n"

export type Availability = "available" | "booked"
export type RentalStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected"
export type RequestStatus = "pending" | "approved" | "rejected"

export type Equipment = {
  id: string
  name: string
  type: string
  owner: string
  location: string
  distanceKm: number
  pricePerDay: number
  availability: Availability
  rating: number
  reviews: number
  image: string
  hp: string
  fuel: string
  crops: string
  condition: string
  minDuration: string
  mine?: boolean
  notifyMe?: boolean
  requestCount?: number
}

export type Rental = {
  id: string
  equipmentId: string
  equipmentName: string
  owner: string
  location: string
  image: string
  startDate: string
  endDate: string
  days: number
  pricePerDay: number
  total: number
  status: RentalStatus
}

export type OwnerRequest = {
  id: string
  equipmentId: string
  equipmentName: string
  renter: string
  location: string
  distanceKm: number
  startDate: string
  endDate: string
  days: number
  total: number
  status: RequestStatus
}

export type NotifKind =
  | "request"
  | "available"
  | "accepted"
  | "rejected"
  | "starting"
  | "ending"
  | "returned"
  | "nearby"

export type RentalNotification = {
  id: string
  kind: NotifKind
  title: string
  body: string
  time: string
  read?: boolean
  equipmentId?: string
  /** Translation template key (t.x.equipmentA.notif) + placeholder values. */
  tpl?: string
  vars?: Record<string, string | number>
}

const IMG = {
  tractor:
    "https://images.unsplash.com/photo-1605338803155-8b46c0fe7e5e?w=400&h=300&fit=crop&auto=format",
  rotavator:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=300&fit=crop&auto=format",
  seedDrill:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&auto=format",
  sprayer:
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&auto=format",
  harvester:
    "https://images.unsplash.com/photo-1571913196242-d0c1a45ee5c2?w=400&h=300&fit=crop&auto=format",
  cultivator:
    "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop&auto=format",
}

const seedEquipment: Equipment[] = [
  {
    id: "e1", name: "Tractor (45 HP)", type: "Tractor", owner: "Ramesh Kumar",
    location: "Mandya", distanceKm: 3, pricePerDay: 1200, availability: "available",
    rating: 4.8, reviews: 34, image: IMG.tractor, hp: "45 HP", fuel: "Diesel",
    crops: "Rice, Ragi, Sugarcane", condition: "Well maintained", minDuration: "1 day",
  },
  {
    id: "e2", name: "Rotavator", type: "Rotavator", owner: "Shankar",
    location: "Maddur", distanceKm: 8, pricePerDay: 700, availability: "available",
    rating: 4.6, reviews: 21, image: IMG.rotavator, hp: "—", fuel: "PTO driven",
    crops: "All field crops", condition: "Good", minDuration: "1 day",
  },
  {
    id: "e3", name: "Seed Drill", type: "Seed Drill", owner: "Ravi",
    location: "Srirangapatna", distanceKm: 12, pricePerDay: 500, availability: "booked",
    rating: 4.4, reviews: 12, image: IMG.seedDrill, hp: "—", fuel: "PTO driven",
    crops: "Ragi, Wheat, Pulses", condition: "Good", minDuration: "2 days",
  },
  {
    id: "e4", name: "Power Sprayer", type: "Sprayer", owner: "Kumar",
    location: "Mandya", distanceKm: 5, pricePerDay: 300, availability: "available",
    rating: 4.7, reviews: 28, image: IMG.sprayer, hp: "5 HP", fuel: "Petrol",
    crops: "Vegetables, Paddy", condition: "Excellent", minDuration: "1 day",
  },
  {
    id: "e5", name: "Harvester", type: "Harvester", owner: "Mahesh",
    location: "Mysore", distanceKm: 22, pricePerDay: 2500, availability: "available",
    rating: 4.9, reviews: 41, image: IMG.harvester, hp: "76 HP", fuel: "Diesel",
    crops: "Paddy, Wheat", condition: "Well maintained", minDuration: "1 day",
  },
]

// Equipment owned by the current user (for the owner side of the marketplace)
const seedMine: Equipment[] = [
  {
    id: "m1", name: "Tractor (45 HP)", type: "Tractor", owner: "Naveen Kumar km",
    location: "Mandya", distanceKm: 0, pricePerDay: 1200, availability: "available",
    rating: 4.8, reviews: 19, image: IMG.tractor, hp: "45 HP", fuel: "Diesel",
    crops: "Rice, Ragi, Sugarcane", condition: "Well maintained", minDuration: "1 day",
    mine: true, requestCount: 3,
  },
  {
    id: "m2", name: "Cultivator", type: "Cultivator", owner: "Naveen Kumar km",
    location: "Mandya", distanceKm: 0, pricePerDay: 700, availability: "booked",
    rating: 4.5, reviews: 8, image: IMG.cultivator, hp: "—", fuel: "PTO driven",
    crops: "All field crops", condition: "Good", minDuration: "1 day",
    mine: true, requestCount: 0,
  },
]

const seedOwnerRequests: OwnerRequest[] = [
  {
    id: "r1", equipmentId: "m1", equipmentName: "Tractor (45 HP)", renter: "Suresh Kumar",
    location: "Mandya", distanceKm: 4, startDate: "12 Sep", endDate: "14 Sep", days: 3,
    total: 3600, status: "pending",
  },
  {
    id: "r2", equipmentId: "m1", equipmentName: "Tractor (45 HP)", renter: "Prakash",
    location: "Maddur", distanceKm: 9, startDate: "18 Sep", endDate: "19 Sep", days: 2,
    total: 2400, status: "pending",
  },
  {
    id: "r3", equipmentId: "m1", equipmentName: "Tractor (45 HP)", renter: "Lokesh",
    location: "Mandya", distanceKm: 2, startDate: "22 Sep", endDate: "25 Sep", days: 4,
    total: 4800, status: "pending",
  },
]

const seedRentals: Rental[] = [
  {
    id: "rt1", equipmentId: "e5", equipmentName: "Harvester", owner: "Mahesh",
    location: "Mysore", image: IMG.harvester, startDate: "8 Sep", endDate: "9 Sep",
    days: 1, pricePerDay: 2500, total: 2500, status: "active",
  },
  {
    id: "rt2", equipmentId: "e2", equipmentName: "Rotavator", owner: "Shankar",
    location: "Maddur", image: IMG.rotavator, startDate: "20 Aug", endDate: "22 Aug",
    days: 2, pricePerDay: 700, total: 1400, status: "completed",
  },
]

const seedNotifs: RentalNotification[] = [
  {
    id: "n1", kind: "request", title: "New Rental Request",
    body: "Suresh Kumar wants to rent your Tractor (45 HP) for 3 days.",
    time: "1h ago", read: false, equipmentId: "m1",
    tpl: "request", vars: { renter: "Suresh Kumar", equip: "Tractor (45 HP)", days: 3 },
  },
  {
    id: "n2", kind: "nearby", title: "New Equipment Nearby 🚜",
    body: "Rotavator available 8 km from you.", time: "3h ago", read: false, equipmentId: "e2", tpl: "nearby",
  },
  {
    id: "n3", kind: "starting", title: "Rental Starting Soon ⏰",
    body: "Your Harvester rental starts tomorrow.", time: "Yesterday", read: true, tpl: "starting",
  },
]

let uid = 100
const nid = () => `x${uid++}`

type Ctx = {
  equipment: Equipment[]
  mine: Equipment[]
  rentals: Rental[]
  ownerRequests: OwnerRequest[]
  notifications: RentalNotification[]
  unreadCount: number
  getEquipment: (id: string) => Equipment | undefined
  getRental: (id: string) => Rental | undefined
  requestRental: (equipmentId: string, dates: { start: string; end: string; days: number }) => string
  cancelRental: (rentalId: string) => void
  acceptRequest: (reqId: string) => void
  rejectRequest: (reqId: string) => void
  listEquipment: (draft: Partial<Equipment>) => void
  toggleNotify: (equipmentId: string) => void
  markNotifsRead: () => void
}

const EquipmentContext = createContext<Ctx | null>(null)

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(seedEquipment)
  const [mine, setMine] = useState<Equipment[]>(seedMine)
  const [rentals, setRentals] = useState<Rental[]>(seedRentals)
  const [ownerRequests, setOwnerRequests] = useState<OwnerRequest[]>(seedOwnerRequests)
  const [notifications, setNotifications] = useState<RentalNotification[]>(seedNotifs)

  const getEquipment = (id: string) =>
    equipment.find((e) => e.id === id) ?? mine.find((e) => e.id === id)
  const getRental = (id: string) => rentals.find((r) => r.id === id)

  function pushNotif(n: Omit<RentalNotification, "id" | "time">) {
    setNotifications((list) => [{ id: nid(), time: "Just now", read: false, ...n }, ...list])
  }

  function requestRental(equipmentId: string, dates: { start: string; end: string; days: number }) {
    const eq = getEquipment(equipmentId)
    if (!eq) return ""
    const id = nid()
    const total = eq.pricePerDay * dates.days
    setRentals((list) => [
      {
        id, equipmentId, equipmentName: eq.name, owner: eq.owner, location: eq.location,
        image: eq.image, startDate: dates.start, endDate: dates.end, days: dates.days,
        pricePerDay: eq.pricePerDay, total, status: "pending",
      },
      ...list,
    ])
    pushNotif({
      kind: "request", title: "Rental Request Sent", tpl: "sent",
      vars: { equip: eq.name, owner: eq.owner },
      body: `Your request for ${eq.name} was sent to ${eq.owner}.`,
    })
    return id
  }

  function cancelRental(rentalId: string) {
    setRentals((list) =>
      list.map((r) => (r.id === rentalId ? { ...r, status: "cancelled" } : r)),
    )
  }

  function acceptRequest(reqId: string) {
    let req: OwnerRequest | undefined
    setOwnerRequests((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          req = r
          return { ...r, status: "approved" }
        }
        return r
      }),
    )
    if (req) {
      setMine((list) =>
        list.map((e) => (e.id === req!.equipmentId ? { ...e, availability: "booked" } : e)),
      )
      pushNotif({
        kind: "accepted", title: "Request Accepted ✓", tpl: "accepted",
        vars: { renter: req.renter, equip: req.equipmentName },
        body: `You accepted ${req.renter}'s request for ${req.equipmentName}.`,
      })
    }
  }

  function rejectRequest(reqId: string) {
    let req: OwnerRequest | undefined
    setOwnerRequests((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          req = r
          return { ...r, status: "rejected" }
        }
        return r
      }),
    )
    if (req) {
      setMine((list) =>
        list.map((e) => (e.id === req!.equipmentId ? { ...e, availability: "available" } : e)),
      )
      pushNotif({
        kind: "rejected", title: "Request Rejected", tpl: "rejected",
        vars: { renter: req.renter, equip: req.equipmentName },
        body: `You rejected ${req.renter}'s request for ${req.equipmentName}.`,
      })
    }
  }

  function listEquipment(draft: Partial<Equipment>) {
    const id = nid()
    const eq: Equipment = {
      id, name: draft.name || "New Equipment", type: draft.type || "Other",
      owner: "Naveen Kumar km", location: draft.location || "Mandya", distanceKm: 0,
      pricePerDay: draft.pricePerDay || 0, availability: draft.availability || "available",
      rating: 0, reviews: 0, image: draft.image || IMG.tractor, hp: draft.hp || "—",
      fuel: draft.fuel || "—", crops: draft.crops || "—", condition: draft.condition || "Good",
      minDuration: draft.minDuration || "1 day", mine: true, requestCount: 0,
    }
    setMine((list) => [eq, ...list])
    setEquipment((list) => [{ ...eq, distanceKm: 0 }, ...list])
    pushNotif({
      kind: "nearby", title: "New Equipment Available Near You 🚜", tpl: "listed",
      vars: { equip: eq.name, price: eq.pricePerDay },
      body: `You listed a ${eq.name} for ₹${eq.pricePerDay}/day. Nearby farmers have been notified.`,
      equipmentId: id,
    })
  }

  function toggleNotify(equipmentId: string) {
    setEquipment((list) =>
      list.map((e) => (e.id === equipmentId ? { ...e, notifyMe: !e.notifyMe } : e)),
    )
  }

  function markNotifsRead() {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const value: Ctx = {
    equipment, mine, rentals, ownerRequests, notifications, unreadCount,
    getEquipment, getRental, requestRental, cancelRental, acceptRequest, rejectRequest,
    listEquipment, toggleNotify, markNotifsRead,
  }

  return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>
}

export function useEquipment() {
  const ctx = useContext(EquipmentContext)
  if (!ctx) throw new Error("useEquipment must be used within EquipmentProvider")
  return ctx
}

/**
 * Render-time translation helpers for equipment data. Data keeps stable English
 * ids/values; unknown (user-entered) values fall through unchanged.
 */
export function useEquipText() {
  const { t } = useLang()
  const e = t.x.equipmentA
  const look = (m: Record<string, string>, k: string) => m[k] ?? k
  const duration = (v: string) => {
    const m = /^(\d+) days?$/.exec(v)
    if (!m) return v
    return fmt(Number(m[1]) === 1 ? e.dayN : e.daysN, { n: m[1] })
  }
  const name = (v: string) => look(e.names, v)
  return {
    name,
    type: (v: string) => look(e.types, v),
    fuel: (v: string) => look(e.fuels, v),
    crops: (v: string) => look(e.crops, v),
    condition: (v: string) => look(e.conditions, v),
    time: (v: string) => look(e.times, v),
    duration,
    days: (n: number) => fmt(n === 1 ? e.dayN : e.daysN, { n }),
    notif: (n: RentalNotification) => {
      const tpl = n.tpl ? e.notif[n.tpl] : undefined
      if (!tpl) return { title: n.title, body: n.body, time: look(e.times, n.time) }
      const vars: Record<string, string | number> = { ...n.vars }
      if (typeof vars.equip === "string") vars.equip = name(vars.equip)
      return { title: fmt(tpl.title, vars), body: fmt(tpl.body, vars), time: look(e.times, n.time) }
    },
  }
}
