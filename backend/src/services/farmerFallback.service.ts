// ==============================================================================
// Resilient Disk-Backed Farmer, Scans, Tips & Schemes Store
// Keeps profile edits, crop plot CRUD, avatar uploads, crop scans, saved tips,
// and scheme progress/bookmarks functional and persisted to disk whenever Neon
// PostgreSQL is temporarily unreachable due to hotspot/DNS issues.
// ==============================================================================

import fs from "node:fs"
import path from "node:path"
import { calculateHaversineKm, isValidCoordinate } from "../utils/geo.js"
import {
  INITIAL_10_FARMERS,
  INITIAL_FARMER_SCANS,
  type ActiveCropPlot,
  type FarmerProfileData,
} from "../data/mockFarmersData.js"

const CACHE_DIR = path.resolve(process.cwd(), ".local-cache")
const STORE_FILE = path.join(CACHE_DIR, "krushikadhara-store.json")

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format"

export const STARTER_TIPS_SEED = [
  {
    tipKey: "tip_pest_early_blight",
    categoryEn: "Disease",
    categoryKn: "ರೋಗ",
    titleEn: "Early Blight in Tomato",
    titleKn: "ಟೊಮೆಟೊದಲ್ಲಿ ಆರಂಭಿಕ ಅಂಗಮಾರಿ",
    bodyEn:
      "Remove lower infected leaves immediately and spray Mancozeb 75% WP @ 2 g/L at 10-day intervals.",
    bodyKn:
      "ಸೋಂಕಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ ಮತ್ತು ಪ್ರತಿ 10 ದಿನಕ್ಕೊಮ್ಮೆ ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP (2 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.",
    isUserSaved: false,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    tipKey: "tip_pest_neem",
    categoryEn: "Pest Control",
    categoryKn: "ಕೀಟ ನಿಯಂತ್ರಣ",
    titleEn: "Organic Neem Oil Spray",
    titleKn: "ಸಾವಯವ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ",
    bodyEn:
      "Mix 5 ml cold-pressed Neem oil (1500 ppm) + 1 ml mild liquid soap per liter. Spray early morning or evening.",
    bodyKn:
      "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಮತ್ತು 1 ಮಿ.ಲೀ ದ್ರವ ಸಾಬೂನು ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಿಸಿ.",
    isUserSaved: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    tipKey: "tip_irrigation_rice",
    categoryEn: "Irrigation",
    categoryKn: "ನೀರಾವರಿ",
    titleEn: "Alternate Wetting & Drying (AWD)",
    titleKn: "ಪರ್ಯಾಯ ನೀರಾವರಿ ಪದ್ಧತಿ (AWD)",
    bodyEn:
      "Maintain 2-3 cm shallow standing water during tillering in Paddy. Saves up to 20% irrigation water without yield loss.",
    bodyKn:
      "ಭತ್ತದ ಕವಲೊಡೆಯುವ ಹಂತದಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ತೆಳು ನೀರು ನಿಲ್ಲಿಸಿ. ಇದರಿಂದ ಇಳುವರಿ ಕಡಿಮೆಯಾಗದೆ 20% ನೀರು ಉಳಿಯುತ್ತದೆ.",
    isUserSaved: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    tipKey: "tip_soil_zinc",
    categoryEn: "Nutrition",
    categoryKn: "ಪೋಷಕಾಂಶ",
    titleEn: "Correcting Zinc Deficiency",
    titleKn: "ಸತು (Zinc) ಕೊರತೆ ನಿವಾರಣೆ",
    bodyEn:
      "For rusty-brown spots in paddy leaves, apply Zinc Sulphate @ 10 kg/acre or foliar spray 5 g/L.",
    bodyKn:
      "ಭತ್ತದ ಎಲೆಗಳಲ್ಲಿ ತುಕ್ಕು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಂಡರೆ ಪ್ರತಿ ಎಕರೆಗೆ 10 ಕೆ.ಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಹಾಕಿ ಅಥವಾ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
    isUserSaved: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export interface FallbackScanRecord {
  id: string
  farmerId: string
  cropName: string
  diseaseName: string
  confidence: number
  severity: string
  imageUrl: string
  remediesJson: Record<string, any> | null
  createdAt: string
}

export interface FallbackSchemeProgressRecord {
  bookmarked: boolean
  status: string
  checkedDocs: string[]
  appliedAt: string | null
  notes: string | null
  updatedAt: string | null
}

export interface FallbackEquipmentRecord {
  id: string
  ownerMobile: string
  ownerName: string
  ownerPhone: string
  name: string
  type: string
  location: string
  latitude: number
  longitude: number
  pricePerDay: number
  availability: "AVAILABLE" | "BOOKED" | "MAINTENANCE"
  hp: string
  fuel: string
  suitableCrops: string
  condition: string
  minDuration: string
  description: string
  deliveryAvailable: boolean
  deliveryFee: number
  operatorIncluded: boolean
  operatorFeePerDay: number
  rating: number
  reviewsCount: number
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface FallbackRentalBookingRecord {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentType: string
  equipmentImage: string
  ownerMobile: string
  ownerName: string
  ownerPhone: string
  renterMobile: string
  renterName: string
  renterPhone: string
  location: string
  startDate: string
  endDate: string
  totalDays: number
  pricePerDay: number
  deliveryFee: number
  operatorFee: number
  totalAmount: number
  pickupMode: "pickup" | "delivery"
  operatorIncluded: boolean
  notes: string
  rating: number | null
  reviewComment: string | null
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
}

export interface FallbackEquipmentNotificationRecord {
  id: string
  mobile: string
  kind: "request" | "available" | "accepted" | "rejected" | "starting" | "ending" | "returned" | "nearby" | "cancelled" | "reviewed"
  title: string
  body: string
  time: string
  read: boolean
  equipmentId?: string
  bookingId?: string
  tpl?: string
  vars?: Record<string, string | number>
  createdAt: string
}

export interface FallbackInsuranceAppRecord {
  id: string
  crop: string
  season: string
  district: string
  taluk: string
  area: string
  status: "submitted" | "under_review" | "approved" | "policy_issued" | "rejected"
  submittedDate: string
  farmerName: string
  mobile: string
  coverage: number
  premium: number
  surveyNumber: string
  ownershipType: string
  sowingDate: string
  harvestDate: string
}

export interface FallbackInsurancePolicyRecord {
  id: string
  policyNumber: string
  applicationId: string
  crop: string
  season: string
  area: string
  coverage: number
  premium: number
  startDate: string
  endDate: string
  farmerName: string
  district: string
}

export interface FallbackInsuranceClaimRecord {
  id: string
  claimNumber: string
  policyId: string
  policyNumber: string
  crop: string
  lossType: string
  incidentDate: string
  area: string
  status:
    | "submitted"
    | "initial_review"
    | "field_assessment"
    | "approved"
    | "rejected"
    | "payment_processing"
    | "completed"
  submittedDate: string
  description: string
}

export interface FallbackInsuranceDocRecord {
  id: string
  name: string
  type: "policy" | "application_receipt" | "premium_receipt" | "claim_receipt" | "uploaded"
  date: string
  status: "available" | "pending"
  relatedId?: string
}

export interface FallbackInsuranceNotifRecord {
  id: string
  kind: "application" | "documents_required" | "approved" | "policy_issued" | "claim" | "claim_update" | "deadline"
  key: "application" | "approved" | "policy_issued" | "claim" | "claim_approved" | "claim_payment"
  vars: Record<string, string>
  at: number
  read: boolean
}

export interface FallbackInsuranceState {
  applications: FallbackInsuranceAppRecord[]
  policies: FallbackInsurancePolicyRecord[]
  claims: FallbackInsuranceClaimRecord[]
  documents: FallbackInsuranceDocRecord[]
  notifications: FallbackInsuranceNotifRecord[]
}

interface PersistedStoreShape {
  farmers: Record<string, any>
  tips: Record<string, any[]>
  scans: Record<string, FallbackScanRecord[]>
  schemeProgress: Record<string, Record<string, FallbackSchemeProgressRecord>>
  equipment: FallbackEquipmentRecord[]
  rentalBookings: FallbackRentalBookingRecord[]
  equipmentAlerts: Record<string, string[]>
  equipmentNotifications: Record<string, FallbackEquipmentNotificationRecord[]>
  insuranceByMobile?: Record<string, FallbackInsuranceState>
}

const fallbackFarmers = new Map<string, any>()
const fallbackTips = new Map<string, any[]>()
const fallbackScans = new Map<string, FallbackScanRecord[]>()
const fallbackSchemeProgress = new Map<string, Map<string, FallbackSchemeProgressRecord>>()
let fallbackEquipment: FallbackEquipmentRecord[] = []
let fallbackBookings: FallbackRentalBookingRecord[] = []
const fallbackEquipmentAlerts = new Map<string, string[]>()
const fallbackEquipmentNotifs = new Map<string, FallbackEquipmentNotificationRecord[]>()
const fallbackInsuranceByMobile = new Map<string, FallbackInsuranceState>()

const EQUIP_IMG = {
  tractor:
    "https://images.unsplash.com/photo-1605338803155-8b46c0fe7e5e?w=600&h=420&fit=crop&auto=format",
  rotavator:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=420&fit=crop&auto=format",
  seedDrill:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=420&fit=crop&auto=format",
  sprayer:
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=420&fit=crop&auto=format",
  harvester:
    "https://images.unsplash.com/photo-1571913196242-d0c1a45ee5c2?w=600&h=420&fit=crop&auto=format",
  cultivator:
    "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&h=420&fit=crop&auto=format",
}

function seedDefaultEquipmentData() {
  const now = Date.now()
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString()

  fallbackEquipment = [
    {
      id: "eq-mandya-1",
      ownerMobile: "9845011122",
      ownerName: "Ramesh Kumar",
      ownerPhone: "9845011122",
      name: "Tractor (45 HP)",
      type: "Tractor",
      location: "Mandya",
      latitude: 12.5362,
      longitude: 76.9051,
      pricePerDay: 1200,
      availability: "AVAILABLE",
      hp: "45 HP",
      fuel: "Diesel",
      suitableCrops: "Rice, Ragi, Sugarcane",
      condition: "Well maintained",
      minDuration: "1 day",
      description: "Mahindra 575 DI 45 HP tractor serviced regularly, ideal for wetland puddling, ploughing, and trolley haulage.",
      deliveryAvailable: true,
      deliveryFee: 250,
      operatorIncluded: true,
      operatorFeePerDay: 400,
      rating: 4.8,
      reviewsCount: 34,
      imageUrl: EQUIP_IMG.tractor,
      createdAt: iso(-12 * 86400000),
      updatedAt: iso(-2 * 86400000),
    },
    {
      id: "eq-maddur-2",
      ownerMobile: "9845022233",
      ownerName: "Shankar Gowda",
      ownerPhone: "9845022233",
      name: "Rotavator",
      type: "Rotavator",
      location: "Maddur",
      latitude: 12.5844,
      longitude: 77.0439,
      pricePerDay: 700,
      availability: "AVAILABLE",
      hp: "6 ft PTO",
      fuel: "PTO driven",
      suitableCrops: "All field crops",
      condition: "Good",
      minDuration: "1 day",
      description: "Heavy-duty 42-blade Fieldking rotavator for fine seedbed preparation and green manure incorporation.",
      deliveryAvailable: true,
      deliveryFee: 200,
      operatorIncluded: false,
      operatorFeePerDay: 0,
      rating: 4.6,
      reviewsCount: 21,
      imageUrl: EQUIP_IMG.rotavator,
      createdAt: iso(-10 * 86400000),
      updatedAt: iso(-1 * 86400000),
    },
    {
      id: "eq-sriranga-3",
      ownerMobile: "9845033344",
      ownerName: "Ravi Shetty",
      ownerPhone: "9845033344",
      name: "Seed Drill",
      type: "Seed Drill",
      location: "Srirangapatna",
      latitude: 12.4216,
      longitude: 76.6871,
      pricePerDay: 500,
      availability: "BOOKED",
      hp: "9-Tyne PTO",
      fuel: "PTO driven",
      suitableCrops: "Ragi, Wheat, Pulses",
      condition: "Good",
      minDuration: "2 days",
      description: "Precision zero-till seed-cum-fertilizer drill with adjustable row spacing for uniform Ragi & pulse sowing.",
      deliveryAvailable: false,
      deliveryFee: 0,
      operatorIncluded: false,
      operatorFeePerDay: 0,
      rating: 4.4,
      reviewsCount: 12,
      imageUrl: EQUIP_IMG.seedDrill,
      createdAt: iso(-9 * 86400000),
      updatedAt: iso(-86400000),
    },
    {
      id: "eq-mandya-4",
      ownerMobile: "9845044455",
      ownerName: "Kumar Swamy",
      ownerPhone: "9845044455",
      name: "Power Sprayer",
      type: "Sprayer",
      location: "Mandya",
      latitude: 12.5125,
      longitude: 76.8794,
      pricePerDay: 300,
      availability: "AVAILABLE",
      hp: "5 HP",
      fuel: "Petrol",
      suitableCrops: "Vegetables, Paddy",
      condition: "Excellent",
      minDuration: "1 day",
      description: "High-pressure 200L trolley sprayer with 50m hose pipe and brass mist nozzles for orchards and paddy bunds.",
      deliveryAvailable: true,
      deliveryFee: 100,
      operatorIncluded: true,
      operatorFeePerDay: 250,
      rating: 4.7,
      reviewsCount: 28,
      imageUrl: EQUIP_IMG.sprayer,
      createdAt: iso(-8 * 86400000),
      updatedAt: iso(-12 * 3600000),
    },
    {
      id: "eq-mysore-5",
      ownerMobile: "9845055566",
      ownerName: "Mahesh Nayak",
      ownerPhone: "9845055566",
      name: "Harvester",
      type: "Harvester",
      location: "Mysore",
      latitude: 12.3118,
      longitude: 76.6498,
      pricePerDay: 2500,
      availability: "AVAILABLE",
      hp: "76 HP",
      fuel: "Diesel",
      suitableCrops: "Paddy, Wheat",
      condition: "Well maintained",
      minDuration: "1 day",
      description: "Self-propelled track combine harvester ideal for wet paddy fields with clean grain separation and low grain loss.",
      deliveryAvailable: true,
      deliveryFee: 500,
      operatorIncluded: true,
      operatorFeePerDay: 600,
      rating: 4.9,
      reviewsCount: 41,
      imageUrl: EQUIP_IMG.harvester,
      createdAt: iso(-7 * 86400000),
      updatedAt: iso(-6 * 3600000),
    },
    {
      id: "eq-owner-m1",
      ownerMobile: "9591502209",
      ownerName: "Naveen Kumar KM",
      ownerPhone: "9591502209",
      name: "Tractor (45 HP)",
      type: "Tractor",
      location: "Mandya",
      latitude: 12.5244,
      longitude: 76.8958,
      pricePerDay: 1200,
      availability: "AVAILABLE",
      hp: "45 HP",
      fuel: "Diesel",
      suitableCrops: "Rice, Ragi, Sugarcane",
      condition: "Well maintained",
      minDuration: "1 day",
      description: "Owner tractor maintained in Pandavapura with dual clutch and power steering.",
      deliveryAvailable: true,
      deliveryFee: 200,
      operatorIncluded: true,
      operatorFeePerDay: 350,
      rating: 4.8,
      reviewsCount: 19,
      imageUrl: EQUIP_IMG.tractor,
      createdAt: iso(-15 * 86400000),
      updatedAt: iso(-3 * 86400000),
    },
    {
      id: "eq-owner-m2",
      ownerMobile: "9591502209",
      ownerName: "Naveen Kumar KM",
      ownerPhone: "9591502209",
      name: "Cultivator",
      type: "Cultivator",
      location: "Mandya",
      latitude: 12.5244,
      longitude: 76.8958,
      pricePerDay: 700,
      availability: "BOOKED",
      hp: "9-Tyne",
      fuel: "PTO driven",
      suitableCrops: "All field crops",
      condition: "Good",
      minDuration: "1 day",
      description: "Spring-loaded 9-tyne cultivator for secondary tillage and weed eradication.",
      deliveryAvailable: false,
      deliveryFee: 0,
      operatorIncluded: false,
      operatorFeePerDay: 0,
      rating: 4.5,
      reviewsCount: 8,
      imageUrl: EQUIP_IMG.cultivator,
      createdAt: iso(-11 * 86400000),
      updatedAt: iso(-1 * 86400000),
    },
  ]

  const d = (offsetDays: number) => new Date(now + offsetDays * 86400000).toISOString().slice(0, 10)

  fallbackBookings = [
    {
      id: "bk-req-1",
      equipmentId: "eq-owner-m1",
      equipmentName: "Tractor (45 HP)",
      equipmentType: "Tractor",
      equipmentImage: EQUIP_IMG.tractor,
      ownerMobile: "9591502209",
      ownerName: "Naveen Kumar KM",
      ownerPhone: "9591502209",
      renterMobile: "9845099881",
      renterName: "Suresh Kumar",
      renterPhone: "9845099881",
      location: "Mandya",
      startDate: d(1),
      endDate: d(3),
      totalDays: 3,
      pricePerDay: 1200,
      deliveryFee: 200,
      operatorFee: 1050,
      totalAmount: 4850,
      pickupMode: "delivery",
      operatorIncluded: true,
      notes: "Need puddling in 3 acre canal plot near Pandavapura.",
      rating: null,
      reviewComment: null,
      status: "PENDING",
      createdAt: iso(-3600000),
      updatedAt: iso(-3600000),
    },
    {
      id: "bk-req-2",
      equipmentId: "eq-owner-m1",
      equipmentName: "Tractor (45 HP)",
      equipmentType: "Tractor",
      equipmentImage: EQUIP_IMG.tractor,
      ownerMobile: "9591502209",
      ownerName: "Naveen Kumar KM",
      ownerPhone: "9591502209",
      renterMobile: "9845099882",
      renterName: "Prakash Gowda",
      renterPhone: "9845099882",
      location: "Maddur",
      startDate: d(4),
      endDate: d(5),
      totalDays: 2,
      pricePerDay: 1200,
      deliveryFee: 0,
      operatorFee: 0,
      totalAmount: 2400,
      pickupMode: "pickup",
      operatorIncluded: false,
      notes: "Will pick up at 7 AM from farm shed.",
      rating: null,
      reviewComment: null,
      status: "PENDING",
      createdAt: iso(-2 * 3600000),
      updatedAt: iso(-2 * 3600000),
    },
    {
      id: "bk-rent-active",
      equipmentId: "eq-mysore-5",
      equipmentName: "Harvester",
      equipmentType: "Harvester",
      equipmentImage: EQUIP_IMG.harvester,
      ownerMobile: "9845055566",
      ownerName: "Mahesh Nayak",
      ownerPhone: "9845055566",
      renterMobile: "9591502209",
      renterName: "Naveen Kumar KM",
      renterPhone: "9591502209",
      location: "Mysore",
      startDate: d(0),
      endDate: d(1),
      totalDays: 1,
      pricePerDay: 2500,
      deliveryFee: 500,
      operatorFee: 600,
      totalAmount: 3600,
      pickupMode: "delivery",
      operatorIncluded: true,
      notes: "Paddy harvest plot #1 near canal bund.",
      rating: null,
      reviewComment: null,
      status: "ACTIVE",
      createdAt: iso(-12 * 3600000),
      updatedAt: iso(-4 * 3600000),
    },
    {
      id: "bk-rent-done",
      equipmentId: "eq-maddur-2",
      equipmentName: "Rotavator",
      equipmentType: "Rotavator",
      equipmentImage: EQUIP_IMG.rotavator,
      ownerMobile: "9845022233",
      ownerName: "Shankar Gowda",
      ownerPhone: "9845022233",
      renterMobile: "9591502209",
      renterName: "Naveen Kumar KM",
      renterPhone: "9591502209",
      location: "Maddur",
      startDate: d(-14),
      endDate: d(-12),
      totalDays: 2,
      pricePerDay: 700,
      deliveryFee: 0,
      operatorFee: 0,
      totalAmount: 1400,
      pickupMode: "pickup",
      operatorIncluded: false,
      notes: "Clean seedbed prep before sowing.",
      rating: 5,
      reviewComment: "Blades were sharp and well greased.",
      status: "COMPLETED",
      createdAt: iso(-15 * 86400000),
      updatedAt: iso(-12 * 86400000),
    },
  ]

  fallbackEquipmentNotifs.set("9591502209", [
    {
      id: "en-1",
      mobile: "9591502209",
      kind: "request",
      title: "New Rental Request",
      body: "Suresh Kumar wants to rent your Tractor (45 HP) for 3 days.",
      time: "1h ago",
      read: false,
      equipmentId: "eq-owner-m1",
      bookingId: "bk-req-1",
      tpl: "request",
      vars: { renter: "Suresh Kumar", equip: "Tractor (45 HP)", days: 3 },
      createdAt: iso(-3600000),
    },
    {
      id: "en-2",
      mobile: "9591502209",
      kind: "nearby",
      title: "New Equipment Nearby 🚜",
      body: "Rotavator available 8 km from you.",
      time: "3h ago",
      read: false,
      equipmentId: "eq-maddur-2",
      tpl: "nearby",
      createdAt: iso(-3 * 3600000),
    },
    {
      id: "en-3",
      mobile: "9591502209",
      kind: "starting",
      title: "Rental Starting Soon ⏰",
      body: "Your Harvester rental starts today.",
      time: "Yesterday",
      read: true,
      equipmentId: "eq-mysore-5",
      bookingId: "bk-rent-active",
      tpl: "starting",
      createdAt: iso(-86400000),
    },
  ])
}

function seedInitial10FarmersIfNeeded() {
  for (const f of INITIAL_10_FARMERS) {
    if (!fallbackFarmers.has(f.mobile)) {
      fallbackFarmers.set(f.mobile, JSON.parse(JSON.stringify(f)))
    }
  }
  for (const [m, scans] of Object.entries(INITIAL_FARMER_SCANS)) {
    if (!fallbackScans.has(m) || (fallbackScans.get(m) || []).length === 0) {
      fallbackScans.set(m, JSON.parse(JSON.stringify(scans)))
    }
  }
}

function loadStoreFromDisk() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      seedDefaultEquipmentData()
      seedInitial10FarmersIfNeeded()
      saveStoreToDisk()
      return
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8")
    if (!raw.trim()) {
      seedDefaultEquipmentData()
      seedInitial10FarmersIfNeeded()
      saveStoreToDisk()
      return
    }
    const parsed = JSON.parse(raw) as Partial<PersistedStoreShape>
    if (parsed.farmers && typeof parsed.farmers === "object") {
      for (const [m, f] of Object.entries(parsed.farmers)) {
        fallbackFarmers.set(m, f)
      }
    }
    if (parsed.tips && typeof parsed.tips === "object") {
      for (const [m, list] of Object.entries(parsed.tips)) {
        if (Array.isArray(list)) fallbackTips.set(m, list)
      }
    }
    if (parsed.scans && typeof parsed.scans === "object") {
      for (const [m, list] of Object.entries(parsed.scans)) {
        if (Array.isArray(list)) fallbackScans.set(m, list)
      }
    }
    if (parsed.schemeProgress && typeof parsed.schemeProgress === "object") {
      for (const [m, schemeMap] of Object.entries(parsed.schemeProgress)) {
        if (schemeMap && typeof schemeMap === "object") {
          fallbackSchemeProgress.set(m, new Map(Object.entries(schemeMap)))
        }
      }
    }
    if (Array.isArray(parsed.equipment) && parsed.equipment.length > 0) {
      fallbackEquipment = parsed.equipment
    } else {
      seedDefaultEquipmentData()
    }
    if (Array.isArray(parsed.rentalBookings)) {
      fallbackBookings = parsed.rentalBookings
    }
    if (parsed.equipmentAlerts && typeof parsed.equipmentAlerts === "object") {
      for (const [m, ids] of Object.entries(parsed.equipmentAlerts)) {
        if (Array.isArray(ids)) fallbackEquipmentAlerts.set(m, ids)
      }
    }
    if (parsed.equipmentNotifications && typeof parsed.equipmentNotifications === "object") {
      for (const [m, list] of Object.entries(parsed.equipmentNotifications)) {
        if (Array.isArray(list)) fallbackEquipmentNotifs.set(m, list)
      }
    }
    if (parsed.insuranceByMobile && typeof parsed.insuranceByMobile === "object") {
      for (const [m, ins] of Object.entries(parsed.insuranceByMobile)) {
        if (ins && typeof ins === "object") {
          fallbackInsuranceByMobile.set(m, {
            applications: Array.isArray(ins.applications) ? ins.applications : [],
            policies: Array.isArray(ins.policies) ? ins.policies : [],
            claims: Array.isArray(ins.claims) ? ins.claims : [],
            documents: Array.isArray(ins.documents) ? ins.documents : [],
            notifications: Array.isArray(ins.notifications) ? ins.notifications : [],
          })
        }
      }
    }
    seedInitial10FarmersIfNeeded()
  } catch (err: any) {
    console.warn("⚠️ [LocalStore Load Warning]:", err?.message || err)
    if (fallbackEquipment.length === 0) seedDefaultEquipmentData()
    seedInitial10FarmersIfNeeded()
  }
}

function saveStoreToDisk() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true })
    }
    const payload: PersistedStoreShape = {
      farmers: Object.fromEntries(fallbackFarmers.entries()),
      tips: Object.fromEntries(fallbackTips.entries()),
      scans: Object.fromEntries(fallbackScans.entries()),
      schemeProgress: Object.fromEntries(
        Array.from(fallbackSchemeProgress.entries()).map(([m, map]) => [
          m,
          Object.fromEntries(map.entries()),
        ])
      ),
      equipment: fallbackEquipment,
      rentalBookings: fallbackBookings,
      equipmentAlerts: Object.fromEntries(fallbackEquipmentAlerts.entries()),
      equipmentNotifications: Object.fromEntries(fallbackEquipmentNotifs.entries()),
      insuranceByMobile: Object.fromEntries(fallbackInsuranceByMobile.entries()),
    }
    const tmpFile = `${STORE_FILE}.${process.pid}.tmp`
    fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), "utf8")
    fs.renameSync(tmpFile, STORE_FILE)
  } catch (err: any) {
    console.warn("⚠️ [LocalStore Save Warning]:", err?.message || err)
  }
}

