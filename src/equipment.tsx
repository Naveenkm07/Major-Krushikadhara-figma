import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useLang, fmt } from "./i18n"
import { useProfile } from "./profile"
import {
  syncEquipmentMarketplaceFromBackend,
  uploadEquipmentPhotoToBackend,
  createEquipmentOnBackend,
  updateEquipmentOnBackend,
  deleteEquipmentOnBackend,
  toggleEquipmentNotifyOnBackend,
  createBookingOnBackend,
  updateBookingStatusOnBackend,
  reviewBookingOnBackend,
  markEquipmentNotifsReadOnBackend,
  type EquipmentDTO,
  type RentalDTO,
  type OwnerRequestDTO,
  type EquipmentNotificationDTO,
  type EquipmentStatsDTO,
  type EquipmentMarketplaceStateDTO,
} from "./api/equipment"

export type Availability = "available" | "booked"
export type RawAvailability = "AVAILABLE" | "BOOKED" | "MAINTENANCE"
export type RentalStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected"
export type RequestStatus = RentalStatus

export type Equipment = EquipmentDTO
export type Rental = RentalDTO
export type OwnerRequest = OwnerRequestDTO
export type NotifKind = EquipmentNotificationDTO["kind"]
export type RentalNotification = EquipmentNotificationDTO
export type EquipmentStats = EquipmentStatsDTO

export const EQUIP_PRESET_IMAGES: Record<string, string> = {
  Tractor:
    "https://images.unsplash.com/photo-1605338803155-8b46c0fe7e5e?w=600&h=420&fit=crop&auto=format",
  Rotavator:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=420&fit=crop&auto=format",
  "Seed Drill":
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=420&fit=crop&auto=format",
  Sprayer:
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=420&fit=crop&auto=format",
  Harvester:
    "https://images.unsplash.com/photo-1571913196242-d0c1a45ee5c2?w=600&h=420&fit=crop&auto=format",
  Cultivator:
    "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&h=420&fit=crop&auto=format",
}

const seedEquipment: Equipment[] = [
  {
    id: "eq-mandya-1",
    name: "Tractor (45 HP)",
    type: "Tractor",
    owner: "Ramesh Kumar",
    ownerPhone: "9845011122",
    location: "Mandya",
    distanceKm: 3,
    pricePerDay: 1200,
    availability: "available",
    rawAvailability: "AVAILABLE",
    rating: 4.8,
    reviews: 34,
    image: EQUIP_PRESET_IMAGES.Tractor,
    hp: "45 HP",
    fuel: "Diesel",
    crops: "Rice, Ragi, Sugarcane",
    condition: "Well maintained",
    minDuration: "1 day",
    description:
      "Mahindra 575 DI 45 HP tractor serviced regularly, ideal for wetland puddling, ploughing, and trolley haulage.",
    deliveryAvailable: true,
    deliveryFee: 250,
    operatorIncluded: true,
    operatorFeePerDay: 400,
  },
  {
    id: "eq-maddur-2",
    name: "Rotavator",
    type: "Rotavator",
    owner: "Shankar Gowda",
    ownerPhone: "9845022233",
    location: "Maddur",
    distanceKm: 8,
    pricePerDay: 700,
    availability: "available",
    rawAvailability: "AVAILABLE",
    rating: 4.6,
    reviews: 21,
    image: EQUIP_PRESET_IMAGES.Rotavator,
    hp: "6 ft PTO",
    fuel: "PTO driven",
    crops: "All field crops",
    condition: "Good",
    minDuration: "1 day",
    deliveryAvailable: true,
    deliveryFee: 200,
    operatorIncluded: false,
    operatorFeePerDay: 0,
  },
  {
    id: "eq-sriranga-3",
    name: "Seed Drill",
    type: "Seed Drill",
    owner: "Ravi Shetty",
    ownerPhone: "9845033344",
    location: "Srirangapatna",
    distanceKm: 12,
    pricePerDay: 500,
    availability: "booked",
    rawAvailability: "BOOKED",
    rating: 4.4,
    reviews: 12,
    image: EQUIP_PRESET_IMAGES["Seed Drill"],
    hp: "9-Tyne PTO",
    fuel: "PTO driven",
    crops: "Ragi, Wheat, Pulses",
    condition: "Good",
    minDuration: "2 days",
    deliveryAvailable: false,
    deliveryFee: 0,
    operatorIncluded: false,
    operatorFeePerDay: 0,
  },
  {
    id: "eq-mandya-4",
    name: "Power Sprayer",
    type: "Sprayer",
    owner: "Kumar Swamy",
    ownerPhone: "9845044455",
    location: "Mandya",
    distanceKm: 5,
    pricePerDay: 300,
    availability: "available",
    rawAvailability: "AVAILABLE",
    rating: 4.7,
    reviews: 28,
    image: EQUIP_PRESET_IMAGES.Sprayer,
    hp: "5 HP",
    fuel: "Petrol",
    crops: "Vegetables, Paddy",
    condition: "Excellent",
    minDuration: "1 day",
    deliveryAvailable: true,
    deliveryFee: 100,
    operatorIncluded: true,
    operatorFeePerDay: 250,
  },
  {
    id: "eq-mysore-5",
    name: "Harvester",
    type: "Harvester",
    owner: "Mahesh Nayak",
    ownerPhone: "9845055566",
    location: "Mysore",
    distanceKm: 22,
    pricePerDay: 2500,
    availability: "available",
    rawAvailability: "AVAILABLE",
    rating: 4.9,
    reviews: 41,
    image: EQUIP_PRESET_IMAGES.Harvester,
    hp: "76 HP",
    fuel: "Diesel",
    crops: "Paddy, Wheat",
    condition: "Well maintained",
    minDuration: "1 day",
    deliveryAvailable: true,
    deliveryFee: 500,
    operatorIncluded: true,
    operatorFeePerDay: 600,
  },
]