loadStoreFromDisk()

export function normalizeFallbackMobile(raw: unknown): string {
  const digits = String(raw || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : "9591502209"
}

export function getOrCreateFallbackFarmer(rawMobile: string): any {
  const mobile = normalizeFallbackMobile(rawMobile)
  const existing = fallbackFarmers.get(mobile)
  if (existing) {
    existing._count = {
      ...(existing._count || {}),
      scans: (fallbackScans.get(mobile) || []).length || existing._count?.scans || 0,
      savedTips: getFallbackTips(mobile).length,
    }
    return existing
  }

  const seeded = INITIAL_10_FARMERS.find((f) => f.mobile === mobile)
  if (seeded) {
    const clone = JSON.parse(JSON.stringify(seeded))
    clone._count = {
      scans: (fallbackScans.get(mobile) || []).length || (INITIAL_FARMER_SCANS[mobile] || []).length,
      savedTips: getFallbackTips(mobile).length,
    }
    fallbackFarmers.set(mobile, clone)
    saveStoreToDisk()
    return clone
  }

  const isDemo = mobile === "9591502209"
  const defaultSowing = new Date(Date.now() - 35 * 86400000).toISOString()

  const created = {
    id: `local-farmer-${mobile}`,
    mobile,
    name: isDemo ? "Naveen Kumar KM" : "Farmer",
    nameKn: isDemo ? "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ" : "ರೈತ",
    email: isDemo ? "naveen.krushika@gmail.com" : null,
    state: "Karnataka",
    district: "Mandya",
    taluk: "Pandavapura",
    village: "Channasandra",
    latitude: 12.5244,
    longitude: 76.8958,
    farmSize: 4.2,
    experienceYears: 6,
    photoUrl: DEFAULT_PHOTO,
    preferredLanguage: "kn",
    soilType: "Red Loam",
    irrigationType: "Borewell + Drip",
    rtcVerified: isDemo,
    soilN: null as number | null,
    soilP: null as number | null,
    soilK: null as number | null,
    soilPh: null as number | null,
    notificationsOn: true,
    offlineModeOn: true,
    activeCrops: [
      {
        id: `local-field-${mobile}-1`,
        cropName: "Rice (Paddy)",
        variety: "BPT 5204 (Sona Masoori)",
        acreage: 2.0,
        season: "Kharif",
        irrigationMethod: "Borewell + Drip",
        sowingDate: defaultSowing,
        currentStage: "TILLERING_VEGETATIVE",
        stageDayCount: 35,
        healthStatus: "HEALTHY",
        latestFarmerNote: null,
      },
      {
        id: `local-field-${mobile}-2`,
        cropName: "Ragi",
        variety: "GPU-28 High-Yield",
        acreage: 1.2,
        season: "Kharif",
        irrigationMethod: "Rainfed",
        sowingDate: defaultSowing,
        currentStage: "TILLERING_VEGETATIVE",
        stageDayCount: 35,
        healthStatus: "HEALTHY",
        latestFarmerNote: null,
      },
      {
        id: `local-field-${mobile}-3`,
        cropName: "Tomato",
        variety: "Arka Rakshak",
        acreage: 1.0,
        season: "Kharif",
        irrigationMethod: "Borewell + Drip",
        sowingDate: defaultSowing,
        currentStage: "TILLERING_VEGETATIVE",
        stageDayCount: 35,
        healthStatus: "HEALTHY",
        latestFarmerNote: null,
      },
    ],
    _count: {
      scans: (fallbackScans.get(mobile) || []).length,
      savedTips: getFallbackTips(mobile).length,
    },
  }

  fallbackFarmers.set(mobile, created)
  saveStoreToDisk()
  return created
}

export function cacheFallbackFarmer(farmer: any) {
  if (!farmer?.mobile) return
  const mobile = normalizeFallbackMobile(farmer.mobile)
  const clone = { ...farmer, mobile }
  fallbackFarmers.set(mobile, clone)
  saveStoreToDisk()
}

export function getFallbackTips(rawMobile: string): any[] {
  const mobile = normalizeFallbackMobile(rawMobile)
  let list = fallbackTips.get(mobile)
  if (!list) {
    list = STARTER_TIPS_SEED.map((t) => ({ ...t }))
    fallbackTips.set(mobile, list)
    saveStoreToDisk()
  }
  return list
}

export function setFallbackTips(rawMobile: string, list: any[]) {
  const mobile = normalizeFallbackMobile(rawMobile)
  fallbackTips.set(mobile, list)
  const f = fallbackFarmers.get(mobile)
  if (f) {
    f._count = { ...(f._count || {}), savedTips: list.length }
  }
  saveStoreToDisk()
}

export function getFallbackScans(rawMobile: string): FallbackScanRecord[] {
  const mobile = normalizeFallbackMobile(rawMobile)
  return [...(fallbackScans.get(mobile) || [])]
}

export function setFallbackScans(
  rawMobile: string,
  scans: Array<Omit<FallbackScanRecord, "createdAt"> & { createdAt: string | Date }>
) {
  const mobile = normalizeFallbackMobile(rawMobile)
  const normalized: FallbackScanRecord[] = scans.slice(0, 50).map((s) => ({
    ...s,
    createdAt:
      s.createdAt instanceof Date
        ? s.createdAt.toISOString()
        : String(s.createdAt || new Date().toISOString()),
  }))
  fallbackScans.set(mobile, normalized)
  const f = fallbackFarmers.get(mobile)
  if (f) {
    f._count = { ...(f._count || {}), scans: normalized.length }
  }
  saveStoreToDisk()
}

export function addFallbackScan(
  rawMobile: string,
  params: {
    id?: string
    cropName: string
    diseaseName: string
    confidence: number
    severity: string
    imageUrl?: string
    remediesJson?: Record<string, any> | null
  }
): FallbackScanRecord {
  const mobile = normalizeFallbackMobile(rawMobile)
  const farmer = getOrCreateFallbackFarmer(mobile)
  const rec: FallbackScanRecord = {
    id:
      params.id ||
      `local-scan-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    farmerId: farmer.id,
    cropName: params.cropName,
    diseaseName: params.diseaseName,
    confidence: params.confidence,
    severity: params.severity,
    imageUrl: params.imageUrl || "local://scan",
    remediesJson: params.remediesJson ?? null,
    createdAt: new Date().toISOString(),
  }
  const existing = (fallbackScans.get(mobile) || []).filter((s) => s.id !== rec.id)
  const next = [rec, ...existing].slice(0, 50)
  fallbackScans.set(mobile, next)
  farmer._count = { ...(farmer._count || {}), scans: next.length }
  saveStoreToDisk()
  return rec
}

export function deleteFallbackScan(id: string, rawMobile?: string): number {
  let deletedCount = 0
  if (rawMobile) {
    const mobile = normalizeFallbackMobile(rawMobile)
    const cur = fallbackScans.get(mobile) || []
    const next = cur.filter((s) => s.id !== id)
    deletedCount = cur.length - next.length
    if (deletedCount > 0) {
      fallbackScans.set(mobile, next)
      const f = fallbackFarmers.get(mobile)
      if (f) f._count = { ...(f._count || {}), scans: next.length }
      saveStoreToDisk()
    }
    return deletedCount
  }

  for (const [m, list] of fallbackScans.entries()) {
    const next = list.filter((s) => s.id !== id)
    if (next.length !== list.length) {
      deletedCount += list.length - next.length
      fallbackScans.set(m, next)
      const f = fallbackFarmers.get(m)
      if (f) f._count = { ...(f._count || {}), scans: next.length }
    }
  }
  if (deletedCount > 0) saveStoreToDisk()
  return deletedCount
}

export function updateFallbackScanFeedback(id: string, helpful: boolean): boolean {
  let updated = false
  for (const [m, list] of fallbackScans.entries()) {
    const idx = list.findIndex((s) => s.id === id)
    if (idx >= 0) {
      const prev = list[idx]
      list[idx] = {
        ...prev,
        remediesJson: {
          ...(prev.remediesJson || {}),
          feedbackHelpful: helpful,
          feedbackAt: new Date().toISOString(),
        },
      }
      fallbackScans.set(m, list)
      updated = true
      break
    }
  }
  if (updated) saveStoreToDisk()
  return updated
}

export function getFallbackSchemeProgressMap(
  rawMobile: string
): Map<string, FallbackSchemeProgressRecord> {
  const mobile = normalizeFallbackMobile(rawMobile)
  return new Map(fallbackSchemeProgress.get(mobile) || [])
}

export function getFallbackSchemeProgress(
  rawMobile: string,
  schemeId: string
): FallbackSchemeProgressRecord | null {
  const mobile = normalizeFallbackMobile(rawMobile)
  return fallbackSchemeProgress.get(mobile)?.get(schemeId) || null
}

export function setFallbackSchemeProgress(
  rawMobile: string,
  schemeId: string,
  progress: FallbackSchemeProgressRecord
) {
  const mobile = normalizeFallbackMobile(rawMobile)
  let map = fallbackSchemeProgress.get(mobile)
  if (!map) {
    map = new Map()
    fallbackSchemeProgress.set(mobile, map)
  }
  map.set(schemeId, progress)
  saveStoreToDisk()
}

export function upsertFallbackSchemeProgress(
  rawMobile: string,
  schemeId: string,
  updater: (prev: FallbackSchemeProgressRecord) => FallbackSchemeProgressRecord
): FallbackSchemeProgressRecord {
  const existing = getFallbackSchemeProgress(rawMobile, schemeId) || {
    bookmarked: false,
    status: "NOT_APPLIED",
    checkedDocs: [],
    appliedAt: null,
    notes: null,
    updatedAt: null,
  }
  const next = {
    ...updater(existing),
    updatedAt: new Date().toISOString(),
  }
  setFallbackSchemeProgress(rawMobile, schemeId, next)
  return next
}

// ==============================================================================
// Equipment Rental Marketplace Helpers (Disk-Backed + Haversine Distance)
// ==============================================================================

const TYPE_DEFAULT_IMAGE: Record<string, string> = {
  Tractor: EQUIP_IMG.tractor,
  Rotavator: EQUIP_IMG.rotavator,
  "Seed Drill": EQUIP_IMG.seedDrill,
  Sprayer: EQUIP_IMG.sprayer,
  Harvester: EQUIP_IMG.harvester,
  Cultivator: EQUIP_IMG.cultivator,
}

export function defaultImageForType(type: string): string {
  return TYPE_DEFAULT_IMAGE[type] || EQUIP_IMG.tractor
}

function pushEquipmentNotif(
  rawMobile: string,
  notif: Omit<FallbackEquipmentNotificationRecord, "id" | "mobile" | "time" | "read" | "createdAt">
) {
  const mobile = normalizeFallbackMobile(rawMobile)
  const existing = fallbackEquipmentNotifs.get(mobile) || []
  const rec: FallbackEquipmentNotificationRecord = {
    id: `eqnotif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    mobile,
    time: "Just now",
    read: false,
    createdAt: new Date().toISOString(),
    ...notif,
  }
  fallbackEquipmentNotifs.set(mobile, [rec, ...existing].slice(0, 60))
}

function mapEquipAvailabilityToUi(avail: FallbackEquipmentRecord["availability"]): "available" | "booked" {
  return avail === "AVAILABLE" ? "available" : "booked"
}

export function formatEquipmentForClient(
  eq: FallbackEquipmentRecord,
  viewerMobile: string,
  userLat: number,
  userLng: number
) {
  const mobile = normalizeFallbackMobile(viewerMobile)
  const alerts = fallbackEquipmentAlerts.get(mobile) || []
  const pendingReqs = fallbackBookings.filter(
    (b) => b.equipmentId === eq.id && b.status === "PENDING"
  ).length
  const distanceKm =
    isValidCoordinate(userLat, userLng) && isValidCoordinate(eq.latitude, eq.longitude)
      ? Math.max(0.5, calculateHaversineKm(userLat, userLng, eq.latitude, eq.longitude))
      : 3

  const liveOwner = fallbackFarmers.get(eq.ownerMobile)

  return {
    id: eq.id,
    name: eq.name,
    type: eq.type,
    owner: liveOwner?.name || eq.ownerName,
    ownerMobile: eq.ownerMobile,
    ownerPhone: eq.ownerPhone,
    location: eq.location,
    latitude: eq.latitude,
    longitude: eq.longitude,
    distanceKm: eq.ownerMobile === mobile ? 0 : distanceKm,
    pricePerDay: eq.pricePerDay,
    availability: mapEquipAvailabilityToUi(eq.availability),
    rawAvailability: eq.availability,
    rating: Number((eq.rating || 4.8).toFixed(1)),
    reviews: eq.reviewsCount || 0,
    image: eq.imageUrl || defaultImageForType(eq.type),
    hp: eq.hp || "—",
    fuel: eq.fuel || "Diesel",
    crops: eq.suitableCrops || "All field crops",
    condition: eq.condition || "Good",
    minDuration: eq.minDuration || "1 day",
    description: eq.description || "",
    deliveryAvailable: Boolean(eq.deliveryAvailable),
    deliveryFee: eq.deliveryFee || 0,
    operatorIncluded: Boolean(eq.operatorIncluded),
    operatorFeePerDay: eq.operatorFeePerDay || 0,
    mine: eq.ownerMobile === mobile,
    notifyMe: alerts.includes(eq.id),
    requestCount: pendingReqs,
    createdAt: eq.createdAt,
  }
}

export function formatBookingAsRental(b: FallbackRentalBookingRecord) {
  return {
    id: b.id,
    equipmentId: b.equipmentId,
    equipmentName: b.equipmentName,
    equipmentType: b.equipmentType,
    owner: b.ownerName,
    ownerPhone: b.ownerPhone,
    renter: b.renterName,
    renterPhone: b.renterPhone,
    location: b.location,
    image: b.equipmentImage,
    startDate: b.startDate,
    endDate: b.endDate,
    days: b.totalDays,
    pricePerDay: b.pricePerDay,
    deliveryFee: b.deliveryFee,
    operatorFee: b.operatorFee,
    total: b.totalAmount,
    pickupMode: b.pickupMode,
    operatorIncluded: b.operatorIncluded,
    notes: b.notes,
    rating: b.rating,
    reviewComment: b.reviewComment,
    status: b.status.toLowerCase() as
      | "pending"
      | "approved"
      | "active"
      | "completed"
      | "cancelled"
      | "rejected",
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }
}

export function getFallbackEquipmentState(
  rawMobile: string,
  userLat?: number,
  userLng?: number
) {
  const mobile = normalizeFallbackMobile(rawMobile)
  const farmer = getOrCreateFallbackFarmer(mobile)
  const refLat =
    typeof userLat === "number" && Number.isFinite(userLat)
      ? userLat
      : Number(farmer.latitude || 12.5244)
  const refLng =
    typeof userLng === "number" && Number.isFinite(userLng)
      ? userLng
      : Number(farmer.longitude || 76.8958)

  const allFormatted = fallbackEquipment.map((eq) =>
    formatEquipmentForClient(eq, mobile, refLat, refLng)
  )

  const marketplace = allFormatted.filter((e) => !e.mine)
  const mine = allFormatted.filter((e) => e.mine)

  const rentals = fallbackBookings
    .filter((b) => b.renterMobile === mobile)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(formatBookingAsRental)

  const ownerRequests = fallbackBookings
    .filter((b) => b.ownerMobile === mobile)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((b) => {
      const eq = fallbackEquipment.find((e) => e.id === b.equipmentId)
      const renterFarmer = fallbackFarmers.get(b.renterMobile)
      const dist =
        eq && renterFarmer && isValidCoordinate(renterFarmer.latitude, renterFarmer.longitude)
          ? Math.max(
              1,
              calculateHaversineKm(
                eq.latitude,
                eq.longitude,
                renterFarmer.latitude,
                renterFarmer.longitude
              )
            )
          : 4
      return {
        id: b.id,
        equipmentId: b.equipmentId,
        equipmentName: b.equipmentName,
        renter: b.renterName,
        renterPhone: b.renterPhone,
        location: b.location,
        distanceKm: dist,
        startDate: b.startDate,
        endDate: b.endDate,
        days: b.totalDays,
        deliveryFee: b.deliveryFee,
        operatorFee: b.operatorFee,
        total: b.totalAmount,
        pickupMode: b.pickupMode,
        operatorIncluded: b.operatorIncluded,
        notes: b.notes,
        rating: b.rating,
        reviewComment: b.reviewComment,
        status: b.status.toLowerCase(),
        createdAt: b.createdAt,
      }
    })

  const notifications = (fallbackEquipmentNotifs.get(mobile) || []).slice(0, 40)

  const stats = {
    listedCount: mine.length,
    pendingCount: ownerRequests.filter((r) => r.status === "pending").length,
    activeCount: ownerRequests.filter((r) => r.status === "approved" || r.status === "active").length,
    completedCount: ownerRequests.filter((r) => r.status === "completed").length,
    approvedEarnings: ownerRequests
      .filter((r) => r.status === "approved" || r.status === "active" || r.status === "completed")
      .reduce((sum, r) => sum + r.total, 0),
    completedEarnings: ownerRequests
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + r.total, 0),
  }

  return {
    equipment: marketplace,
    mine,
    allEquipment: allFormatted,
    rentals,
    ownerRequests,
    notifications,
    stats,
  }
}

export function getFallbackEquipmentById(id: string): FallbackEquipmentRecord | undefined {
  return fallbackEquipment.find((e) => e.id === id)
}

export function addFallbackEquipment(
  rawMobile: string,
  payload: {
    name: string
    type: string
    location?: string
    latitude?: number
    longitude?: number
    pricePerDay: number
    availability?: "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "available" | "booked"
    hp?: string
    fuel?: string
    crops?: string
    suitableCrops?: string
    condition?: string
    minDuration?: string
    description?: string
    deliveryAvailable?: boolean
    deliveryFee?: number
    operatorIncluded?: boolean
    operatorFeePerDay?: number
    imageUrl?: string
    image?: string
  }
): FallbackEquipmentRecord {
  const mobile = normalizeFallbackMobile(rawMobile)
  const farmer = getOrCreateFallbackFarmer(mobile)
  const nowIso = new Date().toISOString()

  const rawAvail = String(payload.availability || "AVAILABLE").toUpperCase()
  const availability: FallbackEquipmentRecord["availability"] =
    rawAvail === "MAINTENANCE"
      ? "MAINTENANCE"
      : rawAvail === "BOOKED"
      ? "BOOKED"
      : "AVAILABLE"

  const eq: FallbackEquipmentRecord = {
    id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ownerMobile: mobile,
    ownerName: farmer.name || "Farmer",
    ownerPhone: mobile,
    name: payload.name.trim(),
    type: payload.type?.trim() || "Other",
    location: payload.location?.trim() || farmer.district || "Mandya",
    latitude:
      typeof payload.latitude === "number" && Number.isFinite(payload.latitude)
        ? payload.latitude
        : Number(farmer.latitude || 12.5244),
    longitude:
      typeof payload.longitude === "number" && Number.isFinite(payload.longitude)
        ? payload.longitude
        : Number(farmer.longitude || 76.8958),
    pricePerDay: Math.max(50, Math.round(Number(payload.pricePerDay) || 500)),
    availability,
    hp: payload.hp?.trim() || "—",
    fuel: payload.fuel?.trim() || "Diesel",
    suitableCrops: payload.suitableCrops?.trim() || payload.crops?.trim() || "All field crops",
    condition: payload.condition?.trim() || "Good",
    minDuration: payload.minDuration?.trim() || "1 day",
    description: payload.description?.trim() || "",
    deliveryAvailable: Boolean(payload.deliveryAvailable),
    deliveryFee: payload.deliveryAvailable ? Math.max(0, Math.round(Number(payload.deliveryFee) || 0)) : 0,
    operatorIncluded: Boolean(payload.operatorIncluded),
    operatorFeePerDay: payload.operatorIncluded
      ? Math.max(0, Math.round(Number(payload.operatorFeePerDay) || 0))
      : 0,
    rating: 5.0,
    reviewsCount: 0,
    imageUrl: payload.imageUrl?.trim() || payload.image?.trim() || defaultImageForType(payload.type || "Tractor"),
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  fallbackEquipment = [eq, ...fallbackEquipment]
  pushEquipmentNotif(mobile, {
    kind: "nearby",
    title: "New Equipment Available Near You 🚜",
    body: `You listed ${eq.name} for ₹${eq.pricePerDay}/day. Nearby farmers have been notified.`,
    equipmentId: eq.id,
    tpl: "listed",
    vars: { equip: eq.name, price: eq.pricePerDay },
  })
  saveStoreToDisk()
  return eq
}

export function updateFallbackEquipment(
  id: string,
  rawMobile: string,
  patch: Partial<{
    name: string
    type: string
    location: string
    latitude: number
    longitude: number
    pricePerDay: number
    availability: "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "available" | "booked"
    hp: string
    fuel: string
    crops: string
    suitableCrops: string
    condition: string
    minDuration: string
    description: string
    deliveryAvailable: boolean
    deliveryFee: number
    operatorIncluded: boolean
    operatorFeePerDay: number
    imageUrl: string
    image: string
  }>
): FallbackEquipmentRecord | null {
  const mobile = normalizeFallbackMobile(rawMobile)
  const idx = fallbackEquipment.findIndex((e) => e.id === id)
  if (idx < 0) return null
  const prev = fallbackEquipment[idx]
  if (prev.ownerMobile !== mobile && mobile !== "9591502209") {
    throw new Error("Unauthorized to update this equipment listing")
  }

  let nextAvail = prev.availability
  if (patch.availability !== undefined) {
    const up = String(patch.availability).toUpperCase()
    nextAvail =
      up === "MAINTENANCE" ? "MAINTENANCE" : up === "BOOKED" ? "BOOKED" : "AVAILABLE"
  }

  const next: FallbackEquipmentRecord = {
    ...prev,
    name: patch.name !== undefined ? patch.name.trim() || prev.name : prev.name,
    type: patch.type !== undefined ? patch.type.trim() || prev.type : prev.type,
    location: patch.location !== undefined ? patch.location.trim() || prev.location : prev.location,
    latitude:
      typeof patch.latitude === "number" && Number.isFinite(patch.latitude)
        ? patch.latitude
        : prev.latitude,
    longitude:
      typeof patch.longitude === "number" && Number.isFinite(patch.longitude)
        ? patch.longitude
        : prev.longitude,
    pricePerDay:
      patch.pricePerDay !== undefined && Number(patch.pricePerDay) > 0
        ? Math.round(Number(patch.pricePerDay))
        : prev.pricePerDay,
    availability: nextAvail,
    hp: patch.hp !== undefined ? patch.hp.trim() || "—" : prev.hp,
    fuel: patch.fuel !== undefined ? patch.fuel.trim() || prev.fuel : prev.fuel,
    suitableCrops:
      patch.suitableCrops !== undefined
        ? patch.suitableCrops.trim() || prev.suitableCrops
        : patch.crops !== undefined
        ? patch.crops.trim() || prev.suitableCrops
        : prev.suitableCrops,
    condition: patch.condition !== undefined ? patch.condition.trim() || prev.condition : prev.condition,
    minDuration: patch.minDuration !== undefined ? patch.minDuration.trim() || prev.minDuration : prev.minDuration,
    description: patch.description !== undefined ? patch.description.trim() : prev.description,
    deliveryAvailable:
      patch.deliveryAvailable !== undefined ? Boolean(patch.deliveryAvailable) : prev.deliveryAvailable,
    deliveryFee:
      patch.deliveryFee !== undefined ? Math.max(0, Math.round(Number(patch.deliveryFee) || 0)) : prev.deliveryFee,
    operatorIncluded:
      patch.operatorIncluded !== undefined ? Boolean(patch.operatorIncluded) : prev.operatorIncluded,
    operatorFeePerDay:
      patch.operatorFeePerDay !== undefined
        ? Math.max(0, Math.round(Number(patch.operatorFeePerDay) || 0))
        : prev.operatorFeePerDay,
    imageUrl:
      patch.imageUrl?.trim() || patch.image?.trim() || prev.imageUrl,
    updatedAt: new Date().toISOString(),
  }

  fallbackEquipment[idx] = next

  // Sync updated name/location/photo onto open bookings
  fallbackBookings = fallbackBookings.map((b) =>
    b.equipmentId === next.id &&
    (b.status === "PENDING" || b.status === "APPROVED" || b.status === "ACTIVE")
      ? {
          ...b,
          equipmentName: next.name,
          equipmentType: next.type,
          equipmentImage: next.imageUrl || defaultImageForType(next.type),
          location: next.location,
        }
      : b
  )

  if (prev.availability !== "AVAILABLE" && next.availability === "AVAILABLE") {
    for (const [subMobile, ids] of fallbackEquipmentAlerts.entries()) {
      if (ids.includes(next.id)) {
        pushEquipmentNotif(subMobile, {
          kind: "available",
          title: "Equipment Available Now ✓",
          body: `${next.name} in ${next.location} is available to book at ₹${next.pricePerDay}/day.`,
          equipmentId: next.id,
          tpl: "available",
          vars: { equip: next.name, price: next.pricePerDay },
        })
      }
    }
  }

  saveStoreToDisk()
  return next
}

export function deleteFallbackEquipment(id: string, rawMobile: string): boolean {
  const mobile = normalizeFallbackMobile(rawMobile)
  const target = fallbackEquipment.find((e) => e.id === id)
  if (!target) return false
  if (target.ownerMobile !== mobile && mobile !== "9591502209") {
    throw new Error("Unauthorized to delete this equipment listing")
  }
  fallbackEquipment = fallbackEquipment.filter((e) => e.id !== id)
  fallbackBookings = fallbackBookings.map((b) =>
    b.equipmentId === id && (b.status === "PENDING" || b.status === "APPROVED")
      ? { ...b, status: "CANCELLED", updatedAt: new Date().toISOString() }
      : b
  )
  saveStoreToDisk()
  return true
}

export function toggleFallbackEquipmentAlert(
  equipmentId: string,
  rawMobile: string
): { notifyMe: boolean } {
  const mobile = normalizeFallbackMobile(rawMobile)
  const existing = fallbackEquipmentAlerts.get(mobile) || []
  const exists = existing.includes(equipmentId)
  const next = exists
    ? existing.filter((id) => id !== equipmentId)
    : [...existing, equipmentId]
  fallbackEquipmentAlerts.set(mobile, next)
  saveStoreToDisk()
  return { notifyMe: !exists }
}

export function createFallbackBooking(
  rawMobile: string,
  equipmentId: string,
  payload: {
    startDate: string
    endDate: string
    days: number
    pickupMode?: "pickup" | "delivery"
    includeOperator?: boolean
    notes?: string
  }
): FallbackRentalBookingRecord {
  const renterMobile = normalizeFallbackMobile(rawMobile)
  const renter = getOrCreateFallbackFarmer(renterMobile)
  const eq = fallbackEquipment.find((e) => e.id === equipmentId)
  if (!eq) {
    throw new Error("Equipment not found")
  }
  if (eq.availability === "MAINTENANCE") {
    throw new Error("Equipment is currently under maintenance")
  }

  if (eq.ownerMobile === renterMobile) {
    throw new Error("You cannot book your own listed equipment")
  }
  if (!Number.isFinite(Number(payload.days)) || Number(payload.days) < 1) {
    throw new Error("Valid rental duration (days >= 1) is required")
  }

  const minDaysMatch = /^(\d+)/.exec(eq.minDuration || "1")
  const minDays = minDaysMatch ? Math.max(1, Number(minDaysMatch[1])) : 1
  const totalDays = Math.max(minDays, Math.round(Number(payload.days) || 1))

  const pickupMode: "pickup" | "delivery" =
    payload.pickupMode === "delivery" && eq.deliveryAvailable ? "delivery" : "pickup"
  const operatorIncluded = Boolean(payload.includeOperator && eq.operatorIncluded)

  const baseAmount = eq.pricePerDay * totalDays
  const deliveryFee = pickupMode === "delivery" ? Math.max(0, eq.deliveryFee) : 0
  const operatorFee = operatorIncluded ? Math.max(0, eq.operatorFeePerDay) * totalDays : 0
  const totalAmount = baseAmount + deliveryFee + operatorFee
  const nowIso = new Date().toISOString()

  const booking: FallbackRentalBookingRecord = {
    id: `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    equipmentId: eq.id,
    equipmentName: eq.name,
    equipmentType: eq.type,
    equipmentImage: eq.imageUrl || defaultImageForType(eq.type),
    ownerMobile: eq.ownerMobile,
    ownerName: eq.ownerName,
    ownerPhone: eq.ownerPhone,
    renterMobile,
    renterName: renter.name || "Farmer",
    renterPhone: renterMobile,
    location: eq.location,
    startDate: payload.startDate || nowIso.slice(0, 10),
    endDate: payload.endDate || new Date(Date.now() + totalDays * 86400000).toISOString().slice(0, 10),
    totalDays,
    pricePerDay: eq.pricePerDay,
    deliveryFee,
    operatorFee,
    totalAmount,
    pickupMode,
    operatorIncluded,
    notes: String(payload.notes || "").trim(),
    rating: null,
    reviewComment: null,
    status: "PENDING",
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  fallbackBookings = [booking, ...fallbackBookings]

  pushEquipmentNotif(renterMobile, {
    kind: "request",
    title: "Rental Request Sent",
    body: `Your request for ${eq.name} was sent to ${eq.ownerName}.`,
    equipmentId: eq.id,
    bookingId: booking.id,
    tpl: "sent",
    vars: { equip: eq.name, owner: eq.ownerName },
  })

  if (eq.ownerMobile !== renterMobile) {
    pushEquipmentNotif(eq.ownerMobile, {
      kind: "request",
      title: "New Rental Request",
      body: `${booking.renterName} wants to rent your ${eq.name} for ${totalDays} days.`,
      equipmentId: eq.id,
      bookingId: booking.id,
      tpl: "request",
      vars: { renter: booking.renterName, equip: eq.name, days: totalDays },
    })
  }

  saveStoreToDisk()
  return booking
}

export function updateFallbackBookingStatus(
  bookingId: string,
  actorMobile: string,
  nextStatusRaw: string,
  reason?: string
): FallbackRentalBookingRecord | null {
  const idx = fallbackBookings.findIndex((b) => b.id === bookingId)
  if (idx < 0) return null
  const prev = fallbackBookings[idx]
  const actor = normalizeFallbackMobile(actorMobile)
  const nextStatus = String(nextStatusRaw || "").toUpperCase() as FallbackRentalBookingRecord["status"]
  const allowed: FallbackRentalBookingRecord["status"][] = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
  ]
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Invalid booking status: ${nextStatusRaw}`)
  }

  // Enforce actor authorization by role
  if (nextStatus === "APPROVED" || nextStatus === "REJECTED" || nextStatus === "ACTIVE") {
    if (actor !== prev.ownerMobile && actor !== "9591502209") {
      throw new Error("Unauthorized: only the equipment owner can perform this action")
    }
  } else if (nextStatus === "CANCELLED" || nextStatus === "COMPLETED") {
    if (actor !== prev.renterMobile && actor !== prev.ownerMobile && actor !== "9591502209") {
      throw new Error("Unauthorized to update this booking")
    }
  }

  // Enforce clean monotonic booking lifecycle transitions
  if (
    prev.status === "COMPLETED" ||
    prev.status === "CANCELLED" ||
    prev.status === "REJECTED"
  ) {
    throw new Error(`Cannot change booking once it is ${prev.status}`)
  }
  if (nextStatus === "ACTIVE" && prev.status !== "APPROVED" && prev.status !== "PENDING") {
    throw new Error(`Cannot start handover from ${prev.status} state`)
  }
  if (nextStatus === "COMPLETED" && prev.status !== "ACTIVE" && prev.status !== "APPROVED") {
    throw new Error(`Cannot mark booking completed from ${prev.status} state`)
  }

  const next: FallbackRentalBookingRecord = {
    ...prev,
    status: nextStatus,
    notes: reason ? (prev.notes ? `${prev.notes} (${reason})` : reason) : prev.notes,
    updatedAt: new Date().toISOString(),
  }
  fallbackBookings[idx] = next

  const eqIdx = fallbackEquipment.findIndex((e) => e.id === next.equipmentId)
  if (eqIdx >= 0) {
    const eq = fallbackEquipment[eqIdx]
    const prevAvail = eq.availability
    if (nextStatus === "APPROVED" || nextStatus === "ACTIVE") {
      fallbackEquipment[eqIdx] = { ...eq, availability: "BOOKED", updatedAt: new Date().toISOString() }
    } else if (nextStatus === "COMPLETED" || nextStatus === "REJECTED" || nextStatus === "CANCELLED") {
      const stillOccupied = fallbackBookings.some(
        (b) =>
          b.id !== next.id &&
          b.equipmentId === eq.id &&
          (b.status === "APPROVED" || b.status === "ACTIVE")
      )
      if (!stillOccupied && eq.availability !== "MAINTENANCE") {
        fallbackEquipment[eqIdx] = { ...eq, availability: "AVAILABLE", updatedAt: new Date().toISOString() }
        if (prevAvail !== "AVAILABLE") {
          for (const [subMobile, ids] of fallbackEquipmentAlerts.entries()) {
            if (ids.includes(eq.id)) {
              pushEquipmentNotif(subMobile, {
                kind: "available",
                title: "Equipment Available Now ✓",
                body: `${eq.name} in ${eq.location} is available to book at ₹${eq.pricePerDay}/day.`,
                equipmentId: eq.id,
                tpl: "available",
                vars: { equip: eq.name, price: eq.pricePerDay },
              })
            }
          }
        }
      }
    }
  }

  if (nextStatus === "APPROVED") {
    pushEquipmentNotif(next.renterMobile, {
      kind: "accepted",
      title: "Booking Approved ✓",
      body: `${next.ownerName} approved your ${next.equipmentName} rental.`,
      equipmentId: next.equipmentId,
      bookingId: next.id,
      tpl: "renterAccepted",
      vars: { owner: next.ownerName, equip: next.equipmentName },
    })
    if (next.ownerMobile !== next.renterMobile) {
      pushEquipmentNotif(next.ownerMobile, {
        kind: "accepted",
        title: "Request Accepted ✓",
        body: `You accepted ${next.renterName}'s request for ${next.equipmentName}.`,
        equipmentId: next.equipmentId,
        bookingId: next.id,
        tpl: "accepted",
        vars: { renter: next.renterName, equip: next.equipmentName },
      })
    }
  } else if (nextStatus === "REJECTED") {
    pushEquipmentNotif(next.renterMobile, {
      kind: "rejected",
      title: "Booking Declined",
      body: `${next.ownerName} declined your request for ${next.equipmentName}.`,
      equipmentId: next.equipmentId,
      bookingId: next.id,
      tpl: "renterRejected",
      vars: { owner: next.ownerName, equip: next.equipmentName },
    })
  } else if (nextStatus === "ACTIVE") {
    pushEquipmentNotif(next.renterMobile, {
      kind: "starting",
      title: "Rental Handover Started 🚜",
      body: `${next.equipmentName} is now active with you (${next.startDate} – ${next.endDate}).`,
      equipmentId: next.equipmentId,
      bookingId: next.id,
    })
  } else if (nextStatus === "COMPLETED") {
    pushEquipmentNotif(next.renterMobile, {
      kind: "returned",
      title: "Rental Completed ✓",
      body: `Thank you for returning ${next.equipmentName}. Rate your experience!`,
      equipmentId: next.equipmentId,
      bookingId: next.id,
      tpl: "returned",
      vars: { equip: next.equipmentName },
    })
    if (next.ownerMobile !== next.renterMobile) {
      pushEquipmentNotif(next.ownerMobile, {
        kind: "returned",
        title: "Equipment Returned ✓",
        body: `${next.renterName} completed the ${next.equipmentName} rental (₹${next.totalAmount}).`,
        equipmentId: next.equipmentId,
        bookingId: next.id,
        tpl: "returned",
        vars: { equip: next.equipmentName },
      })
    }
  } else if (nextStatus === "CANCELLED" && next.ownerMobile !== next.renterMobile) {
    pushEquipmentNotif(next.ownerMobile, {
      kind: "cancelled",
      title: "Booking Cancelled",
      body: `${next.renterName} cancelled the rental request for ${next.equipmentName}.`,
      equipmentId: next.equipmentId,
      bookingId: next.id,
      tpl: "cancelled",
      vars: { renter: next.renterName, equip: next.equipmentName },
    })
  }

  saveStoreToDisk()
  return next
}