const seedMine: Equipment[] = [
  {
    id: "eq-owner-m1",
    name: "Tractor (45 HP)",
    type: "Tractor",
    owner: "Naveen Kumar KM",
    ownerPhone: "9591502209",
    location: "Mandya",
    distanceKm: 0,
    pricePerDay: 1200,
    availability: "available",
    rawAvailability: "AVAILABLE",
    rating: 4.8,
    reviews: 19,
    image: EQUIP_PRESET_IMAGES.Tractor,
    hp: "45 HP",
    fuel: "Diesel",
    crops: "Rice, Ragi, Sugarcane",
    condition: "Well maintained",
    minDuration: "1 day",
    deliveryAvailable: true,
    deliveryFee: 200,
    operatorIncluded: true,
    operatorFeePerDay: 350,
    mine: true,
    requestCount: 1,
  },
]

let localUid = 100
const nextLocalId = (prefix = "eq-local") => `${prefix}-${Date.now()}-${localUid++}`

type BookingInput = {
  start: string
  end: string
  days: number
  pickupMode?: "pickup" | "delivery"
  includeOperator?: boolean
  notes?: string
}

type Ctx = {
  equipment: Equipment[]
  mine: Equipment[]
  rentals: Rental[]
  ownerRequests: OwnerRequest[]
  notifications: RentalNotification[]
  stats: EquipmentStats
  unreadCount: number
  loading: boolean
  syncSource: string
  refreshEquipment: (opts?: { lat?: number; lng?: number; silent?: boolean }) => Promise<void>
  getEquipment: (id: string) => Equipment | undefined
  getRental: (id: string) => Rental | undefined
  requestRental: (equipmentId: string, dates: BookingInput) => Promise<Rental | null>
  cancelRental: (rentalId: string) => Promise<void>
  acceptRequest: (reqId: string) => Promise<void>
  rejectRequest: (reqId: string, reason?: string) => Promise<void>
  startRentalHandover: (reqId: string) => Promise<void>
  completeRental: (bookingId: string) => Promise<void>
  submitRentalReview: (bookingId: string, rating: number, comment?: string) => Promise<boolean>
  listEquipment: (draft: Partial<Equipment>) => Promise<Equipment | null>
  updateEquipmentListing: (id: string, patch: Partial<Equipment> & { rawAvailability?: RawAvailability }) => Promise<Equipment | null>
  deleteEquipmentListing: (id: string) => Promise<boolean>
  uploadEquipmentPhoto: (imageUri: string) => Promise<string>
  toggleNotify: (equipmentId: string) => Promise<void>
  markNotifsRead: (notificationId?: string) => Promise<void>
}