export function rateFallbackBooking(
  bookingId: string,
  _actorMobile: string,
  ratingInput: number,
  reviewComment?: string
) {
  const idx = fallbackBookings.findIndex((b) => b.id === bookingId)
  if (idx < 0) return null
  const rating = Math.min(5, Math.max(1, Math.round(Number(ratingInput) || 5)))
  const prev = fallbackBookings[idx]
  const wasRated = typeof prev.rating === "number"

  const nextBooking: FallbackRentalBookingRecord = {
    ...prev,
    rating,
    reviewComment: reviewComment !== undefined ? String(reviewComment).trim() : prev.reviewComment,
    updatedAt: new Date().toISOString(),
  }
  fallbackBookings[idx] = nextBooking

  const eqIdx = fallbackEquipment.findIndex((e) => e.id === nextBooking.equipmentId)
  let updatedEquipment: FallbackEquipmentRecord | null = null
  if (eqIdx >= 0) {
    const eq = fallbackEquipment[eqIdx]
    const prevCount = eq.reviewsCount || 0
    const prevSum = (eq.rating || 5) * prevCount
    const nextCount = wasRated ? Math.max(1, prevCount) : prevCount + 1
    const nextSum = wasRated
      ? prevSum - (prev.rating || rating) + rating
      : prevSum + rating
    const nextAvg = Math.round((nextSum / nextCount) * 10) / 10
    updatedEquipment = {
      ...eq,
      rating: nextAvg,
      reviewsCount: nextCount,
      updatedAt: new Date().toISOString(),
    }
    fallbackEquipment[eqIdx] = updatedEquipment

    if (eq.ownerMobile !== nextBooking.renterMobile) {
      pushEquipmentNotif(eq.ownerMobile, {
        kind: "reviewed",
        title: `New ${rating}★ Review`,
        body: `${nextBooking.renterName} rated ${eq.name} ${rating}/5 stars.`,
        equipmentId: eq.id,
        bookingId: nextBooking.id,
        tpl: "reviewed",
        vars: { renter: nextBooking.renterName, equip: eq.name, rating },
      })
    }
  }

  saveStoreToDisk()
  return { booking: nextBooking, equipment: updatedEquipment }
}

export function markFallbackEquipmentNotifsRead(rawMobile: string, notificationId?: string): number {
  const mobile = normalizeFallbackMobile(rawMobile)
  const list = fallbackEquipmentNotifs.get(mobile) || []
  let changed = 0
  const next = list.map((n) => {
    if (!n.read && (!notificationId || n.id === notificationId)) {
      changed++
      return { ...n, read: true }
    }
    return n
  })
  if (changed > 0) {
    fallbackEquipmentNotifs.set(mobile, next)
    saveStoreToDisk()
  }
  return changed
}

// ==============================================================================
// Crop Insurance (PMFBY) Persistent Store Helpers
// ==============================================================================

const INS_APP_STEPS: FallbackInsuranceAppRecord["status"][] = [
  "submitted",
  "under_review",
  "approved",
  "policy_issued",
]

const INS_CLAIM_STEPS: FallbackInsuranceClaimRecord["status"][] = [
  "submitted",
  "initial_review",
  "field_assessment",
  "approved",
  "payment_processing",
  "completed",
]

function getSeasonPremiumRate(season?: string): number {
  const s = String(season || "Kharif").toLowerCase()
  if (s.includes("rabi")) return 0.015
  if (s.includes("comm") || s.includes("hort") || s.includes("annual")) return 0.05
  return 0.02
}