const EquipmentContext = createContext<Ctx | null>(null)

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const [equipment, setEquipment] = useState<Equipment[]>(seedEquipment)
  const [mine, setMine] = useState<Equipment[]>(seedMine)
  const [rentals, setRentals] = useState<Rental[]>([])
  const [ownerRequests, setOwnerRequests] = useState<OwnerRequest[]>([])
  const [notifications, setNotifications] = useState<RentalNotification[]>([])
  const [stats, setStats] = useState<EquipmentStats>({
    listedCount: seedMine.length,
    pendingCount: 0,
    activeCount: 0,
    completedCount: 0,
    approvedEarnings: 0,
    completedEarnings: 0,
  })
  const [loading, setLoading] = useState(false)
  const [syncSource, setSyncSource] = useState("Offline Preview")

  const applyServerState = useCallback((state: EquipmentMarketplaceStateDTO) => {
    setEquipment(Array.isArray(state.allMarketplace) ? state.allMarketplace : state.equipment || [])
    setMine(state.mine || [])
    setRentals(state.rentals || [])
    setOwnerRequests(state.ownerRequests || [])
    setNotifications(state.notifications || [])
    if (state.stats) setStats(state.stats)
    if (state.source) setSyncSource(state.source)
  }, [])

  const refreshEquipment = useCallback(
    async (opts?: { lat?: number; lng?: number; silent?: boolean }) => {
      const mobile = (profile.mobile || "9591502209").replace(/\D/g, "").slice(-10) || "9591502209"
      if (!opts?.silent) setLoading(true)
      try {
        const res = await syncEquipmentMarketplaceFromBackend({
          mobile,
          lat: opts?.lat,
          lng: opts?.lng,
        })
        if (res?.success) {
          applyServerState(res)
        }
      } finally {
        if (!opts?.silent) setLoading(false)
      }
    },
    [applyServerState, profile.mobile]
  )

  useEffect(() => {
    refreshEquipment({ silent: true })
  }, [refreshEquipment])

  const displayMine = useMemo(
    () =>
      mine.map((m) => ({
        ...m,
        owner: m.owner || profile.name || "Farmer",
        location: m.location || profile.district || "Mandya",
      })),
    [mine, profile.district, profile.name]
  )

  const getEquipment = useCallback(
    (id: string) =>
      equipment.find((e) => e.id === id) ?? displayMine.find((e) => e.id === id),
    [equipment, displayMine]
  )

  const getRental = useCallback(
    (id: string) => rentals.find((r) => r.id === id),
    [rentals]
  )

  const mobileClean = useMemo(
    () => (profile.mobile || "9591502209").replace(/\D/g, "").slice(-10) || "9591502209",
    [profile.mobile]
  )

  async function requestRental(
    equipmentId: string,
    dates: BookingInput
  ): Promise<Rental | null> {
    const eq = getEquipment(equipmentId)
    if (!eq) return null

    try {
      const res = await createBookingOnBackend(equipmentId, {
        mobile: mobileClean,
        startDate: dates.start,
        endDate: dates.end,
        days: dates.days,
        pickupMode: dates.pickupMode || "pickup",
        includeOperator: Boolean(dates.includeOperator),
        notes: dates.notes,
      })
      if (res?.state) applyServerState(res.state)
      return res.booking
    } catch (err: any) {
      if (err?.isHttpError) {
        throw err
      }
      const deliveryFee =
        dates.pickupMode === "delivery" && eq.deliveryAvailable ? eq.deliveryFee || 0 : 0
      const operatorFee =
        dates.includeOperator && eq.operatorIncluded
          ? (eq.operatorFeePerDay || 0) * dates.days
          : 0
      const total = eq.pricePerDay * dates.days + deliveryFee + operatorFee
      const localBooking: Rental = {
        id: nextLocalId("bk-local"),
        equipmentId,
        equipmentName: eq.name,
        equipmentType: eq.type,
        owner: eq.owner,
        ownerPhone: eq.ownerPhone,
        location: eq.location,
        image: eq.image,
        startDate: dates.start,
        endDate: dates.end,
        days: dates.days,
        pricePerDay: eq.pricePerDay,
        deliveryFee,
        operatorFee,
        total,
        pickupMode: dates.pickupMode || "pickup",
        operatorIncluded: Boolean(dates.includeOperator && eq.operatorIncluded),
        notes: dates.notes || "",
        status: "pending",
      }
      setRentals((list) => [localBooking, ...list])
      return localBooking
    }
  }

  async function updateBookingStatus(
    bookingId: string,
    statusUpper: "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED",
    reason?: string
  ) {
    try {
      const res = await updateBookingStatusOnBackend(bookingId, {
        mobile: mobileClean,
        status: statusUpper,
        reason,
      })
      if (res?.state) applyServerState(res.state)
    } catch {
      const lower = statusUpper.toLowerCase() as RentalStatus
      setRentals((list) =>
        list.map((r) => (r.id === bookingId ? { ...r, status: lower } : r))
      )
      setOwnerRequests((list) =>
        list.map((r) => (r.id === bookingId ? { ...r, status: lower } : r))
      )
    }
  }

  const cancelRental = (rentalId: string) => updateBookingStatus(rentalId, "CANCELLED")
  const acceptRequest = (reqId: string) => updateBookingStatus(reqId, "APPROVED")
  const rejectRequest = (reqId: string, reason?: string) =>
    updateBookingStatus(reqId, "REJECTED", reason)
  const startRentalHandover = (reqId: string) => updateBookingStatus(reqId, "ACTIVE")
  const completeRental = (bookingId: string) => updateBookingStatus(bookingId, "COMPLETED")

  async function submitRentalReview(
    bookingId: string,
    rating: number,
    comment?: string
  ): Promise<boolean> {
    try {
      const res = await reviewBookingOnBackend(bookingId, {
        mobile: mobileClean,
        rating,
        comment,
      })
      if (res?.state) applyServerState(res.state)
      return true
    } catch {
      setRentals((list) =>
        list.map((r) =>
          r.id === bookingId ? { ...r, rating, reviewComment: comment || null } : r
        )
      )
      return true
    }
  }

  async function listEquipment(draft: Partial<Equipment>): Promise<Equipment | null> {
    try {
      const res = await createEquipmentOnBackend({
        mobile: mobileClean,
        name: draft.name || "Tractor",
        type: draft.type || "Tractor",
        location: draft.location || profile.district || "Mandya",
        latitude: draft.latitude,
        longitude: draft.longitude,
        pricePerDay: draft.pricePerDay || 1000,
        availability: draft.rawAvailability || (draft.availability === "booked" ? "BOOKED" : "AVAILABLE"),
        hp: draft.hp || "45 HP",
        fuel: draft.fuel || "Diesel",
        suitableCrops: draft.crops || "All field crops",
        condition: draft.condition || "Well maintained",
        minDuration: draft.minDuration || "1 day",
        description: draft.description || "",
        deliveryAvailable: Boolean(draft.deliveryAvailable),
        deliveryFee: Number(draft.deliveryFee || 0),
        operatorIncluded: Boolean(draft.operatorIncluded),
        operatorFeePerDay: Number(draft.operatorFeePerDay || 0),
        imageUrl: draft.image || EQUIP_PRESET_IMAGES[draft.type || "Tractor"] || EQUIP_PRESET_IMAGES.Tractor,
      })
      if (res?.state) applyServerState(res.state)
      return res.equipment
    } catch {
      const eq: Equipment = {
        id: nextLocalId("eq-local"),
        name: draft.name || "New Equipment",
        type: draft.type || "Tractor",
        owner: profile.name || "Farmer",
        ownerPhone: mobileClean,
        location: draft.location || profile.district || "Mandya",
        distanceKm: 0,
        pricePerDay: draft.pricePerDay || 1000,
        availability: draft.availability || "available",
        rawAvailability: draft.rawAvailability || "AVAILABLE",
        rating: 5.0,
        reviews: 0,
        image: draft.image || EQUIP_PRESET_IMAGES[draft.type || "Tractor"] || EQUIP_PRESET_IMAGES.Tractor,
        hp: draft.hp || "45 HP",
        fuel: draft.fuel || "Diesel",
        crops: draft.crops || "All field crops",
        condition: draft.condition || "Good",
        minDuration: draft.minDuration || "1 day",
        description: draft.description || "",
        deliveryAvailable: Boolean(draft.deliveryAvailable),
        deliveryFee: Number(draft.deliveryFee || 0),
        operatorIncluded: Boolean(draft.operatorIncluded),
        operatorFeePerDay: Number(draft.operatorFeePerDay || 0),
        mine: true,
        requestCount: 0,
      }
      setMine((list) => [eq, ...list])
      return eq
    }
  }

  async function updateEquipmentListing(
    id: string,
    patch: Partial<Equipment> & { rawAvailability?: RawAvailability }
  ): Promise<Equipment | null> {
    try {
      const res = await updateEquipmentOnBackend(id, {
        mobile: mobileClean,
        ...patch,
        availability:
          patch.rawAvailability ||
          (patch.availability ? patch.availability.toUpperCase() : undefined),
      })
      if (res?.state) applyServerState(res.state)
      return res.equipment
    } catch {
      const nextAvailability: Availability | undefined = patch.rawAvailability
        ? patch.rawAvailability === "AVAILABLE"
          ? "available"
          : "booked"
        : patch.availability
      const applyPatch = (e: Equipment) =>
        e.id === id
          ? {
              ...e,
              ...patch,
              ...(nextAvailability ? { availability: nextAvailability } : {}),
            }
          : e
      setMine((list) => list.map(applyPatch))
      setEquipment((list) => list.map(applyPatch))
      return null
    }
  }

  async function deleteEquipmentListing(id: string): Promise<boolean> {
    try {
      const res = await deleteEquipmentOnBackend(id, mobileClean)
      if (res?.state) applyServerState(res.state)
      return true
    } catch {
      setMine((list) => list.filter((e) => e.id !== id))
      setEquipment((list) => list.filter((e) => e.id !== id))
      return true
    }
  }

  async function uploadEquipmentPhoto(imageUri: string): Promise<string> {
    return await uploadEquipmentPhotoToBackend(imageUri, mobileClean)
  }

  async function toggleNotify(equipmentId: string) {
    setEquipment((list) =>
      list.map((e) => (e.id === equipmentId ? { ...e, notifyMe: !e.notifyMe } : e))
    )
    try {
      const res = await toggleEquipmentNotifyOnBackend(equipmentId, mobileClean)
      if (res?.state) applyServerState(res.state)
    } catch {}
  }

  async function markNotifsRead(notificationId?: string) {
    setNotifications((list) =>
      list.map((n) => (!notificationId || n.id === notificationId ? { ...n, read: true } : n))
    )
    try {
      const res = await markEquipmentNotifsReadOnBackend(mobileClean, notificationId)
      if (res?.state) applyServerState(res.state)
    } catch {}
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const value: Ctx = {
    equipment,
    mine: displayMine,
    rentals,
    ownerRequests,
    notifications,
    stats,
    unreadCount,
    loading,
    syncSource,
    refreshEquipment,
    getEquipment,
    getRental,
    requestRental,
    cancelRental,
    acceptRequest,
    rejectRequest,
    startRentalHandover,
    completeRental,
    submitRentalReview,
    listEquipment,
    updateEquipmentListing,
    deleteEquipmentListing,
    uploadEquipmentPhoto,
    toggleNotify,
    markNotifsRead,
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
      return {
        title: fmt(tpl.title, vars),
        body: fmt(tpl.body, vars),
        time: look(e.times, n.time),
      }
    },
  }
}