function getSeasonDates(season?: string, year = new Date().getFullYear()): { start: string; end: string } {
  const s = String(season || "Kharif").toLowerCase()
  if (s.includes("rabi")) {
    return { start: `1 Nov ${year}`, end: `30 Apr ${year + 1}` }
  }
  if (s.includes("comm") || s.includes("hort") || s.includes("annual")) {
    return { start: `1 Apr ${year}`, end: `31 Mar ${year + 1}` }
  }
  return { start: `1 Jun ${year}`, end: `30 Nov ${year}` }
}

function getOrCreateInsuranceBucket(rawMobile: string): FallbackInsuranceState {
  const mobile = normalizeFallbackMobile(rawMobile)
  let bucket = fallbackInsuranceByMobile.get(mobile)
  if (!bucket) {
    bucket = {
      applications: [],
      policies: [],
      claims: [],
      documents: [],
      notifications: [],
    }
    fallbackInsuranceByMobile.set(mobile, bucket)
  }
  return bucket
}

function insUid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function getFallbackInsuranceState(rawMobile: string): FallbackInsuranceState {
  const b = getOrCreateInsuranceBucket(rawMobile)
  return {
    applications: [...b.applications],
    policies: [...b.policies],
    claims: [...b.claims],
    documents: [...b.documents],
    notifications: [...b.notifications],
  }
}

export function submitFallbackInsuranceApplication(
  rawMobile: string,
  data: Partial<FallbackInsuranceAppRecord>
): { application: FallbackInsuranceAppRecord; state: FallbackInsuranceState } {
  const mobile = normalizeFallbackMobile(rawMobile || data.mobile)
  const farmer = getOrCreateFallbackFarmer(mobile)
  const bucket = getOrCreateInsuranceBucket(mobile)
  const currentYear = new Date().getFullYear()
  const acres = Math.max(0.1, parseFloat(String(data.area ?? farmer.farmSize ?? 2.0)) || 2.0)
  const season = String(data.season || "Kharif").trim() || "Kharif"
  const rate = getSeasonPremiumRate(season)
  const coverage = Math.round(acres * 45000)
  const premium = Math.round(coverage * rate)
  const today = new Date().toLocaleDateString("en-IN")
  const dates = getSeasonDates(season, currentYear)

  const id = String(data.id || insUid("app"))
  const app: FallbackInsuranceAppRecord = {
    id,
    crop: String(data.crop || farmer.activeCrops?.[0]?.cropName || "Rice").trim(),
    season,
    district: String(data.district || farmer.district || "Mandya").trim(),
    taluk: String(data.taluk || farmer.taluk || "Pandavapura").trim(),
    area: String(data.area || farmer.farmSize || "2.0").trim(),
    status: "submitted",
    submittedDate: today,
    farmerName: String(data.farmerName || farmer.name || "Farmer").trim(),
    mobile,
    coverage,
    premium,
    surveyNumber: String(data.surveyNumber || "SY-001").trim(),
    ownershipType: String(data.ownershipType || "Owned").trim(),
    sowingDate: String(data.sowingDate || dates.start).trim(),
    harvestDate: String(data.harvestDate || dates.end).trim(),
  }

  bucket.applications.unshift(app)
  bucket.documents.unshift({
    id: insUid("doc"),
    name: "Application Receipt",
    type: "application_receipt",
    date: today,
    status: "available",
    relatedId: app.id,
  })
  bucket.notifications.unshift({
    id: insUid("notif"),
    kind: "application",
    key: "application",
    vars: { crop: app.crop, season: app.season },
    at: Date.now(),
    read: false,
  })

  saveStoreToDisk()
  return { application: app, state: getFallbackInsuranceState(mobile) }
}

export function advanceFallbackInsuranceApplication(
  rawMobile: string,
  appId: string
): { application: FallbackInsuranceAppRecord; state: FallbackInsuranceState } | null {
  const mobile = normalizeFallbackMobile(rawMobile)
  const bucket = getOrCreateInsuranceBucket(mobile)
  const idx = bucket.applications.findIndex((a) => a.id === appId)
  if (idx < 0) return null

  const current = bucket.applications[idx]
  const stepIdx = INS_APP_STEPS.indexOf(current.status)
  if (stepIdx < 0 || stepIdx >= INS_APP_STEPS.length - 1) {
    return { application: current, state: getFallbackInsuranceState(mobile) }
  }

  const nextStatus = INS_APP_STEPS[stepIdx + 1]
  const updated: FallbackInsuranceAppRecord = { ...current, status: nextStatus }
  bucket.applications[idx] = updated

  if (nextStatus === "approved") {
    bucket.notifications.unshift({
      id: insUid("notif"),
      kind: "approved",
      key: "approved",
      vars: { crop: updated.crop },
      at: Date.now(),
      read: false,
    })
  } else if (nextStatus === "policy_issued") {
    const policyId = insUid("pol")
    const currentYear = new Date().getFullYear()
    const suffix = String(bucket.policies.length + 101).padStart(3, "0")
    const policyNumber = `PMFBY-KA-${currentYear}-${suffix}`
    const today = new Date().toLocaleDateString("en-IN")
    const dates = getSeasonDates(updated.season, currentYear)

    const policy: FallbackInsurancePolicyRecord = {
      id: policyId,
      policyNumber,
      applicationId: updated.id,
      crop: updated.crop,
      season: updated.season,
      area: updated.area,
      coverage: updated.coverage,
      premium: updated.premium,
      startDate: dates.start,
      endDate: dates.end,
      farmerName: updated.farmerName,
      district: updated.district,
    }
    bucket.policies.unshift(policy)
    bucket.documents.unshift(
      {
        id: insUid("doc"),
        name: "Policy Document",
        type: "policy",
        date: today,
        status: "available",
        relatedId: policyId,
      },
      {
        id: insUid("doc"),
        name: "Premium Receipt",
        type: "premium_receipt",
        date: today,
        status: "available",
        relatedId: policyId,
      }
    )
    bucket.notifications.unshift({
      id: insUid("notif"),
      kind: "policy_issued",
      key: "policy_issued",
      vars: { policyNumber },
      at: Date.now(),
      read: false,
    })
  }

  saveStoreToDisk()
  return { application: updated, state: getFallbackInsuranceState(mobile) }
}

export function submitFallbackInsuranceClaim(
  rawMobile: string,
  data: {
    id?: string
    policyId: string
    policyNumber: string
    crop: string
    lossType: string
    incidentDate: string
    area: string
    description: string
  }
): { claim: FallbackInsuranceClaimRecord; state: FallbackInsuranceState } {
  const mobile = normalizeFallbackMobile(rawMobile)
  const bucket = getOrCreateInsuranceBucket(mobile)
  const today = new Date().toLocaleDateString("en-IN")
  const id = String(data.id || insUid("clm"))
  const suffix = String(bucket.claims.length + 201).padStart(3, "0")
  const claimNumber = `CLM-KA-${suffix}`

  const claim: FallbackInsuranceClaimRecord = {
    id,
    claimNumber,
    policyId: String(data.policyId || "pmfby-direct"),
    policyNumber: String(data.policyNumber || `PMFBY-KA-${new Date().getFullYear()}`),
    crop: String(data.crop || "Rice").trim(),
    lossType: String(data.lossType || "drought").trim(),
    incidentDate: String(data.incidentDate || today).trim(),
    area: String(data.area || "2.0").trim(),
    status: "submitted",
    submittedDate: today,
    description: String(data.description || "").trim(),
  }

  bucket.claims.unshift(claim)
  bucket.documents.unshift({
    id: insUid("doc"),
    name: "Claim Receipt",
    type: "claim_receipt",
    date: today,
    status: "available",
    relatedId: claim.id,
  })
  bucket.notifications.unshift({
    id: insUid("notif"),
    kind: "claim",
    key: "claim",
    vars: { crop: claim.crop, claimNumber: claim.claimNumber },
    at: Date.now(),
    read: false,
  })

  saveStoreToDisk()
  return { claim, state: getFallbackInsuranceState(mobile) }
}

export function advanceFallbackInsuranceClaim(
  rawMobile: string,
  claimId: string
): { claim: FallbackInsuranceClaimRecord; state: FallbackInsuranceState } | null {
  const mobile = normalizeFallbackMobile(rawMobile)
  const bucket = getOrCreateInsuranceBucket(mobile)
  const idx = bucket.claims.findIndex((c) => c.id === claimId)
  if (idx < 0) return null

  const current = bucket.claims[idx]
  const stepIdx = INS_CLAIM_STEPS.indexOf(current.status)
  if (stepIdx < 0 || stepIdx >= INS_CLAIM_STEPS.length - 1) {
    return { claim: current, state: getFallbackInsuranceState(mobile) }
  }

  const nextStatus = INS_CLAIM_STEPS[stepIdx + 1]
  const updated: FallbackInsuranceClaimRecord = { ...current, status: nextStatus }
  bucket.claims[idx] = updated

  if (nextStatus === "approved") {
    bucket.notifications.unshift({
      id: insUid("notif"),
      kind: "claim_update",
      key: "claim_approved",
      vars: { crop: updated.crop, claimNumber: updated.claimNumber },
      at: Date.now(),
      read: false,
    })
  } else if (nextStatus === "payment_processing") {
    bucket.notifications.unshift({
      id: insUid("notif"),
      kind: "claim_update",
      key: "claim_payment",
      vars: { claimNumber: updated.claimNumber },
      at: Date.now(),
      read: false,
    })
  }

  saveStoreToDisk()
  return { claim: updated, state: getFallbackInsuranceState(mobile) }
}

export function addFallbackInsuranceDocument(
  rawMobile: string,
  data: { name: string; relatedId?: string }
): { document: FallbackInsuranceDocRecord; state: FallbackInsuranceState } {
  const mobile = normalizeFallbackMobile(rawMobile)
  const bucket = getOrCreateInsuranceBucket(mobile)
  const today = new Date().toLocaleDateString("en-IN")
  const doc: FallbackInsuranceDocRecord = {
    id: insUid("doc"),
    name: String(data.name || "Uploaded Document").trim(),
    type: "uploaded",
    date: today,
    status: "available",
    relatedId: data.relatedId,
  }
  bucket.documents.unshift(doc)
  saveStoreToDisk()
  return { document: doc, state: getFallbackInsuranceState(mobile) }
}

export function markFallbackInsuranceNotifsRead(rawMobile: string): {
  updatedCount: number
  state: FallbackInsuranceState
} {
  const mobile = normalizeFallbackMobile(rawMobile)
  const bucket = getOrCreateInsuranceBucket(mobile)
  let updatedCount = 0
  bucket.notifications = bucket.notifications.map((n) => {
    if (!n.read) {
      updatedCount++
      return { ...n, read: true }
    }
    return n
  })
  if (updatedCount > 0) {
    saveStoreToDisk()
  }
  return { updatedCount, state: getFallbackInsuranceState(mobile) }
}

/**
 * Deletes all fallback store records for a farmer mobile (Play Store Account/Data Deletion compliance).
 */
export function deleteFallbackFarmerAccount(rawMobile: string): { deleted: boolean } {
  const mobile = normalizeFallbackMobile(rawMobile)
  fallbackFarmers.delete(mobile)
  fallbackTips.delete(mobile)
  fallbackScans.delete(mobile)
  fallbackSchemeProgress.delete(mobile)
  fallbackEquipmentAlerts.delete(mobile)
  fallbackEquipmentNotifs.delete(mobile)
  fallbackInsuranceByMobile.delete(mobile)

  fallbackEquipment = fallbackEquipment.filter((eq) => eq.ownerMobile !== mobile)
  fallbackBookings = fallbackBookings.filter(
    (b) => b.renterMobile !== mobile && b.ownerMobile !== mobile
  )

  saveStoreToDisk()
  return { deleted: true }
}

// ==============================================================================
// Admin Management API Functions
// ==============================================================================

export function getAllFallbackFarmers(): FarmerProfileData[] {
  seedInitial10FarmersIfNeeded()
  const list: FarmerProfileData[] = []
  for (const [m, f] of fallbackFarmers.entries()) {
    const scansCount = (fallbackScans.get(m) || []).length
    const tipsCount = (fallbackTips.get(m) || []).length
    list.push({
      ...f,
      _count: { scans: scansCount, savedTips: tipsCount },
    })
  }
  return list
}

export function resetAllFallbackFarmersToSeed(): FarmerProfileData[] {
  fallbackFarmers.clear()
  fallbackScans.clear()
  for (const f of INITIAL_10_FARMERS) {
    fallbackFarmers.set(f.mobile, JSON.parse(JSON.stringify(f)))
  }
  for (const [m, scans] of Object.entries(INITIAL_FARMER_SCANS)) {
    fallbackScans.set(m, JSON.parse(JSON.stringify(scans)))
  }
  saveStoreToDisk()
  return getAllFallbackFarmers()
}

export function updateFallbackFarmerFields(mobile: string, updates: Partial<FarmerProfileData>): any {
  const norm = normalizeFallbackMobile(mobile)
  const f = getOrCreateFallbackFarmer(norm)
  Object.assign(f, updates)
  f.mobile = norm
  saveStoreToDisk()
  return f
}

export function deleteFallbackFarmerByMobile(mobile: string): boolean {
  const norm = normalizeFallbackMobile(mobile)
  const existed = fallbackFarmers.delete(norm)
  fallbackScans.delete(norm)
  fallbackTips.delete(norm)
  saveStoreToDisk()
  return existed
}

export function addPlotToFallbackFarmer(mobile: string, plot: ActiveCropPlot): any {
  const f = getOrCreateFallbackFarmer(mobile)
  if (!Array.isArray(f.activeCrops)) f.activeCrops = []
  f.activeCrops.push(plot)
  saveStoreToDisk()
  return f
}

export function updatePlotInFallbackFarmer(
  mobile: string,
  plotId: string,
  updates: Partial<ActiveCropPlot>
): any {
  const f = getOrCreateFallbackFarmer(mobile)
  if (Array.isArray(f.activeCrops)) {
    const idx = f.activeCrops.findIndex((p: any) => p.id === plotId)
    if (idx !== -1) {
      f.activeCrops[idx] = { ...f.activeCrops[idx], ...updates }
    }
  }
  saveStoreToDisk()
  return f
}

export function deletePlotFromFallbackFarmer(mobile: string, plotId: string): any {
  const f = getOrCreateFallbackFarmer(mobile)
  if (Array.isArray(f.activeCrops)) {
    f.activeCrops = f.activeCrops.filter((p: any) => p.id !== plotId)
  }
  saveStoreToDisk()
  return f
}

export function getAdminAggregateStats() {
  const farmers = getAllFallbackFarmers()
  let totalAcres = 0
  const cropCounts: Record<string, number> = {}
  const cropAcreage: Record<string, number> = {}
  const districtCounts: Record<string, number> = {}
  const districtAcres: Record<string, number> = {}
  const irrigationCounts: Record<string, number> = {}
  const healthCounts: Record<string, number> = {
    HEALTHY: 0,
    WATER_STRESSED: 0,
    PEST_SUSPECTED: 0,
    LOW_NUTRIENTS: 0,
  }
  let activeAlerts = 0
  let totalPlots = 0
  let rtcVerifiedCount = 0

  for (const f of farmers) {
    const size = Number(f.farmSize) || 0
    totalAcres += size
    if (f.rtcVerified) rtcVerifiedCount++
    districtCounts[f.district] = (districtCounts[f.district] || 0) + 1
    districtAcres[f.district] = Math.round(((districtAcres[f.district] || 0) + size) * 10) / 10
    irrigationCounts[f.irrigationType] = (irrigationCounts[f.irrigationType] || 0) + 1

    if (Array.isArray(f.activeCrops)) {
      totalPlots += f.activeCrops.length
      for (const p of f.activeCrops) {
        cropCounts[p.cropName] = (cropCounts[p.cropName] || 0) + 1
        cropAcreage[p.cropName] = Math.round(((cropAcreage[p.cropName] || 0) + (Number(p.acreage) || 0)) * 10) / 10
        if (p.healthStatus && healthCounts[p.healthStatus] !== undefined) {
          healthCounts[p.healthStatus]++
        }
        if (
          p.healthStatus === "PEST_SUSPECTED" ||
          p.healthStatus === "WATER_STRESSED" ||
          p.healthStatus === "LOW_NUTRIENTS"
        ) {
          activeAlerts++
        }
      }
    }
  }

  let totalScans = 0
  const diseaseCounts: Record<string, number> = {}
  for (const scans of fallbackScans.values()) {
    totalScans += scans.length
    for (const s of scans) {
      if (s.diseaseName) {
        diseaseCounts[s.diseaseName] = (diseaseCounts[s.diseaseName] || 0) + 1
      }
    }
  }

  return {
    totalFarmers: farmers.length,
    totalAcres: Math.round(totalAcres * 10) / 10,
    totalPlots,
    rtcVerifiedCount,
    activeAlerts,
    totalScans,
    cropCounts,
    cropAcreage,
    districtCounts,
    districtAcres,
    irrigationCounts,
    healthCounts,
    diseaseCounts,
    lastUpdated: new Date().toISOString(),
  }
}

export function updateFarmerSoil(
  mobile: string,
  soil: { soilN?: number; soilP?: number; soilK?: number; soilPh?: number; soilType?: string }
): any {
  const norm = normalizeFallbackMobile(mobile)
  const f = getOrCreateFallbackFarmer(norm)
  if (soil.soilN !== undefined) f.soilN = Number(soil.soilN)
  if (soil.soilP !== undefined) f.soilP = Number(soil.soilP)
  if (soil.soilK !== undefined) f.soilK = Number(soil.soilK)
  if (soil.soilPh !== undefined) f.soilPh = Number(soil.soilPh)
  if (soil.soilType) f.soilType = soil.soilType
  saveStoreToDisk()
  return f
}

export interface BroadcastAdvisory {
  id: string
  titleEn: string
  titleKn: string
  category: "WEATHER_ALERT" | "PEST_WARNING" | "FERTILIZER" | "MARKET_SPIKE" | "SCHEME"
  targetDistrict: string
  targetCrop: string
  urgency: "INFO" | "MODERATE" | "URGENT"
  messageEn: string
  messageKn: string
  createdAt: string
  sentCount: number
}

const SEED_BROADCAST_ADVISORIES: BroadcastAdvisory[] = [
  {
    id: "bcast-01",
    titleEn: "Yellow Stem Borer Outbreak Alert in Mandya & Cauvery Basin",
    titleKn: "ಮಂಡ್ಯ ಮತ್ತು ಕಾವೇರಿ ಕಣಿವೆಯಲ್ಲಿ ಹಳದಿ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುವಿನ ಎಚ್ಚರಿಕೆ",
    category: "PEST_WARNING",
    targetDistrict: "Mandya",
    targetCrop: "Rice (Paddy)",
    urgency: "URGENT",
    messageEn: "Continuous cloudy weather has caused pest incidence in tillering paddy. Monitor for dead hearts. Apply Cartap Hydrochloride 4G @ 8 kg/acre or spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L immediately.",
    messageKn: "ಮೋಡ ಕವಿದ ವಾತಾವರಣದಿಂದ ಭತ್ತದಲ್ಲಿ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ಬಾಧೆ ಹೆಚ್ಚಾಗಿದೆ. ಸುಳಿ ಒಣಗುವುದನ್ನು ಗಮನಿಸಿ. ತಕ್ಷಣ ಪ್ರತಿ ಎಕರೆಗೆ ಕಾರ್ಟಾಪ್ ಹೈಡ್ರೋಕ್ಲೋರೈಡ್ 4G (8 ಕೆ.ಜಿ) ಅಥವಾ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ (0.3 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    sentCount: 1420,
  },
  {
    id: "bcast-02",
    titleEn: "Heavy Thunderstorm Warning for Malnad & Western Ghats",
    titleKn: "ಮಲೆನಾಡು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳಲ್ಲಿ ಭಾರಿ ಗುಡುಗು ಸಹಿತ ಮಳೆ ಎಚ್ಚರಿಕೆ",
    category: "WEATHER_ALERT",
    targetDistrict: "Shimoga",
    targetCrop: "Arecanut",
    urgency: "URGENT",
    messageEn: "IMD predicts heavy unseasonal rain (40-65 mm) with wind gusts in Shimoga and Chikkamagaluru. Ensure proper trench drainage in Arecanut and Coffee estates. Suspend spraying operations.",
    messageKn: "ಶಿವಮೊಗ್ಗ ಮತ್ತು ಚಿಕ್ಕಮಗಳೂರಿನಲ್ಲಿ ಭಾರಿ ಮಳೆ (40-65 ಮಿ.ಮೀ) ಸಾಧ್ಯತೆ. ಅಡಿಕೆ ಹಾಗೂ ಕಾಫಿ ತೋಟಗಳಲ್ಲಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯಲು ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಯಾವುದೇ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಯನ್ನು ಮುಂದೂಡಿ.",
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    sentCount: 2850,
  },
  {
    id: "bcast-03",
    titleEn: "Raitha Siri ₹10,000/ha Millet Incentive DBT Verification Drive",
    titleKn: "ರೈತ ಸಿರಿ ₹10,000/ಹೆಕ್ಟೇರ್ ಸಿರಿಧಾನ್ಯ ಪ್ರೋತ್ಸಾಹಧನ ಪರಿಶೀಲನಾ ಅಭಿಯಾನ",
    category: "SCHEME",
    targetDistrict: "ALL",
    targetCrop: "Ragi",
    urgency: "MODERATE",
    messageEn: "Karnataka Dept of Agriculture announces direct benefit transfer under Raitha Siri for certified Finger Millet (Ragi), Foxtail, and Little Millet growers. Ensure your Aadhaar is linked to FRUITS FID.",
    messageKn: "ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆಯಿಂದ ರಾಗಿ ಮತ್ತು ಸಿರಿಧಾನ್ಯ ಬೆಳೆಗಾರರಿಗೆ ಹೆಕ್ಟೇರ್‌ಗೆ ₹10,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ. ನಿಮ್ಮ ಆಧಾರ್ ಅನ್ನು ಫ್ರೂಟ್ಸ್ (FRUITS) ಐಡಿಗೆ ಲಿಂಕ್ ಮಾಡಲಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    sentCount: 5600,
  },
  {
    id: "bcast-04",
    titleEn: "Urea & DAP Supply Replenished at Raita Samparka Kendras (RSK)",
    titleKn: "ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳಲ್ಲಿ (RSK) ಯೂರಿಯಾ ಮತ್ತು ಡಿಎಪಿ ಗೊಬ್ಬರ ದಾಸ್ತಾನು ಲಭ್ಯ",
    category: "FERTILIZER",
    targetDistrict: "Belagavi",
    targetCrop: "Sugarcane",
    urgency: "INFO",
    messageEn: "Subsidized Neem-coated Urea and DAP rake has arrived in Belagavi & Bagalkot. Farmers can collect up to 5 bags per registered RTC at their nearest RSK center.",
    messageKn: "ಬೆಳಗಾವಿ ಮತ್ತು ಬಾಗಲಕೋಟೆ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳಲ್ಲಿ ಬೇವಿನ ಲೇಪಿತ ಯೂರಿಯಾ ಮತ್ತು ಡಿಎಪಿ ದಾಸ್ತಾನು ತಲುಪಿದೆ. ನೋಂದಾಯಿತ ಪಹಣಿ (RTC) ತೋರಿಸಿ ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ರಸಗೊಬ್ಬರ ಪಡೆಯಬಹುದು.",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    sentCount: 3900,
  },
]

let fallbackBroadcasts: BroadcastAdvisory[] = [...SEED_BROADCAST_ADVISORIES]

export function getAllBroadcastAdvisories(): BroadcastAdvisory[] {
  return [...fallbackBroadcasts]
}

export function addBroadcastAdvisory(advisory: Omit<BroadcastAdvisory, "id" | "createdAt" | "sentCount">): BroadcastAdvisory {
  const newAdvisory: BroadcastAdvisory = {
    ...advisory,
    id: `bcast-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sentCount: advisory.targetDistrict === "ALL" ? 12450 : Math.floor(1200 + Math.random() * 2500),
  }
  fallbackBroadcasts.unshift(newAdvisory)
  return newAdvisory
}

export function deleteBroadcastAdvisory(id: string): boolean {
  const initialLen = fallbackBroadcasts.length
  fallbackBroadcasts = fallbackBroadcasts.filter((b) => b.id !== id)
  return fallbackBroadcasts.length < initialLen
}

export interface SchemeApplicationRecord {
  farmerMobile: string
  farmerName: string
  farmerNameKn: string
  district: string
  schemeId: string
  schemeNameEn: string
  schemeNameKn: string
  benefitEn: string
  status: "APPROVED" | "VERIFIED" | "UNDER_REVIEW" | "NOT_APPLIED" | "DISBURSED"
  appliedDate: string
  disbursedAmount?: string
}

const SEED_SCHEME_APPLICATIONS: SchemeApplicationRecord[] = [
  {
    farmerMobile: "9591502209",
    farmerName: "Naveen Kumar KM",
    farmerNameKn: "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ",
    district: "Mandya",
    schemeId: "pm-kisan",
    schemeNameEn: "PM-KISAN Samman Nidhi",
    schemeNameKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    benefitEn: "₹6,000 / year (3 installments)",
    status: "DISBURSED",
    appliedDate: "2024-03-15",
    disbursedAmount: "₹2,000 (16th Installment Credited)",
  },
  {
    farmerMobile: "9591502209",
    farmerName: "Naveen Kumar KM",
    farmerNameKn: "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ",
    district: "Mandya",
    schemeId: "pmfby",
    schemeNameEn: "PMFBY Crop Insurance (Paddy & Ragi)",
    schemeNameKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
    benefitEn: "100% sum insured against natural perils",
    status: "APPROVED",
    appliedDate: "2024-06-20",
    disbursedAmount: "Policy Active: PMFBY-KA-2024-101",
  },
  {
    farmerMobile: "9845011001",
    farmerName: "Basavaraj Patil",
    farmerNameKn: "ಬಸವರಾಜ ಪಾಟೀಲ",
    district: "Belagavi",
    schemeId: "pm-kisan",
    schemeNameEn: "PM-KISAN Samman Nidhi",
    schemeNameKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    benefitEn: "₹6,000 / year",
    status: "DISBURSED",
    appliedDate: "2024-02-10",
    disbursedAmount: "₹2,000 Credited",
  },
  {
    farmerMobile: "9845011001",
    farmerName: "Basavaraj Patil",
    farmerNameKn: "ಬಸವರಾಜ ಪಾಟೀಲ",
    district: "Belagavi",
    schemeId: "krushi-bhagya",
    schemeNameEn: "Krushi Bhagya Farm Pond & Polyhouse",
    schemeNameKn: "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ (ಕೃಷಿ ಹೊಂಡ)",
    benefitEn: "80-90% subsidy on farm pond with polythene lining",
    status: "UNDER_REVIEW",
    appliedDate: "2024-08-04",
  },
  {
    farmerMobile: "9845011002",
    farmerName: "Manjunath Hegde",
    farmerNameKn: "ಮಂಜುನಾಥ ಹೆಗಡೆ",
    district: "Shimoga",
    schemeId: "pmksy-micro-irrigation",
    schemeNameEn: "PMKSY Drip & Sprinkler Subsidy",
    schemeNameKn: "ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಯೋಜನೆ (ಹನಿ ನೀರಾವರಿ)",
    benefitEn: "90% subsidy for small & marginal farmers",
    status: "APPROVED",
    appliedDate: "2024-05-18",
    disbursedAmount: "Subsidy Sanctioned: ₹42,500",
  },
  {
    farmerMobile: "9845011003",
    farmerName: "Siddaramaiah Reddy",
    farmerNameKn: "ಸಿದ್ದರಾಮಯ್ಯ ರೆಡ್ಡಿ",
    district: "Kolar",
    schemeId: "raitha-siri",
    schemeNameEn: "Karnataka Raitha Siri (Millet Incentive)",
    schemeNameKn: "ರೈತ ಸಿರಿ ಯೋಜನೆ",
    benefitEn: "₹10,000 per hectare direct DBT",
    status: "VERIFIED",
    appliedDate: "2024-07-12",
  },
  {
    farmerMobile: "9845011004",
    farmerName: "Mallikarjun Biradar",
    farmerNameKn: "ಮಲ್ಲಿಕಾರ್ಜುನ ಬಿರಾದಾರ",
    district: "Vijayapura",
    schemeId: "kcc",
    schemeNameEn: "Kisan Credit Card (Subsidized 4% Crop Loan)",
    schemeNameKn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್",
    benefitEn: "Collateral-free loan up to ₹1.6 Lakhs @ 4%",
    status: "APPROVED",
    appliedDate: "2024-04-11",
    disbursedAmount: "Limit: ₹1,50,000",
  },
  {
    farmerMobile: "9845011005",
    farmerName: "Chandrashekar Gowda",
    farmerNameKn: "ಚಂದ್ರಶೇಖರ ಗೌಡ",
    district: "Chikkamagaluru",
    schemeId: "pmfby",
    schemeNameEn: "Coffee & Spices Weather-Based Insurance",
    schemeNameKn: "ಹವಾಮಾನ ಆಧಾರಿತ ಬೆಳೆ ವಿಮೆ ಯೋಜನೆ",
    benefitEn: "Protection against deficit rainfall",
    status: "APPROVED",
    appliedDate: "2024-06-01",
    disbursedAmount: "Policy Active",
  },
  {
    farmerMobile: "9845011006",
    farmerName: "Revanna Siddappa",
    farmerNameKn: "ರೇವಣ್ಣ ಸಿದ್ದಪ್ಪ",
    district: "Davanagere",
    schemeId: "pm-kisan",
    schemeNameEn: "PM-KISAN Samman Nidhi",
    schemeNameKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    benefitEn: "₹6,000 / year",
    status: "DISBURSED",
    appliedDate: "2024-03-22",
    disbursedAmount: "₹2,000 Credited",
  },
  {
    farmerMobile: "9845011007",
    farmerName: "Gurusiddappa Pujar",
    farmerNameKn: "ಗುರುಸಿದ್ದಪ್ಪ ಪೂಜಾರ",
    district: "Haveri",
    schemeId: "raitha-siri",
    schemeNameEn: "Karnataka Raitha Siri",
    schemeNameKn: "ರೈತ ಸಿರಿ ಯೋಜನೆ",
    benefitEn: "₹10,000/ha for Byadagi Chilli intercropped with Millets",
    status: "VERIFIED",
    appliedDate: "2024-07-29",
  },
  {
    farmerMobile: "9845011008",
    farmerName: "Sangappa Terdal",
    farmerNameKn: "ಸಂಗಪ್ಪ ತೇರದಾಳ",
    district: "Bagalkot",
    schemeId: "krushi-bhagya",
    schemeNameEn: "Krushi Bhagya Farm Pond",
    schemeNameKn: "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ",
    benefitEn: "80% Subsidy for Pomegranate Orchard Farm Pond",
    status: "UNDER_REVIEW",
    appliedDate: "2024-09-02",
  },
  {
    farmerMobile: "9845011009",
    farmerName: "Kempegowda Patil",
    farmerNameKn: "ಕೆಂಪೇಗೌಡ ಪಾಟೀಲ",
    district: "Tumkur",
    schemeId: "pashu-bhagya",
    schemeNameEn: "Pashu Bhagya (Dairy & Fodder Subsidy)",
    schemeNameKn: "ಪಶು ಭಾಗ್ಯ ಯೋಜನೆ",
    benefitEn: "50% subsidy for 2 milch cows + chaff cutter",
    status: "APPROVED",
    appliedDate: "2024-05-14",
    disbursedAmount: "Sanctioned: ₹60,000",
  },
]

let fallbackSchemeApplications: SchemeApplicationRecord[] = [...SEED_SCHEME_APPLICATIONS]

export function getAllSchemeApplications(): SchemeApplicationRecord[] {
  return [...fallbackSchemeApplications]
}

export function updateSchemeApplicationStatus(
  farmerMobile: string,
  schemeId: string,
  newStatus: SchemeApplicationRecord["status"],
  disbursedAmount?: string
): boolean {
  const app = fallbackSchemeApplications.find(
    (a) => a.farmerMobile === farmerMobile && a.schemeId === schemeId
  )
  if (app) {
    app.status = newStatus
    if (disbursedAmount !== undefined) app.disbursedAmount = disbursedAmount
    saveStoreToDisk()
    return true
  }
  return false
}


