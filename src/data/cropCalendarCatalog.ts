// ==============================================================================
// 32+ Dynamic Crop Calendar & Agronomy Catalog
// Comprehensive agronomic data with stage progression, localized Kannada & English,
// dynamic stage calculation, and tailored advisories for Karnataka & Indian farming.
// ==============================================================================

export type CropCategory =
  | "Cereals & Millets"
  | "Pulses & Legumes"
  | "Vegetables"
  | "Commercial & Cash Crops"
  | "Plantation & Fruits"

export interface CropStageAdvisory {
  category: "IRRIGATION" | "FERTILIZER" | "PEST_PREVENTION" | "WEATHER_ALERT"
  titleEn: string
  titleKn: string
  bodyEn: string
  bodyKn: string
  urgency: "LOW" | "MEDIUM" | "HIGH"
}

export interface CropGrowthStage {
  key: string
  nameEn: string
  nameKn: string
  startDay: number
  endDay: number
  descriptionEn: string
  descriptionKn: string
  advisories: CropStageAdvisory[]
}

export interface CropCalendarItem {
  id: string
  nameEn: string
  nameKn: string
  scientificName: string
  category: CropCategory
  categoryKn: string
  totalDays: number
  isPerennial?: boolean
  popularVarieties: string[]
  seasons: ("Kharif" | "Rabi" | "Summer")[]
  soilType: string
  soilTypeKn: string
  iconName: string
  stages: CropGrowthStage[]
}

export const CROP_CATEGORIES: { id: string; en: string; kn: string }[] = [
  { id: "ALL", en: "All Crops", kn: "ಎಲ್ಲಾ ಬೆಳೆಗಳು" },
  { id: "Cereals & Millets", en: "Cereals & Millets", kn: "ಧಾನ್ಯಗಳು & ಸಿರಿಧಾನ್ಯ" },
  { id: "Pulses & Legumes", en: "Pulses & Legumes", kn: "ದ್ವಿದಳ ಧಾನ್ಯಗಳು" },
  { id: "Vegetables", en: "Vegetables", kn: "ತರಕಾರಿಗಳು" },
  { id: "Commercial & Cash Crops", en: "Cash Crops", kn: "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು" },
  { id: "Plantation & Fruits", en: "Plantation & Fruits", kn: "ತೋಟಗಾರಿಕೆ & ಹಣ್ಣು" },
]

export const CROPS_CATALOG: CropCalendarItem[] = [
  {
    "id": "rice",
    "nameEn": "Rice (Paddy)",
    "nameKn": "ಭತ್ತ (Paddy)",
    "scientificName": "Oryza sativa",
    "category": "Cereals & Millets",
    "categoryKn": "ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು",
    "totalDays": 115,
    "isPerennial": false,
    "popularVarieties": [
      "BPT 5204 (Sona Masoori)",
      "Jaya",
      "IR 64",
      "MTU 1010",
      "Tellahamsa",
      "Gangavathi Sona"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Clayey loam, alluvial soil with good water retention",
    "soilTypeKn": "ಜೇಡಿ ಮಿಶ್ರಿತ ಮಣ್ಣು, ಮೆಕ್ಕಲು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "NURSERY_SOWING",
        "nameEn": "Nursery & Sowing",
        "nameKn": "ಸಸಿಮಡಿ ಮತ್ತು ಬಿತ್ತನೆ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Seed germination and seedling establishment in nursery bed.",
        "descriptionKn": "ಸಸಿಮಡಿಯಲ್ಲಿ ಬೀಜ ಮೊಳಕೆಯೊಡೆಯುವುದು ಮತ್ತು ಸಸಿಗಳ ಬೆಳವಣಿಗೆ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Maintain 2-3 cm Shallow Water",
            "titleKn": "2-3 ಸೆಂ.ಮೀ ತೆಳು ನೀರು ನಿರ್ವಹಿಸಿ",
            "bodyEn": "Keep shallow water level in nursery. Drain before nutrient sprays.",
            "bodyKn": "ಸಸಿಮಡಿಯಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ತೆಳು ನೀರು ನಿಲ್ಲಿಸಿ. ಗೊಬ್ಬರ ಕೊಡುವಾಗ ನೀರು ಬಸಿದುಬಿಡಿ.",
            "urgency": "MEDIUM"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Seed Treatment with Trichoderma",
            "titleKn": "ಟ್ರೈಕೋಡರ್ಮಾ ಬೀಜೋಪಚಾರ",
            "bodyEn": "Treat seeds with Trichoderma viride (4g/kg) to prevent blast and damping-off.",
            "bodyKn": "ಬೆಂಕಿ ರೋಗ ತಡೆಯಲು 1 ಕೆಜಿ ಬೀಜಕ್ಕೆ 4 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಬೆರೆಸಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_VEGETATIVE",
        "nameEn": "Tillering & Vegetative",
        "nameKn": "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಕಾಯಿಕ ಬೆಳವಣಿಗೆ",
        "startDay": 26,
        "endDay": 50,
        "descriptionEn": "Active tillering stage; plant produces multiple shoots.",
        "descriptionKn": "ಸಸಿ ಕವಲೊಡೆಯುವ ಹಂತ; ಗಿಡವು ಬಲವಾದ ಬೇರು ಮತ್ತು ಹೆಚ್ಚುವರಿ ಕವಲುಗಳನ್ನು ನೀಡುತ್ತದೆ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "First Top-Dressing of Urea",
            "titleKn": "ಮೊದಲ ಕಂತಿನ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
            "bodyEn": "Apply 25 kg Urea + 10 kg MOP (Potash) per acre to boost tiller count.",
            "bodyKn": "ಹೆಚ್ಚು ಕವಲು ಬರಲು ಪ್ರತಿ ಎಕರೆಗೆ 25 ಕೆಜಿ ಯೂರಿಯಾ + 10 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ನೀಡಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Stem Borer & Leaf Folder Surveillance",
            "titleKn": "ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟ & ಎಲೆ ಸುರುಳಿ ಹುಳು ಪರಿಶೀಲನೆ",
            "bodyEn": "If dead hearts exceed 5%, spray Chlorantraniliprole 18.5% SC (0.3 ml/L).",
            "bodyKn": "ಸುಳಿ ಒಣಗುವುದು ಕಂಡುಬಂದರೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ (0.3 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "PANICLE_INITIATION",
        "nameEn": "Panicle Initiation & Booting",
        "nameKn": "ತೆನೆ ಮೂಡುವ ಮತ್ತು ಗರ್ಭಾವಸ್ಥೆ ಹಂತ",
        "startDay": 51,
        "endDay": 75,
        "descriptionEn": "Panicles begin forming inside the leaf sheath. Crucial yield stage.",
        "descriptionKn": "ಎಲೆಗಳ ಒಳಗೆ ತೆನೆ ರೂಪುಗೊಳ್ಳುವ ಹಂತ. ಇಳುವರಿಯನ್ನು ನಿರ್ಧರಿಸುವ ಅತಿ ಮುಖ್ಯ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Maintain Continuous 5cm Standing Water",
            "titleKn": "ನಿರಂತರ 5 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ",
            "bodyEn": "Drought stress at booting will lead to sterile grains. Do not let soil crack.",
            "bodyKn": "ತೆನೆ ಮೂಡುವಾಗ ನೀರು ಕಡಿಮೆಯಾದರೆ ಜಳ್ಳು ಕಾಳುಗಳಾಗುತ್ತವೆ. ಗದ್ದೆಯಲ್ಲಿ ಬಿರುಕು ಬಿಡದಂತೆ ನೀರು ನಿಲ್ಲಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "FERTILIZER",
            "titleEn": "Second Potash & Micronutrient Boost",
            "titleKn": "ಎರಡನೇ ಕಂತಿನ ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ",
            "bodyEn": "Apply remaining Potash (15 kg/acre) to ensure grain filling and strong stalk.",
            "bodyKn": "ಕಾಳು ತುಂಬಲು ಮತ್ತು ಕಾಂಡ ಗಟ್ಟಿಯಾಗಲು ಉಳಿದ 15 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರವನ್ನು ನೀಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "FLOWERING_HEADING",
        "nameEn": "Flowering & Heading",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ತೆನೆ ಹೊರಬರುವ ಹಂತ",
        "startDay": 76,
        "endDay": 95,
        "descriptionEn": "Panicles fully emerge and pollination occurs. Avoid spraying during morning pollination.",
        "descriptionKn": "ತೆನೆಗಳು ಸಂಪೂರ್ಣ ಹೊರಬಂದು ಪರಾಗಸ್ಪರ್ಶ ನಡೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Paddy Blast & Neck Blast Protection",
            "titleKn": "ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣ",
            "bodyEn": "Spray Tricyclazole 75% WP (0.6g/L) on panicles during early morning or late evening.",
            "bodyKn": "ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ ತಡೆಯಲು ಟ್ರೈಸೈಕ್ಲೋಜೋಲ್ (0.6 ಗ್ರಾಂ/ಲೀ) ಅನ್ನು ಬೆಳಗಿನ ಜಾವ ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "GRAIN_FILLING_RIPENING",
        "nameEn": "Grain Ripening & Harvesting",
        "nameKn": "ಕಾಳು ಮಾಗುವ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 96,
        "endDay": 115,
        "descriptionEn": "Milky grains turn to solid dough and golden yellow. Prepare for harvest.",
        "descriptionKn": "ಹಾಲು ತುಂಬಿದ ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗಿ ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ. ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧತೆ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Drain Water 10 Days Before Harvest",
            "titleKn": "ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮುಂಚೆ ನೀರು ಬಸಿದುಬಿಡಿ",
            "bodyEn": "Drain all standing water to allow uniform ripening and easy field movement.",
            "bodyKn": "ಏಕರೂಪದ ಮಾಗುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು ಯಂತ್ರಗಳ ಸುಲಭ ಚಲನೆಗಾಗಿ ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲೇ ನೀರು ಬಸಿದುಬಿಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "ragi",
    "nameEn": "Ragi (Finger Millet)",
    "nameKn": "ರಾಗಿ (Finger Millet)",
    "scientificName": "Eleusine coracana",
    "category": "Cereals & Millets",
    "categoryKn": "ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು",
    "totalDays": 110,
    "isPerennial": false,
    "popularVarieties": [
      "GPU 28",
      "ML-365",
      "Indaf-8",
      "MR-1",
      "KMR-301",
      "GPU-48"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Red sandy loam, gravelly clay with good drainage",
    "soilTypeKn": "ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "SOWING_GERMINATION",
        "nameEn": "Sowing & Germination",
        "nameKn": "ಬಿತ್ತನೆ ಮತ್ತು ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Seed germination and seedling establishment.",
        "descriptionKn": "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಸಸಿಗಳು ನೆಲೆಯೂರುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Basal Application of DAP/NPK",
            "titleKn": "ಬುಡಕ್ಕೆ ಡಿಎಪಿ ಅಥವಾ ಎನ್‌ಪಿಕೆ ಗೊಬ್ಬರ",
            "bodyEn": "Apply 40 kg DAP and 15 kg Potash per acre during land preparation.",
            "bodyKn": "ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಎಕರೆಗೆ 40 ಕೆಜಿ ಡಿಎಪಿ ಮತ್ತು 15 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_INTERCULTURE",
        "nameEn": "Tillering & Inter-Cultivation",
        "nameKn": "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಎಡೆಕುಂಟೆ",
        "startDay": 21,
        "endDay": 45,
        "descriptionEn": "Weeding and inter-cultivation to aerate the soil and multiply tillers.",
        "descriptionKn": "ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಹೆಚ್ಚಿನ ಕವಲುಗಳನ್ನು ಪಡೆಯುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Inter-cultivation & Earthing Up",
            "titleKn": "ಎಡೆಕುಂಟೆ ಹೊಡೆದು ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ",
            "bodyEn": "Pass light plough/kunte to control weeds and conserve soil moisture.",
            "bodyKn": "ಕಳೆ ನಿಯಂತ್ರಿಸಲು ಮತ್ತು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉಳಿಸಲು ಎಡೆಕುಂಟೆ ಹೊಡೆಯಿರಿ.",
            "urgency": "MEDIUM"
          },
          {
            "category": "FERTILIZER",
            "titleEn": "Urea Top Dressing",
            "titleKn": "ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
            "bodyEn": "Apply 20 kg Urea per acre when soil has adequate moisture.",
            "bodyKn": "ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿದ್ದಾಗ ಪ್ರತಿ ಎಕರೆಗೆ 20 ಕೆಜಿ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "HEADING_GRAIN_FORMATION",
        "nameEn": "Earhead Emergence & Grain Formation",
        "nameKn": "ತೆನೆ ಮೂಡುವ ಮತ್ತು ಕಾಳು ಕಟ್ಟುವ ಹಂತ",
        "startDay": 46,
        "endDay": 80,
        "descriptionEn": "Finger earheads emerge and grain formation begins.",
        "descriptionKn": "ರಾಗಿ ಗೊನೆಗಳು ಹೊರಬಂದು ಕಾಳು ತುಂಬುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Ragi Blast & Earhead Caterpillar",
            "titleKn": "ರಾಗಿ ಬೆಂಕಿ ರೋಗ & ತೆನೆ ಕೀಟ ನಿಯಂತ್ರಣ",
            "bodyEn": "Check for blast spots on earheads. Spray Mancozeb 75% WP (2g/L) if cloudy weather persists.",
            "bodyKn": "ತೆನೆ ಬೆಂಕಿ ರೋಗ ಕಂಡುಬಂದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ (2 ಗ್ರಾಂ/ಲೀ) ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 81,
        "endDay": 110,
        "descriptionEn": "Earheads turn brown and grains harden.",
        "descriptionKn": "ಗೊನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest on Sunny Dry Day",
            "titleKn": "ಬಿಸಿಲಿನ ಒಣ ದಿನದಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Cut earheads when 90% turn brown. Dry under sun to reach 12% moisture before threshing.",
            "bodyKn": "90% ಗೊನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡಿ 12% ತೇವಾಂಶ ಬರುವವರೆಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "tomato",
    "nameEn": "Tomato",
    "nameKn": "ಟೊಮ್ಯಾಟೊ (Tomato)",
    "scientificName": "Solanum lycopersicum",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 120,
    "isPerennial": false,
    "popularVarieties": [
      "Arka Rakshak",
      "Arka Samrat",
      "Abhinav (Syngenta)",
      "Saaho",
      "Shivam"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Well-drained red sandy loam with pH 6.0-7.0",
    "soilTypeKn": "ಚೆನ್ನಾಗಿ ನೀರು ಬಸಿಯುವ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "TRANSPLANTING_ESTABLISHMENT",
        "nameEn": "Transplanting & Establishment",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Seedlings establish root structure after transplanting to main field.",
        "descriptionKn": "ಮುಖ್ಯ ಗದ್ದೆಗೆ ನಾಟಿ ಮಾಡಿದ ನಂತರ ಸಸಿಗಳು ಬೇರೂರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Light Drip Irrigation Daily",
            "titleKn": "ದಿನವೂ ಲಘು ಹನಿ ನೀರಾವರಿ",
            "bodyEn": "Maintain consistent moisture without waterlogging to encourage deep rooting.",
            "bodyKn": "ಬೇರುಗಳು ಆಳಕ್ಕೆ ಇಳಿಯಲು ನೀರು ನಿಲ್ಲದಂತೆ ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಹಿತವಾದ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
            "urgency": "MEDIUM"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Whitefly & Leaf Curl Protection",
            "titleKn": "ಬಿಳಿ ನೊಣ & ಎಲೆ ಮುದುರು ರೋಗ ತಡೆ",
            "bodyEn": "Install yellow sticky traps (10/acre) to trap whiteflies carrying leaf curl virus.",
            "bodyKn": "ಎಲೆ ಮುದುರು ವೈರಸ್ ಹರಡುವ ಬಿಳಿ ನೊಣಗಳನ್ನು ಹಿಡಿಯಲು ಎಕರೆಗೆ 10 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_STAKING",
        "nameEn": "Vegetative Growth & Staking",
        "nameKn": "ಕಾಯಿಕ ಬೆಳವಣಿಗೆ & ಕಡ್ಡಿ ಕಟ್ಟುವುದು",
        "startDay": 21,
        "endDay": 40,
        "descriptionEn": "Rapid shoot branching and bamboo staking for support.",
        "descriptionKn": "ವೇಗದ ಕವಲು ಬೆಳವಣಿಗೆ ಮತ್ತು ಗಿಡಗಳಿಗೆ ಬಿದಿರಿನ ಕಡ್ಡಿಗಳ ಬೆಂಬಲ ನೀಡುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Water-Soluble 19:19:19 Fertigation",
            "titleKn": "19:19:19 ಕರಗುವ ಗೊಬ್ಬರ ನೀಡುವುದು",
            "bodyEn": "Apply 19:19:19 (3 kg/acre) through drip twice weekly to build strong foliage.",
            "bodyKn": "ಉತ್ತಮ ಕವಲುಗಳಿಗೆ ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ 3 ಕೆಜಿ 19:19:19 ಗೊಬ್ಬರವನ್ನು ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_FRUIT_SET",
        "nameEn": "Flowering & Fruit Setting",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 41,
        "endDay": 65,
        "descriptionEn": "Yellow blossoms set into small green fruits. Calcium and boron are critical.",
        "descriptionKn": "ಹಳದಿ ಹೂಗಳು ಸಣ್ಣ ಹಸಿರು ಕಾಯಿಗಳಾಗಿ ಪರಿವರ್ತನೆಯಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Calcium Nitrate & Boron Spray",
            "titleKn": "ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ & ಬೋರಾನ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray Calcium Nitrate (2g/L) + Boron (1g/L) to prevent Blossom End Rot (black bottoms).",
            "bodyKn": "ಕಾಯಿ ಕೊಳೆಯುವುದು ಮತ್ತು ಒಡೆಯುವುದನ್ನು ತಡೆಯಲು ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ (2 ಗ್ರಾಂ/ಲೀ) + ಬೋರಾನ್ (1 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Early Blight & Fruit Borer Watch",
            "titleKn": "ಮುಂಚಿನ ಬೆಂಕಿ ರೋಗ & ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು",
            "bodyEn": "If concentric rings appear on lower leaves, spray Azoxystrobin + Difenoconazole (1 ml/L).",
            "bodyKn": "ಕೆಳ ಎಲೆಗಳಲ್ಲಿ ಕಂದು ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು ಕಂಡರೆ ಅಜಾಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ (1 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FRUIT_DEVELOPMENT_HARVEST",
        "nameEn": "Fruit Development & Plucking",
        "nameKn": "ಹಣ್ಣು ಬೆಳೆಯುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 66,
        "endDay": 120,
        "descriptionEn": "Fruits attain mature size and turn pink to red.",
        "descriptionKn": "ಟೊಮೇಟೊ ಕಾಯಿಗಳು ಬಲಿತು ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Potassium Booster 0:0:50 Fertigation",
            "titleKn": "0:0:50 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ",
            "bodyEn": "Apply 0:0:50 (SOP) 3 kg/acre weekly to give deep red color and shiny fruit skin.",
            "bodyKn": "ಹಣ್ಣಿಗೆ ಗಾಢ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ತೂಕ ಬರಲು ವಾರಕ್ಕೆ 3 ಕೆಜಿ 0:0:50 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "maize",
    "nameEn": "Maize (Corn)",
    "nameKn": "ಮೆಕ್ಕೆಜೋಳ (Maize)",
    "scientificName": "Zea mays",
    "category": "Cereals & Millets",
    "categoryKn": "ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು",
    "totalDays": 105,
    "isPerennial": false,
    "popularVarieties": [
      "CP 333",
      "Pioneer 3396",
      "DKC 9108",
      "NAH 1137",
      "DeKalb 9144",
      "Kargil 900M"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Deep fertile red loam or well-drained black soil",
    "soilTypeKn": "ಆಳವಾದ ಫಲವತ್ತಾದ ಕೆಂಪು ಗೋಡು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "GERMINATION_SEEDLING",
        "nameEn": "Germination & Seedling",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಎಳೆ ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Coleoptile emergence and first 4-5 true leaves formation.",
        "descriptionKn": "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಮೊದಲ 4-5 ಎಲೆಗಳು ಹೊರಬರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Fall Armyworm (FAW) Early Scouting",
            "titleKn": "ಲದ್ದಿ ಹುಳು (Fall Armyworm) ಆರಂಭಿಕ ಪರಿಶೀಲನೆ",
            "bodyEn": "Check leaf whorls for pin-hole damage and sawdust-like frass. Apply Chlorantraniliprole 18.5% SC (0.4 ml/L) or Emamectin Benzoate (0.5g/L).",
            "bodyKn": "ಸುಳಿಗಳಲ್ಲಿ ಸಣ್ಣ ರಂಧ್ರ ಮತ್ತು ಪುಡಿ ಮಲವನ್ನು ಗಮನಿಸಿ. ಲಕ್ಷಣ ಕಂಡರೆ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೇಟ್ (0.5 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "KNEE_HIGH_VEGETATIVE",
        "nameEn": "Knee-High Rapid Growth",
        "nameKn": "ಮಂಡಿಯುದ್ದದ ವೇಗದ ಬೆಳವಣಿಗೆ",
        "startDay": 21,
        "endDay": 45,
        "descriptionEn": "Rapid stalk elongation, brace root anchoring, and nitrogen demand peak.",
        "descriptionKn": "ಕಾಂಡ ವೇಗವಾಗಿ ಬೆಳೆಯುವುದು ಮತ್ತು ಊರುಗೋಲು ಬೇರುಗಳು ಬಿಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Second Split Nitrogen Top-Dressing",
            "titleKn": "ಎರಡನೇ ಕಂತಿನ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
            "bodyEn": "Apply 35 kg Urea per acre at knee-high stage along with earthing up.",
            "bodyKn": "ಮಂಡಿಯುದ್ದ ಬೆಳೆದಾಗ ಎಕರೆಗೆ 35 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TASSELING_SILKING",
        "nameEn": "Tasseling & Silking",
        "nameKn": "ತೆನೆ ಮತ್ತು ಚಾಮರ ಬಿಡುವ ಹಂತ",
        "startDay": 46,
        "endDay": 70,
        "descriptionEn": "Male tassels shed pollen and female silks receive pollen for cob formation.",
        "descriptionKn": "ಗಂಡು ಹೂವಿನ ಚಾಮರ ಮತ್ತು ಹೆಣ್ಣು ಹೂವಿನ ರೇಷ್ಮೆ ಎಳೆಗಳು ಹೊರಬಂದು ಪರಾಗಸ್ಪರ್ಶ ನಡೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Critical Moisture Window",
            "titleKn": "ನಿರ್ಣಾಯಕ ನೀರಿನ ಹಂತ",
            "bodyEn": "Moisture stress now causes barren cobs. Ensure soil never dries out.",
            "bodyKn": "ಈ ಹಂತದಲ್ಲಿ ನೀರಿನ ಅಭಾವವಾದರೆ ತೆನೆಗಳಲ್ಲಿ ಕಾಳು ಕೂಡುವುದಿಲ್ಲ. ತೇವಾಂಶ ಕಾಪಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "GRAIN_FILLING_MILK",
        "nameEn": "Grain Filling & Milk Stage",
        "nameKn": "ಕಾಳು ಕಟ್ಟುವ ಮತ್ತು ಹಾಲು ತುಂಬುವ ಹಂತ",
        "startDay": 71,
        "endDay": 90,
        "descriptionEn": "Starch accumulates inside kernels. Kernels transition from milk to dough.",
        "descriptionKn": "ಕಾಳುಗಳಲ್ಲಿ ಪಿಷ್ಟ ತುಂಬಿ ಹಾಲು ಗಟ್ಟಿಯಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Potash & Zinc Foliar Spray",
            "titleKn": "ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಜಿಂಕ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray 0:0:50 (5g/L) to maximize cob kernel weight and test weight.",
            "bodyKn": "ದಪ್ಪ ಮತ್ತು ತೂಕದ ಕಾಳುಗಳಿಗಾಗಿ 0:0:50 (5 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Cob Harvesting",
        "nameKn": "ಮಾಗುವಿಕೆ ಮತ್ತು ತೆನೆ ಕೊಯ್ಲು",
        "startDay": 91,
        "endDay": 105,
        "descriptionEn": "Husks dry and turn straw-colored. Black layer forms at kernel base.",
        "descriptionKn": "ತೆನೆಯ ಸಿಪ್ಪೆ ಒಣಗಿ ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದು ಕಾಳಿನ ಬುಡದಲ್ಲಿ ಕಪ್ಪು ಕಲೆ ಕಾಣಿಸುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest at 18-20% Moisture",
            "titleKn": "18-20% ತೇವಾಂಶದಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Harvest dry cobs on sunny days. Dry grains to 12% moisture before bagging.",
            "bodyKn": "ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ಕಾಳುಗಳಲ್ಲಿ 12% ತೇವಾಂಶ ಉಳಿಯುವಂತೆ ಸಂರಕ್ಷಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "sugarcane",
    "nameEn": "Sugarcane",
    "nameKn": "ಕಬ್ಬು (Sugarcane)",
    "scientificName": "Saccharum officinarum",
    "category": "Commercial & Cash Crops",
    "categoryKn": "ವಾಣಿಜ್ಯ ಮತ್ತು ನಗದು ಬೆಳೆಗಳು",
    "totalDays": 365,
    "isPerennial": true,
    "popularVarieties": [
      "Co 86032",
      "Co 62175",
      "CoC 671",
      "VSI 434",
      "Co 92005"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Deep well-drained rich alluvial or black clay soil",
    "soilTypeKn": "ಆಳವಾದ ಫಲವತ್ತಾದ ಮೆಕ್ಕಲು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "GERMINATION_SPROUTING",
        "nameEn": "Germination & Sprouting",
        "nameKn": "ಕಣ್ಣು ಒಡೆಯುವುದು ಮತ್ತು ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ",
        "startDay": 0,
        "endDay": 45,
        "descriptionEn": "Setts sprout and shoots emerge from nodal buds.",
        "descriptionKn": "ಕಬ್ಬಿನ ತುಂಡುಗಳ ಕಣ್ಣುಗಳಿಂದ ಮೊಳಕೆ ಹೊರಬಂದು ಸಸಿ ನೆಲೆಯೂರುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Frequent Light Furrow Irrigation",
            "titleKn": "ಸಾಲಿನಲ್ಲಿ ನಿಯಮಿತ ಲಘು ನೀರಾವರಿ",
            "bodyEn": "Irrigate at 7-10 day intervals. Do not allow setts to dry out or stay submerged.",
            "bodyKn": "7-10 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರು ಹರಿಸಿ. ಮಣ್ಣು ಬಿರುಕು ಬಿಡದಂತೆ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_FORMIGRATION",
        "nameEn": "Tillering & Canopy Formation",
        "nameKn": "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಕಳೆ ನಿರ್ವಹಣೆ",
        "startDay": 46,
        "endDay": 120,
        "descriptionEn": "Underground nodes produce multiple tillers. Critical for millable cane count.",
        "descriptionKn": "ಬುಡದಿಂದ ಹೊಸ ಕವಲುಗಳು ಹುಟ್ಟಿ ಎಕರೆಗೆ ಹೆಚ್ಚಿನ ಕಬ್ಬಿನ ಸಂಖ್ಯೆ ರೂಪುಗೊಳ್ಳುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Split Nitrogen & Earthing Up",
            "titleKn": "ಯೂರಿಯಾ ಮತ್ತು ಮೊದಲ ಏರು ಸಾಲು ಮಾಡುವುದು",
            "bodyEn": "Apply 50 kg Urea + 25 kg Potash per acre followed by partial earthing up.",
            "bodyKn": "ಎಕರೆಗೆ 50 ಕೆಜಿ ಯೂರಿಯಾ + 25 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ನೀಡಿ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Early Shoot Borer Control",
            "titleKn": "ಮುಂಚಿನ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ",
            "bodyEn": "If dead hearts appear, release Trichogramma chilonis egg cards or apply Fipronil 0.3% GR (10 kg/acre).",
            "bodyKn": "ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಕಂಡರೆ ಫಿಪ್ರೋನಿಲ್ 0.3% ಜಿಆರ್ (10 ಕೆಜಿ/ಎಕರೆ) ಮಣ್ಣಿಗೆ ಬೆರೆಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "GRAND_GROWTH",
        "nameEn": "Grand Growth & Cane Elongation",
        "nameKn": "ವೇಗದ ಬೆಳವಣಿಗೆ & ಕಬ್ಬು ಉದ್ದವಾಗುವ ಹಂತ",
        "startDay": 121,
        "endDay": 270,
        "descriptionEn": "Maximum internode formation and cane weight gain.",
        "descriptionKn": "ಕಬ್ಬಿನ ಗಿಣ್ಣುಗಳು ಬೆಳೆದು ಕಬ್ಬು ಉದ್ದ ಮತ್ತು ದಪ್ಪವಾಗುವ ಪ್ರಮುಖ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Copious Irrigation Every 8-10 Days",
            "titleKn": "ಪ್ರತಿ 8-10 ದಿನಕ್ಕೊಮ್ಮೆ ಪೂರ್ಣ ನೀರಾವರಿ",
            "bodyEn": "Peak water demand phase. Maintain steady moisture for stalk elongation.",
            "bodyKn": "ಕಬ್ಬಿನ ಗಿಣ್ಣುಗಳು ದಪ್ಪವಾಗಲು ನಿಯಮಿತವಾಗಿ ನೀರು ಹರಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "FERTILIZER",
            "titleEn": "Final Nitrogen & Potash Boost",
            "titleKn": "ಅಂತಿಮ ನೈಟ್ರೋಜನ್ ಮತ್ತು ಪೊಟ್ಯಾಷ್",
            "bodyEn": "Complete all fertilizer applications by Day 150 to avoid late vegetative suckers.",
            "bodyKn": "150ನೇ ದಿನದೊಳಗೆ ರಸಗೊಬ್ಬರ ಕೊಡುವುದನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ ಬುಡವನ್ನು ಗಟ್ಟಿಗೊಳಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "RIPENING_SUCROSE_ACCUMULATION",
        "nameEn": "Ripening & Harvesting",
        "nameKn": "ಸಕ್ಕರೆ ಮಾಗುವಿಕೆ ಮತ್ತು ಕಟಾವು",
        "startDay": 271,
        "endDay": 365,
        "descriptionEn": "Vegetative growth slows and sucrose accumulates in stalk internodes.",
        "descriptionKn": "ಬೆಳವಣಿಗೆ ನಿಂತು ಕಬ್ಬಿನಲ್ಲಿ ಸಕ್ಕರೆ ಅಂಶ ಹೆಚ್ಚುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Withhold Irrigation 15 Days Before Cut",
            "titleKn": "ಕಟಾವಿಗೆ 15 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ",
            "bodyEn": "Stop water 15-20 days before harvest to concentrate sucrose and raise Brix above 20%.",
            "bodyKn": "ಸಕ್ಕರೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಕಟಾವಿಗೆ 15-20 ದಿನ ಮುಂಚೆ ನೀರು ನಿಲ್ಲಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "cotton",
    "nameEn": "Cotton",
    "nameKn": "ಹತ್ತಿ (Cotton)",
    "scientificName": "Gossypium hirsutum",
    "category": "Commercial & Cash Crops",
    "categoryKn": "ವಾಣಿಜ್ಯ ಮತ್ತು ನಗದು ಬೆಳೆಗಳು",
    "totalDays": 160,
    "isPerennial": false,
    "popularVarieties": [
      "Bt Cotton RCH 659",
      "DHH 11",
      "Bunny Bt",
      "Bhakti",
      "Ajeet 155"
    ],
    "seasons": [
      "Kharif"
    ],
    "soilType": "Deep black cotton soil (Vertisols) or fertile loam",
    "soilTypeKn": "ಆಳವಾದ ಕಪ್ಪು ಮಣ್ಣು ಅಥವಾ ಫಲವತ್ತಾದ ಗೋಡು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "GERMINATION_SEEDLING",
        "nameEn": "Germination & Seedling",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಎಳೆ ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Emergence of cotyledons and root establishment.",
        "descriptionKn": "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಬೇರು ನೆಲೆಯೂರಿ ಮೊದಲ ಎಲೆಗಳು ಬರುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Sucking Pest Watch (Thrips & Jassids)",
            "titleKn": "ರಸ ಹೀರುವ ಕೀಟಗಳ (ಜಿಗಿಹುಳು, ಥ್ರಿಪ್ಸ್) ನಿಗಾ",
            "bodyEn": "Check undersides of leaves. If leaf edges curl upwards, spray Imidacloprid 17.8% SL (0.3 ml/L).",
            "bodyKn": "ಎಲೆಗಳ ಕೆಳಭಾಗ ಪರೀಕ್ಷಿಸಿ. ಎಲೆ ಮುದುರಿದರೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ (0.3 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_BRANCHING",
        "nameEn": "Square Initiation & Branching",
        "nameKn": "ಮೊಗ್ಗು (Square) ಬಿಡುವುದು ಮತ್ತು ಕವಲುಗಳು",
        "startDay": 26,
        "endDay": 55,
        "descriptionEn": "Sympodial fruiting branches form and flower squares appear.",
        "descriptionKn": "ಕಾಯಿ ಕಟ್ಟುವ ಕವಲುಗಳು ಬೆಳೆದು ಚೌಕಾಕಾರದ ಹತ್ತಿ ಮೊಗ್ಗುಗಳು ಕಾಣಿಸುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Top Dress Urea + Magnesium Sulphate",
            "titleKn": "ಯೂರಿಯಾ & ಮೆಗ್ನೀಸಿಯಂ ಸಲ್ಫೇಟ್ ನೀಡಿ",
            "bodyEn": "Apply 30 kg Urea and spray 1% Magnesium Sulphate to prevent leaf reddening.",
            "bodyKn": "ಎಲೆ ಕೆಂಪಾಗುವುದನ್ನು ತಡೆಯಲು ಎಕರೆಗೆ 30 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ 1% ಮೆಗ್ನೀಸಿಯಂ ಸಲ್ಫೇಟ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_BOLL_SET",
        "nameEn": "Peak Flowering & Boll Setting",
        "nameKn": "ಪೂರ್ಣ ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 56,
        "endDay": 95,
        "descriptionEn": "Cream flowers turn pink and develop into green cotton bolls.",
        "descriptionKn": "ಹಳದಿ ಹೂಗಳು ಗುಲಾಬಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಹಸಿರು ಹತ್ತಿ ಕಾಯಿಗಳಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Pink Bollworm Pheromone Trapping",
            "titleKn": "ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ಬಲೆ",
            "bodyEn": "Install 5 Pheromone traps/acre. If 8 moths/trap caught for 3 days, spray Profenofos 50% EC (2 ml/L).",
            "bodyKn": "ಎಕರೆಗೆ 5 ಮೋಹಕ ಬಲೆಗಳನ್ನು ಇರಿಸಿ. ಹುಳುಗಳ ಬಾಧೆ ಹೆಚ್ಚಿದ್ದರೆ ಪ್ರೊಫೆನೋಫಾಸ್ (2 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BOLL_DEVELOPMENT",
        "nameEn": "Boll Maturation",
        "nameKn": "ಕಾಯಿ ಬಲಿಯುವ ಹಂತ",
        "startDay": 96,
        "endDay": 130,
        "descriptionEn": "Lint fiber elongation and secondary cell wall thickening.",
        "descriptionKn": "ಕಾಯಿಯೊಳಗೆ ಹತ್ತಿ ನಾರಿನ ಬೆಳವಣಿಗೆ ಮತ್ತು ಗಟ್ಟಿಯಾಗುವಿಕೆ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Potash & Boron Spray for Fiber Strength",
            "titleKn": "ನಾರಿನ ಗಟ್ಟಿತನಕ್ಕೆ ಪೊಟ್ಯಾಷ್ & ಬೋರಾನ್",
            "bodyEn": "Foliar spray 0:0:50 (10g/L) + Boron (1g/L) to prevent boll drop and boost staple length.",
            "bodyKn": "ಕಾಯಿ ಉದುರುವುದು ತಪ್ಪಿಸಲು ಮತ್ತು ನಾರಿನ ಗುಣಮಟ್ಟ ಹೆಚ್ಚಿಸಲು 0:0:50 + ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "BOLL_BURSTING_PICKING",
        "nameEn": "Boll Bursting & Hand Picking",
        "nameKn": "ಹತ್ತಿ ಕಾಯಿ ಒಡೆಯುವುದು ಮತ್ತು ಬಿಡಿಸುವುದು",
        "startDay": 131,
        "endDay": 160,
        "descriptionEn": "Mature bolls crack open displaying fluffy white cotton lint.",
        "descriptionKn": "ಕಾಯಿಗಳು ಒಡೆದು ಬೆಳ್ಳನೆಯ ಶುದ್ಧ ಹತ್ತಿ ಹೊರಬರುವ ಕೊಯ್ಲಿನ ಹಂತ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Pick Cotton After Morning Dew Dries",
            "titleKn": "ಮಂಜು ಒಣಗಿದ ನಂತರ ಹತ್ತಿ ಬಿಡಿಸಿ",
            "bodyEn": "Pick clean cotton without bracts or dry leaves. Store in dry place away from moisture.",
            "bodyKn": "ಬೆಳಗಿನ ಮಂಜು ಆವಿಯಾದ ನಂತರ ಒಣ ಹವೆಯಲ್ಲಿ ಕಸವಿಲ್ಲದೆ ಬಿಡಿಸಿ ಒಣ ಜಾಗದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "onion",
    "nameEn": "Onion",
    "nameKn": "ಈರುಳ್ಳಿ (Onion)",
    "scientificName": "Allium cepa",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 120,
    "isPerennial": false,
    "popularVarieties": [
      "Bhima Super",
      "Arka Kalyan",
      "Arka Niketan",
      "Pusa Red",
      "Bellary Red"
    ],
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "soilType": "Loose friable sandy loam rich in organic matter",
    "soilTypeKn": "ಸಡಿಲವಾದ ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "TRANSPLANTING_ESTABLISHMENT",
        "nameEn": "Transplanting & Rooting",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Seedlings establish shallow fibrous root system.",
        "descriptionKn": "ನಾಟಿ ಮಾಡಿದ ಈರುಳ್ಳಿ ಸಸಿಗಳು ಹೊಸ ಬೇರುಗಳನ್ನು ಬಿಟ್ಟು ಚಿಗುರುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Frequent Light Sprinkler/Furrow Water",
            "titleKn": "ಲಘು ನೀರಾವರಿ",
            "bodyEn": "Provide light irrigation every 4-5 days. Shallow roots must not dry out.",
            "bodyKn": "ಮೇಲ್ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉಳಿಯಲು 4-5 ದಿನಕ್ಕೊಮ್ಮೆ ಲಘು ನೀರು ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_FOLIAGE",
        "nameEn": "Foliage & Neck Growth",
        "nameKn": "ಎಲೆ ಮತ್ತು ಕುತ್ತಿಗೆ ಬೆಳವಣಿಗೆ",
        "startDay": 26,
        "endDay": 55,
        "descriptionEn": "Leaf count directly determines final bulb scale size.",
        "descriptionKn": "ಹೆಚ್ಚು ಎಲೆಗಳು ಬಂದು ಗಡ್ಡೆಗೆ ಬೇಕಾದ ಆಹಾರ ಸಂಗ್ರಹವಾಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Nitrogen & Sulphur Boost",
            "titleKn": "ಯೂರಿಯಾ & ಗಂಧಕ (Sulphur) ನೀಡಿ",
            "bodyEn": "Apply 25 kg Urea + 10 kg elemental Sulphur/acre. Sulphur gives pungent taste.",
            "bodyKn": "ಗಡ್ಡೆಗೆ ಉತ್ತಮ ಖಾರ ಮತ್ತು ತೂಕ ಬರಲು ಯೂರಿಯಾ ಜೊತೆಗೆ ಗಂಧಕ ನೀಡಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Thrips & Purple Blotch Spray",
            "titleKn": "ನುಸಿ (Thrips) & ನೇರಳೆ ಮಚ್ಚೆ ರೋಗ",
            "bodyEn": "If silvery leaf patches appear, spray Fipronil (1.5 ml/L) + Mancozeb (2.5 g/L).",
            "bodyKn": "ಬೆಳ್ಳಿ ಬಣ್ಣದ ಚುಕ್ಕೆ ಕಂಡರೆ ಫಿಪ್ರೋನಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BULB_INITIATION_ENLARGEMENT",
        "nameEn": "Bulb Initiation & Bulking",
        "nameKn": "ಗಡ್ಡೆ ಕಟ್ಟುವ ಮತ್ತು ದಪ್ಪವಾಗುವ ಹಂತ",
        "startDay": 56,
        "endDay": 95,
        "descriptionEn": "Base swells into bulb under favorable photoperiod.",
        "descriptionKn": "ಬುಡವು ಉಬ್ಬಿ ದಪ್ಪನೆಯ ಈರುಳ್ಳಿ ಗಡ್ಡೆಯಾಗಿ ಪರಿವರ್ತನೆಯಾಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Potassium Sulphate (0:0:50) Spray",
            "titleKn": "0:0:50 ಪೊಟ್ಯಾಷ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Stop all Nitrogen. Apply 0:0:50 (5g/L) to enlarge bulb diameter and outer skin firmness.",
            "bodyKn": "ಯೂರಿಯಾ ನಿಲ್ಲಿಸಿ; ಗಡ್ಡೆ ದಪ್ಪವಾಗಲು 0:0:50 ಪೊಟ್ಯಾಷ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_NECK_FALL",
        "nameEn": "Maturity & Neck Fall",
        "nameKn": "ಕುತ್ತಿಗೆ ಬಾಗುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 96,
        "endDay": 120,
        "descriptionEn": "50% tops fall over naturally. Bulbs mature for harvesting.",
        "descriptionKn": "ಶೇಕಡಾ 50 ರಷ್ಟು ಸೊಪ್ಪು ತಾನಾಗಿಯೇ ನೆಲಕ್ಕೆ ಬಾಗಿ ಗಡ್ಡೆ ಮಾಗುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Stop Irrigation 10-15 Days Before Harvest",
            "titleKn": "ಕೊಯ್ಲಿಗೆ 10-15 ದಿನ ಮುಂಚೆ ನೀರು ನಿಲ್ಲಿಸಿ",
            "bodyEn": "Withhold water completely so bulbs cure well and do not rot in storage.",
            "bodyKn": "ಶೇಖರಣೆಯಲ್ಲಿ ಗಡ್ಡೆ ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ನೀರು ಪೂರ್ಣ ನಿಲ್ಲಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "potato",
    "nameEn": "Potato",
    "nameKn": "ಆಲೂಗಡ್ಡೆ (Potato)",
    "scientificName": "Solanum tuberosum",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 100,
    "isPerennial": false,
    "popularVarieties": [
      "Kufri Jyoti",
      "Kufri Surya",
      "Kufri Pukhraj",
      "Kufri Chipsona",
      "Hassan Local"
    ],
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "soilType": "Well-aerated sandy loam, rich in humus, pH 5.2-6.5",
    "soilTypeKn": "ಸಡಿಲವಾದ ಮರಳು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "SPROUTING_EMERGENCE",
        "nameEn": "Sprouting & Emergence",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಚಿಗುರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Seed tuber eyes break dormancy and sprouts penetrate soil.",
        "descriptionKn": "ಬಿತ್ತನೆ ಗೆಡ್ಡೆಯ ಕಣ್ಣುಗಳಿಂದ ಮೊಳಕೆ ಹೊರಬಂದು ಸಸಿ ಮೇಲೇಳುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Maintain Moist Ridges",
            "titleKn": "ಬದುಗಳಲ್ಲಿ ಹಿತವಾದ ತೇವಾಂಶ",
            "bodyEn": "Keep soil moist but never waterlogged to avoid tuber rotting.",
            "bodyKn": "ಗೆಡ್ಡೆ ಕೊಳೆಯದಂತೆ ಎಚ್ಚರವಹಿಸಿ ಲಘುವಾಗಿ ನೀರು ಹರಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "VEGETATIVE_STOLON",
        "nameEn": "Vegetative & Stolon Initiation",
        "nameKn": "ಕಾಯಿಕ ಬೆಳವಣಿಗೆ & ಬೇರು ಬಳ್ಳಿ (Stolon)",
        "startDay": 21,
        "endDay": 45,
        "descriptionEn": "Underground stolons hook and prepare for tuber formation.",
        "descriptionKn": "ಮಣ್ಣಿನೊಳಗೆ ಗೆಡ್ಡೆ ಕಟ್ಟುವ ಬಳ್ಳಿಗಳು ರೂಪುಗೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Earthing Up & Top Dress Nitrogen",
            "titleKn": "ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸುವುದು ಮತ್ತು ಯೂರಿಯಾ",
            "bodyEn": "Earth up soil around ridges to cover developing stolons from sunlight.",
            "bodyKn": "ಗೆಡ್ಡೆಗಳು ಬಿಸಿಲಿಗೆ ಹಸಿರಾಗದಂತೆ ಬುಡಕ್ಕೆ ಚೆನ್ನಾಗಿ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TUBER_BULKING",
        "nameEn": "Tuber Bulking Stage",
        "nameKn": "ಗೆಡ್ಡೆ ದಪ್ಪವಾಗುವ ಹಂತ",
        "startDay": 46,
        "endDay": 75,
        "descriptionEn": "Rapid starch deposit expands tubers to marketable size.",
        "descriptionKn": "ಗೆಡ್ಡೆಗಳು ವೇಗವಾಗಿ ಪಿಷ್ಟ ತುಂಬಿಕೊಂಡು ದಪ್ಪವಾಗುವ ಮುಖ್ಯ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Late Blight Vigilance",
            "titleKn": "ತಡವಾದ ಅಂಗಮಾರಿ (Late Blight) ರೋಗ ತಡೆ",
            "bodyEn": "If cool humid weather sets in, spray Cymoxanil + Mancozeb (2g/L) or Metalaxyl (2g/L).",
            "bodyKn": "ಮಂಜು ಮುಸುಕಿದ ವಾತಾವರಣವಿದ್ದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ ಅಥವಾ ಸಿಮಾಕ್ಸಾನಿಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HAULM_CUTTING",
        "nameEn": "Maturity & Haulm Cutting",
        "nameKn": "ಗೆಡ್ಡೆ ಮಾಗುವುದು ಮತ್ತು ಗಿಡ ಕತ್ತರಿಸುವುದು",
        "startDay": 76,
        "endDay": 100,
        "descriptionEn": "Foliage turns yellow. Cut haulms 10 days before harvest to harden skin.",
        "descriptionKn": "ಗಿಡದ ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು; ಸಿಪ್ಪೆ ಗಟ್ಟಿಯಾಗಲು ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲು ಗಿಡ ಕತ್ತರಿಸಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Dig Tubers in Dry Soil",
            "titleKn": "ಒಣ ಮಣ್ಣಿನಲ್ಲಿ ಗೆಡ್ಡೆ ತೆಗೆಯಿರಿ",
            "bodyEn": "Dig carefully without wounding tubers. Cure in shade for 7 days before marketing.",
            "bodyKn": "ಗಾಯವಾಗದಂತೆ ಗೆಡ್ಡೆಗಳನ್ನು ಅಗೆದು ತೆಗೆದು 7 ದಿನ ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "chilli",
    "nameEn": "Green Chilli",
    "nameKn": "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ (Chilli)",
    "scientificName": "Capsicum annuum",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 150,
    "isPerennial": false,
    "popularVarieties": [
      "Byadagi Kaddi",
      "Byadagi Dabbi",
      "G-4",
      "Sitara",
      "Armoor",
      "Teja"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Well-drained black clay or fertile red loamy soil",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಕಪ್ಪು ಅಥವಾ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "SEEDLING_ESTABLISHMENT",
        "nameEn": "Seedling Establishment",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Transplanted seedlings adapt and root in the main field.",
        "descriptionKn": "ನಾಟಿ ಮಾಡಿದ ಸಸಿಗಳು ನೆಲೆಯೂರಿ ಹೊಸ ಬೇರು ಬಿಡುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Thrips & Mites Prevention",
            "titleKn": "ಥ್ರಿಪ್ಸ್ ಮತ್ತು ನುಸಿ ನಿಯಂತ್ರಣ",
            "bodyEn": "Spray Neem oil 1500ppm (4ml/L) or Fipronil (1ml/L) to prevent leaf upward/downward curl.",
            "bodyKn": "ಎಲೆ ಮುದುರು ರೋಗ ತಡೆಯಲು ಬೇವಿನ ಎಣ್ಣೆ ಅಥವಾ ಫಿಪ್ರೋನಿಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_BRANCHING",
        "nameEn": "Vegetative Branching",
        "nameKn": "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಕಾಯಿಕ ಬೆಳವಣಿಗೆ",
        "startDay": 26,
        "endDay": 55,
        "descriptionEn": "Dichotomous branching produces abundant flower nodes.",
        "descriptionKn": "ಹೆಚ್ಚಿನ ಕವಲುಗಳು ಬೆಳೆದು ಹೂವು ಬಿಡುವ ಜಾಗಗಳು ಹೆಚ್ಚಾಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "19:19:19 & Micronutrient Spray",
            "titleKn": "19:19:19 ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ",
            "bodyEn": "Apply 19:19:19 (4g/L) along with zinc and boron to promote branching.",
            "bodyKn": "ಕವಲುಗಳು ಹೆಚ್ಚಲು 19:19:19 ಜೊತೆಗೆ ಜಿಂಕ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_FRUIT_SET",
        "nameEn": "Flowering & Fruit Setting",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 56,
        "endDay": 85,
        "descriptionEn": "White flowers open and young chillies emerge.",
        "descriptionKn": "ಬಿಳಿ ಹೂಗಳು ಅರಳಿ ಹಸಿರು ಮೆಣಸಿನಕಾಯಿಗಳು ಬೆಳೆಯುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Prevent Flower Drop with NAA / Planofix",
            "titleKn": "ಹೂವು ಉದುರುವುದು ತಪ್ಪಿಸಲು ಪ್ಲಾನೋಫಿಕ್ಸ್",
            "bodyEn": "Spray NAA 4.5% SL (Planofix @ 0.25 ml/L) to stop flower and bud drop.",
            "bodyKn": "ಹೂವು ಉದುರುವುದು ನಿಲ್ಲಲು ಪ್ಲಾನೋಫಿಕ್ಸ್ (0.25 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "CONTINUOUS_PLUCKING",
        "nameEn": "Continuous Plucking Flushes",
        "nameKn": "ನಿರಂತರ ಕಟಾವು ಮತ್ತು ಕಾಯಿ ಬಿಡಿಸುವುದು",
        "startDay": 86,
        "endDay": 150,
        "descriptionEn": "Periodic green picking every 10-12 days or allow to ripen red.",
        "descriptionKn": "ಪ್ರತಿ 10-12 ದಿನಕ್ಕೊಮ್ಮೆ ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ ಕೊಯ್ಲು ಅಥವಾ ಕೆಂಪು ಹಣ್ಣಾಗಲು ಬಿಡುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Post-Harvest Booster Fertigation",
            "titleKn": "ಕೊಯ್ಲಿನ ನಂತರದ ಪೋಷಕಾಂಶ",
            "bodyEn": "Apply 13:0:45 (3 kg/acre) after every picking flush to sustain subsequent flowers.",
            "bodyKn": "ಪ್ರತಿ ಕೊಯ್ಲಿನ ನಂತರ ಮುಂದಿನ ಹೂವುಗಳಿಗಾಗಿ 13:0:45 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "groundnut",
    "nameEn": "Groundnut (Peanut)",
    "nameKn": "ಶೇಂಗಾ / ನೆಲಗಡಲೆ (Groundnut)",
    "scientificName": "Arachis hypogaea",
    "category": "Commercial & Cash Crops",
    "categoryKn": "ವಾಣಿಜ್ಯ ಮತ್ತು ನಗದು ಬೆಳೆಗಳು",
    "totalDays": 110,
    "isPerennial": false,
    "popularVarieties": [
      "TMV 2",
      "JL 24",
      "KDG 128",
      "GPBD 4",
      "Kadiri 6",
      "ICGV 91114"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Light sandy loam with calcium sufficiency and pH 6.0-7.5",
    "soilTypeKn": "ಸಡಿಲವಾದ ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "EMERGENCE_VEGETATIVE",
        "nameEn": "Emergence & Vegetative",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಎಲೆ ಬೆಳವಣಿಗೆ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Four-foliolate leaves emerge and nodulation begins.",
        "descriptionKn": "ಸಸಿ ಚಿಗುರಿ ಬೇರುಗಳಲ್ಲಿ ಸಾರಜನಕ ಸ್ಥಿರೀಕರಿಸುವ ಗಂಟುಗಳು ಆರಂಭವಾಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Rhizobium Seed Inoculation & Basal Gypsum",
            "titleKn": "ರೈಜೋಬಿಯಂ ಮತ್ತು ಜಿಪ್ಸಂ ಬಳಕೆ",
            "bodyEn": "Inoculate seeds with Rhizobium. Apply 100 kg Gypsum/acre as basal dose.",
            "bodyKn": "ಬೀಜಕ್ಕೆ ರೈಜೋಬಿಯಂ ಲೇಪಿಸಿ; ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಎಕರೆಗೆ 100 ಕೆಜಿ ಜಿಪ್ಸಂ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_PEGGING",
        "nameEn": "Flowering & Peg Penetration",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಊಡ (Peg) ಇಳಿಯುವ ಹಂತ",
        "startDay": 26,
        "endDay": 55,
        "descriptionEn": "Yellow flowers fertilize and pegs penetrate soil to form subterranean pods.",
        "descriptionKn": "ಹೂಗಳು ಅರಳಿ ಊಡಗಳು ಮಣ್ಣಿನೊಳಗೆ ಇಳಿದು ಕಾಯಿ ಕಟ್ಟಲು ಆರಂಭವಾಗುವ ಪ್ರಮುಖ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Apply 200 kg Gypsum at Pegging",
            "titleKn": "ಊಡ ಇಳಿಯುವಾಗ 200 ಕೆಜಿ ಜಿಪ್ಸಂ ನೀಡಿ",
            "bodyEn": "Apply Gypsum around root zone for calcium and sulphur to prevent pops (hollow shells).",
            "bodyKn": "ಜೊಳ್ಳು ಕಾಯಿಗಳಾಗುವುದನ್ನು ತಪ್ಪಿಸಲು ಊಡ ಇಳಿಯುವಾಗ ಬುಡಕ್ಕೆ 200 ಕೆಜಿ ಜಿಪ್ಸಂ ಹಾಕಿ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "IRRIGATION",
            "titleEn": "Do Not Disturb Soil During Pegging",
            "titleKn": "ಊಡ ಇಳಿಯುವಾಗ ಕಳೆ ತೆಗೆಯಬೇಡಿ",
            "bodyEn": "Avoid hoeing or interculture after day 40 as it breaks delicate pegs.",
            "bodyKn": "40 ದಿನಗಳ ನಂತರ ಎಡೆಕುಂಟೆ ಹೊಡೆಯಬೇಡಿ; ಊಡಗಳು ತುಂಡಾಗುವ ಅಪಾಯವಿರುತ್ತದೆ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "POD_DEVELOPMENT",
        "nameEn": "Pod Filling & Shell Hardening",
        "nameKn": "ಕಾಯಿ ತುಂಬುವ ಮತ್ತು ಬಲಿಯುವ ಹಂತ",
        "startDay": 56,
        "endDay": 85,
        "descriptionEn": "Kernels swell inside shell. Peak oil accumulation.",
        "descriptionKn": "ಚಿಪ್ಪಿನೊಳಗೆ ಬೀಜಗಳು ದಪ್ಪವಾಗಿ ಎಣ್ಣೆ ಅಂಶ ಸಂಗ್ರಹವಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Tikka Leaf Spot Protection",
            "titleKn": "ಟಿಕ್ಕಾ ಎಲೆ ಮಚ್ಚೆ ರೋಗ ನಿಯಂತ್ರಣ",
            "bodyEn": "If dark brown circular leaf spots appear, spray Carbendazim + Mancozeb (2g/L).",
            "bodyKn": "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಚುಕ್ಕೆ ಕಂಡರೆ ಮ್ಯಾಂಕೋಜೆಬ್ + ಕಾರ್ಬೆಂಡಾಜಿಮ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "POD_MATURITY_HARVEST",
        "nameEn": "Pod Maturity & Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 86,
        "endDay": 110,
        "descriptionEn": "Inner shell turns dark brown. Ready to pull up vines.",
        "descriptionKn": "ಚಿಪ್ಪಿನ ಒಳಭಾಗ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಾಯಿಗಳು ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Pre-Harvest Light Irrigation",
            "titleKn": "ಕಿತ್ತು ತೆಗೆಯಲು ಸುಲಭವಾಗಲು ಲಘು ನೀರು",
            "bodyEn": "Give light watering 2 days prior to pulling so pods do not break off in dry soil.",
            "bodyKn": "ಕಾಯಿಗಳು ಮಣ್ಣಿನಲ್ಲಿ ಉಳಿಯದಂತೆ ಕಿತ್ತು ತೆಗೆಯುವ 2 ದಿನ ಮೊದಲು ಲಘು ನೀರು ಹರಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "soybean",
    "nameEn": "Soybean",
    "nameKn": "ಸೋಯಾಬೀನ್ (Soybean)",
    "scientificName": "Glycine max",
    "category": "Commercial & Cash Crops",
    "categoryKn": "ವಾಣಿಜ್ಯ ಮತ್ತು ನಗದು ಬೆಳೆಗಳು",
    "totalDays": 95,
    "isPerennial": false,
    "popularVarieties": [
      "JS 335",
      "JS 9305",
      "DSb 21",
      "DSb 28",
      "MAC 450",
      "KDS 726"
    ],
    "seasons": [
      "Kharif"
    ],
    "soilType": "Fertile well-drained black soil or clayey loam",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಕಪ್ಪು ಅಥವಾ ಜೇಡಿ ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "EMERGENCE_VEGETATIVE",
        "nameEn": "Emergence & Early Vegetative",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಚಿಗುರು ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Emergence of unifoliate then trifoliate leaves.",
        "descriptionKn": "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಮೂರು ಎಲೆಗಳ ಚಿಗುರು ಬರುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Stem Fly & Girdle Beetle Vigilance",
            "titleKn": "ಕಾಂಡದ ನೊಣ ಮತ್ತು ಗಿರ್ಡಲ್ ಜೀರುಂಡೆ",
            "bodyEn": "Check for withered shoots. If girdling seen, spray Thiamethoxam 25% WG (0.3g/L).",
            "bodyKn": "ಸುಳಿ ಒಣಗುವುದು ಕಂಡರೆ ಥಯಾಮೆಥಾಕ್ಸಮ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "RAPID_BRANCHING",
        "nameEn": "Rapid Branching & Pre-Flowering",
        "nameKn": "ಕವಲುಗಳು ಮತ್ತು ಹೂವಿನ ಮೊಗ್ಗು",
        "startDay": 21,
        "endDay": 40,
        "descriptionEn": "Branch expansion and vigorous canopy closure.",
        "descriptionKn": "ಗಿಡವು ಕವಲೊಡೆದು ದಟ್ಟವಾಗಿ ಎಲೆಗಳನ್ನು ಹರಡುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Foliar 19:19:19 + Micronutrients",
            "titleKn": "19:19:19 ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray 19:19:19 (5g/L) to encourage vigorous branching before flowers appear.",
            "bodyKn": "ಹೂವು ಬರುವ ಮುನ್ನ ಕವಲು ಹೆಚ್ಚಲು 19:19:19 ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "FLOWERING_POD_FORMATION",
        "nameEn": "Flowering & Pod Formation",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 41,
        "endDay": 70,
        "descriptionEn": "Small purple/white flowers form clusters of pubescent pods.",
        "descriptionKn": "ಸಣ್ಣ ಹೂಗಳು ಅರಳಿ ನವಿರಾದ ಕಾಯಿಗಳು ರೂಪುಗೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Avoid Drought Stress During Podding",
            "titleKn": "ಕಾಯಿ ಕಟ್ಟುವಾಗ ನೀರಿನ ಕೊರತೆ ಆಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ",
            "bodyEn": "Moisture deficiency now drops pods severely. Provide critical irrigation.",
            "bodyKn": "ಕಾಯಿ ಉದುರದಂತೆ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "POD_FILLING_MATURITY",
        "nameEn": "Pod Filling & Harvest",
        "nameKn": "ಕಾಳು ತುಂಬುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 71,
        "endDay": 95,
        "descriptionEn": "Leaves turn yellow and drop off. Pods turn golden brown.",
        "descriptionKn": "ಎಲೆಗಳು ಉದುರಿ ಕಾಯಿಗಳು ಒಣಗಿ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest Promptly to Avoid Pod Shattering",
            "titleKn": "ಕಾಯಿ ಸಿಡಿಯುವ ಮುನ್ನವೇ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Harvest when 90% pods turn brown and seeds rattle inside pods.",
            "bodyKn": "90% ಕಾಯಿಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ತಕ್ಷಣ ಕೊಯ್ಲು ಮಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "tur",
    "nameEn": "Tur (Red Gram / Pigeonpea)",
    "nameKn": "ತೊಗರಿ (Red Gram)",
    "scientificName": "Cajanus cajan",
    "category": "Pulses & Legumes",
    "categoryKn": "ದ್ವಿದಳ ಧಾನ್ಯಗಳು ಮತ್ತು ಕಾಳುಗಳು",
    "totalDays": 160,
    "isPerennial": false,
    "popularVarieties": [
      "TS 3R",
      "BSMR 736",
      "GRG 811",
      "Maruti (ICP 8863)",
      "Asha (ICPL 87119)"
    ],
    "seasons": [
      "Kharif"
    ],
    "soilType": "Deep well-drained loam or black soil with pH 6.5-7.5",
    "soilTypeKn": "ಆಳವಾದ ಕಪ್ಪು ಅಥವಾ ಫಲವತ್ತಾದ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "GERMINATION_SEEDLING",
        "nameEn": "Germination & Seedling",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಎಳೆ ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 30,
        "descriptionEn": "Slow early growth while deep taproot establishes.",
        "descriptionKn": "ತಾಯಿಬೇರು ಆಳಕ್ಕೆ ಇಳಿಯುವ ಆರಂಭಿಕ ನಿಧಾನ ಬೆಳವಣಿಗೆಯ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Fusarium Wilt Prevention",
            "titleKn": "ನೆಟೆ ರೋಗ (Wilt) ತಡೆಗಟ್ಟುವಿಕೆ",
            "bodyEn": "Drench roots with Trichoderma viride (10g/L) if sudden plant wilting appears in patches.",
            "bodyKn": "ಗಿಡಗಳು ಏಕಾಏಕಿ ಬಾಡಿದರೆ ಟ್ರೈಕೋಡರ್ಮಾ (10 ಗ್ರಾಂ/ಲೀ) ಬುಡಕ್ಕೆ ಸುರಿಯಿರಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BRANCHING_CANOPY",
        "nameEn": "Branching & Nipping Stage",
        "nameKn": "ಕವಲೊಡೆಯುವುದು ಮತ್ತು ತುದಿ ಚಿವುಟುವಿಕೆ",
        "startDay": 31,
        "endDay": 75,
        "descriptionEn": "Terminal buds nipped at 50 days to induce bushy branching.",
        "descriptionKn": "50ನೇ ದಿನದಲ್ಲಿ ತುದಿ ಚಿವುಟುವುದರಿಂದ ಹೆಚ್ಚಿನ ಕವಲುಗಳು ಬರುತ್ತವೆ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Nipping Terminal Shoots & DAP Spray",
            "titleKn": "ತುದಿ ಚಿವುಟಿ ಡಿಎಪಿ ಸಿಂಪಡಿಸಿ",
            "bodyEn": "Nip top 5 cm shoots at Day 50. Foliar spray 2% DAP for massive lateral branches.",
            "bodyKn": "ಹೆಚ್ಚು ಕವಲು ಬರಲು 50ನೇ ದಿನ ತುದಿ ಚಿವುಟಿ 2% ಡಿಎಪಿ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWER_BUD_INITIATION",
        "nameEn": "Flower Bud Initiation",
        "nameKn": "ಹೂವಿನ ಮೊಗ್ಗು ಮೂಡುವ ಹಂತ",
        "startDay": 76,
        "endDay": 110,
        "descriptionEn": "Prolific yellow-streaked papilionaceous blossoms appear.",
        "descriptionKn": "ಹಳದಿ ಬಣ್ಣದ ಹೂಗಳು ಗೊಂಚಲು ಗೊಂಚಲಾಗಿ ಅರಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Helicoverpa Pod Borer First Surveillance",
            "titleKn": "ಕಾಯಿ ಕೊರೆಯುವ ಕಾಯಿಕೊರಕ ಹುಳು ನಿಯಂತ್ರಣ",
            "bodyEn": "Install 4 Pheromone traps/acre. Spray Chlorantraniliprole 18.5% SC (0.3 ml/L) at 50% flowering.",
            "bodyKn": "ಹೂವಾಡುವಾಗ ಕಾಯಿಕೊರಕ ಹುಳು ತಡೆಯಲು ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "POD_DEVELOPMENT_FILLING",
        "nameEn": "Pod Development & Grain Filling",
        "nameKn": "ಕಾಯಿ ಬೆಳೆಯುವುದು ಮತ್ತು ಕಾಳು ತುಂಬುವಿಕೆ",
        "startDay": 111,
        "endDay": 140,
        "descriptionEn": "Flat hairy pods develop plump protein-rich seeds.",
        "descriptionKn": "ಕಾಯಿಗಳಲ್ಲಿ ಕಾಳುಗಳು ದಪ್ಪವಾಗಿ ಗಟ್ಟಿಯಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Foliar 0:0:50 (Potash) Spray",
            "titleKn": "0:0:50 ಪೊಟ್ಯಾಷ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray 0:0:50 (5g/L) to maximize 100-seed test weight and pod fullness.",
            "bodyKn": "ಕಾಳು ದಪ್ಪವಾಗಿ ತೂಕ ಬರಲು 0:0:50 ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 141,
        "endDay": 160,
        "descriptionEn": "Pods turn dark brown. Crop ready for harvesting.",
        "descriptionKn": "ಕಾಯಿಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Cut and Sun Dry Plants for Threshing",
            "titleKn": "ಗಿಡಗಳನ್ನು ಕಟಾವು ಮಾಡಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ",
            "bodyEn": "Harvest when 80-85% pods turn brown. Sun dry bundles for 4-5 days before threshing.",
            "bodyKn": "85% ಕಾಯಿಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ಒಕ್ಕಣೆ ಮಾಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "bengal_gram",
    "nameEn": "Bengal Gram (Chickpea / Chana)",
    "nameKn": "ಕಡಲೆ (Bengal Gram)",
    "scientificName": "Cicer arietinum",
    "category": "Pulses & Legumes",
    "categoryKn": "ದ್ವಿದಳ ಧಾನ್ಯಗಳು ಮತ್ತು ಕಾಳುಗಳು",
    "totalDays": 95,
    "isPerennial": false,
    "popularVarieties": [
      "JG 11",
      "JAKI 9218",
      "BGD 103",
      "Annigeri 1",
      "MNK 1 (Kabuli)"
    ],
    "seasons": [
      "Rabi"
    ],
    "soilType": "Deep moisture-retentive black cotton soil",
    "soilTypeKn": "ಆಳವಾದ ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "SOWING_GERMINATION",
        "nameEn": "Sowing & Germination",
        "nameKn": "ಬಿತ್ತನೆ ಮತ್ತು ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Seed germination on residual soil moisture.",
        "descriptionKn": "ಮಣ್ಣಿನ ತೇವಾಂಶದಲ್ಲಿ ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಸಸಿ ಬರುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Trichoderma Seed Dressing for Wilt",
            "titleKn": "ನೆಟೆ ರೋಗಕ್ಕೆ ಬೀಜೋಪಚಾರ",
            "bodyEn": "Treat seed with Trichoderma viride (5g/kg) to prevent Fusarium root rot in early winter.",
            "bodyKn": "ಬೇರು ಕೊಳೆಯುವುದನ್ನು ತಡೆಯಲು ಟ್ರೈಕೋಡರ್ಮಾದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_NIPPING",
        "nameEn": "Vegetative Branching & Nipping",
        "nameKn": "ಕವಲುಗಳು ಮತ್ತು ತುದಿ ಚಿವುಟುವಿಕೆ",
        "startDay": 21,
        "endDay": 45,
        "descriptionEn": "Terminal shoot tip plucked at 30-35 days to multiply pod branches.",
        "descriptionKn": "30ನೇ ದಿನ ತುದಿ ಚಿವುಟುವುದರಿಂದ ಹೆಚ್ಚಿನ ಕವಲುಗಳು ಬರುತ್ತವೆ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Nipping Shoot Tips at Day 30",
            "titleKn": "30ನೇ ದಿನ ತುದಿ ಚಿವುಟುವುದು",
            "bodyEn": "Pluck top 2-3 cm shoot tips to trigger profuse side branching and double pod count.",
            "bodyKn": "ಹೆಚ್ಚು ಕಾಯಿಗಳು ಬರಲು ಗಿಡದ ತುದಿ ಚಿವುಟಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_POD_SET",
        "nameEn": "Flowering & Pod Setting",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 46,
        "endDay": 70,
        "descriptionEn": "Pink/white flowers set into inflated glandular pods.",
        "descriptionKn": "ಹೂಗಳು ಅರಳಿ ಉಬ್ಬಿದ ಕಡಲೆ ಕಾಯಿಗಳು ಕಟ್ಟುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Gram Pod Borer Vigilance",
            "titleKn": "ಕಡಲೆ ಕಾಯಿಕೊರಕ ಹುಳು ನಿಯಂತ್ರಣ",
            "bodyEn": "Spray Emamectin Benzoate 5% SG (0.4g/L) or Chlorantraniliprole (0.3ml/L) at pod set.",
            "bodyKn": "ಕಾಯಿಕೊರಕ ಹುಳು ತಡೆಯಲು ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೇಟ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 71,
        "endDay": 95,
        "descriptionEn": "Plants dry and pods rattle. Ready to pull and thresh.",
        "descriptionKn": "ಗಿಡ ಒಣಗಿ ಕಾಯಿಗಳಲ್ಲಿ ಕಾಳು ಶಬ್ದ ಮಾಡುವಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest on Sunny Morning",
            "titleKn": "ಬಿಸಿಲಿನಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Pull plants when leaves turn reddish-brown and dry completely under sun.",
            "bodyKn": "ಎಲೆಗಳು ಒಣಗಿ ಕೆಂಪಾದಾಗ ಗಿಡಗಳನ್ನು ಕಿತ್ತು ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "green_gram",
    "nameEn": "Green Gram (Moong)",
    "nameKn": "ಹೆಸರು ಕಾಳು (Moong)",
    "scientificName": "Vigna radiata",
    "category": "Pulses & Legumes",
    "categoryKn": "ದ್ವಿದಳ ಧಾನ್ಯಗಳು ಮತ್ತು ಕಾಳುಗಳು",
    "totalDays": 70,
    "isPerennial": false,
    "popularVarieties": [
      "DGGV 2",
      "Selection 4",
      "IPM 02-3",
      "Pusa Baisakhi",
      "KDM 1"
    ],
    "seasons": [
      "Kharif",
      "Summer"
    ],
    "soilType": "Well-drained fertile loam or red sandy soil",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕೆಂಪು ಮರಳು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "SOWING_EMERGENCE",
        "nameEn": "Sowing & Rapid Emergence",
        "nameKn": "ಬಿತ್ತನೆ ಮತ್ತು ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ",
        "startDay": 0,
        "endDay": 15,
        "descriptionEn": "Fast germination and early trifoliate leaf formation.",
        "descriptionKn": "ವೇಗವಾಗಿ ಮೊಳಕೆಯೊಡೆದು ಮೂರು ಎಲೆಗಳು ಬರುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Whitefly & Yellow Mosaic Virus (YMV) Control",
            "titleKn": "ಬಿಳಿ ನೊಣ & ಹಳದಿ ಎಲೆ ರೋಗ ತಡೆ",
            "bodyEn": "Yellow Mosaic Virus is spread by whiteflies. Spray Imidacloprid (0.3ml/L) at first sight.",
            "bodyKn": "ಹಳದಿ ಎಲೆ ರೋಗ ಹರಡುವ ಬಿಳಿ ನೊಣಗಳನ್ನು ತಡೆಯಲು ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_GROWTH",
        "nameEn": "Vegetative Growth",
        "nameKn": "ಕಾಯಿಕ ಬೆಳವಣಿಗೆ",
        "startDay": 16,
        "endDay": 35,
        "descriptionEn": "Active canopy establishment and root nodule nitrogen fixation.",
        "descriptionKn": "ಗಿಡ ಬೆಳೆದು ಬೇರುಗಳಲ್ಲಿ ಸಾರಜನಕ ಗಂಟುಗಳು ಸಕ್ರಿಯವಾಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Foliar 2% DAP or Pulse Wonder Spray",
            "titleKn": "2% ಡಿಎಪಿ ದ್ರಾವಣ ಸಿಂಪಡಣೆ",
            "bodyEn": "Foliar spray 2% DAP (20g/L) to give extra strength for flower bud initiation.",
            "bodyKn": "ಹೆಚ್ಚು ಹೂವು ಬರಲು 2% ಡಿಎಪಿ ದ್ರಾವಣವನ್ನು ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "FLOWERING_POD_SET",
        "nameEn": "Flowering & Pod Formation",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 36,
        "endDay": 55,
        "descriptionEn": "Yellow flowers produce clusters of slender green pods.",
        "descriptionKn": "ಹಳದಿ ಹೂಗಳು ಅರಳಿ ಸಣ್ಣ ಕಾಯಿಗಳು ಗೊಂಚಲಾಗಿ ಬೆಳೆಯುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Maruca Pod Borer Surveillance",
            "titleKn": "ಮಾರುಕ ಕಾಯಿಕೊರಕ ಹುಳು ನಿಯಂತ್ರಣ",
            "bodyEn": "Look for webbed flowers and bored pods. Spray Emamectin Benzoate (0.5g/L).",
            "bodyKn": "ಹೂವುಗಳಲ್ಲಿ ಬಲೆ ಕಟ್ಟಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳುವಿಗೆ ಎಮಾಮೆಕ್ಟಿನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "POD_MATURITY_PICKING",
        "nameEn": "Maturity & Pod Picking",
        "nameKn": "ಕಾಯಿ ಬಲಿಯುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 56,
        "endDay": 70,
        "descriptionEn": "Pods turn black and crisp. Hand pick mature pods.",
        "descriptionKn": "ಕಾಯಿಗಳು ಕಪ್ಪಾಗಿ ಒಣಗಿದಾಗ ಹಂತ ಹಂತವಾಗಿ ಕೊಯ್ಲು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Pick Black Pods in Flushes",
            "titleKn": "ಕಪ್ಪು ಬಣ್ಣದ ಕಾಯಿಗಳನ್ನು ಕಿತ್ತುಕೊಳ್ಳಿ",
            "bodyEn": "Pick fully mature black pods in 2 flushes to avoid grain damage from rains.",
            "bodyKn": "ಮಳೆಗೆ ಹಾಳಾಗದಂತೆ ಕಪ್ಪಾದ ಕಾಯಿಗಳನ್ನು ತಕ್ಷಣ ಬಿಡಿಸಿಕೊಳ್ಳಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "black_gram",
    "nameEn": "Black Gram (Urad)",
    "nameKn": "ಉದ್ದಿನ ಕಾಳು (Urad)",
    "scientificName": "Vigna mungo",
    "category": "Pulses & Legumes",
    "categoryKn": "ದ್ವಿದಳ ಧಾನ್ಯಗಳು ಮತ್ತು ಕಾಳುಗಳು",
    "totalDays": 75,
    "isPerennial": false,
    "popularVarieties": [
      "LBG 791",
      "Rashmi (DU 1)",
      "TAU 1",
      "WBU 108",
      "VBN 8"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Fertile well-drained loam or black cotton soil",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "SOWING_ESTABLISHMENT",
        "nameEn": "Sowing & Seedling",
        "nameKn": "ಬಿತ್ತನೆ ಮತ್ತು ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Germination and establishment of hairy foliage.",
        "descriptionKn": "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಸಸಿ ನೆಲೆಯೂರುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Prevent Leaf Crinkle & Mosaic Virus",
            "titleKn": "ಎಲೆ ನೆರಿಗೆ ಮತ್ತು ಹಳದಿ ರೋಗ ತಡೆ",
            "bodyEn": "Install yellow sticky traps to control aphid and whitefly vectors.",
            "bodyKn": "ರೋಗ ಹರಡುವ ಕೀಟಗಳನ್ನು ಹಿಡಿಯಲು ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_BRANCHING",
        "nameEn": "Vegetative Growth & Branching",
        "nameKn": "ಕಾಯಿಕ ಬೆಳವಣಿಗೆ ಮತ್ತು ಕವಲುಗಳು",
        "startDay": 21,
        "endDay": 40,
        "descriptionEn": "Spreading canopy with dense foliage and nitrogen fixation.",
        "descriptionKn": "ಗಿಡವು ಕವಲೊಡೆದು ದಟ್ಟವಾಗಿ ಹರಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Foliar Micronutrient & 19:19:19 Spray",
            "titleKn": "19:19:19 ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ",
            "bodyEn": "Spray 19:19:19 (4g/L) to build strong branching before flowering starts.",
            "bodyKn": "ಕವಲು ಹೆಚ್ಚಲು 19:19:19 ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "FLOWERING_POD_SET",
        "nameEn": "Flowering & Pod Setting",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 41,
        "endDay": 60,
        "descriptionEn": "Bright yellow flowers produce hairy erect pods.",
        "descriptionKn": "ಹಳದಿ ಹೂಗಳು ಅರಳಿ ನವಿರಾದ ಕಪ್ಪು ಕಾಯಿಗಳು ರೂಪುಗೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Spodoptera & Pod Borer Protection",
            "titleKn": "ಕಾಯಿಕೊರಕ ಹುಳು ನಿಯಂತ್ರಣ",
            "bodyEn": "Spray Chlorantraniliprole 18.5% SC (0.3 ml/L) or Flubendiamide (0.5 ml/L).",
            "bodyKn": "ಕಾಯಿಕೊರಕ ಹುಳು ತಡೆಯಲು ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Pod Maturity & Harvesting",
        "nameKn": "ಕಾಯಿ ಬಲಿಯುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 61,
        "endDay": 75,
        "descriptionEn": "Pods turn black and dry. Ready for harvest.",
        "descriptionKn": "ಕಾಯಿಗಳು ಕಪ್ಪಾಗಿ ಬಲಿತು ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest When 85% Pods Turn Black",
            "titleKn": "85% ಕಾಯಿ ಕಪ್ಪಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Cut plants or pick pods when mostly black. Dry on tarpaulin under sun before threshing.",
            "bodyKn": "ಕಾಯಿಗಳು ಕಪ್ಪಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ಒಕ್ಕಣೆ ಮಾಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "jowar",
    "nameEn": "Jowar (Sorghum)",
    "nameKn": "ಜೋಳ (Sorghum / Jowar)",
    "scientificName": "Sorghum bicolor",
    "category": "Cereals & Millets",
    "categoryKn": "ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು",
    "totalDays": 110,
    "isPerennial": false,
    "popularVarieties": [
      "M 35-1 (Maldandi)",
      "CSH 14",
      "CSH 16",
      "DSV 4",
      "BJV 44"
    ],
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "soilType": "Deep black soil or fertile red loam",
    "soilTypeKn": "ಆಳವಾದ ಕಪ್ಪು ಅಥವಾ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "SEEDLING_ESTABLISHMENT",
        "nameEn": "Seedling & Establishment",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Emergence and early shoot development.",
        "descriptionKn": "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಎಳೆ ಸಸಿ ಬೆಳೆಯುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Sorghum Shoot Fly Management",
            "titleKn": "ಜೋಳದ ಸುಳಿ ನೊಣ ನಿಯಂತ್ರಣ",
            "bodyEn": "Apply Phorate 10G or Carbofuran at sowing or spray Dimethoate (1.7 ml/L) within 15 days.",
            "bodyKn": "ಸುಳಿ ಒಣಗುವುದನ್ನು ತಪ್ಪಿಸಲು ಬಿತ್ತನೆಯ 15 ದಿನದೊಳಗೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "KNEE_HIGH_VEGETATIVE",
        "nameEn": "Knee-High Rapid Vegetative",
        "nameKn": "ಮಂಡಿಯುದ್ದದ ವೇಗದ ಬೆಳವಣಿಗೆ",
        "startDay": 21,
        "endDay": 45,
        "descriptionEn": "Stem thickens and leaf area expands rapidly.",
        "descriptionKn": "ಕಾಂಡ ದಪ್ಪವಾಗಿ ಎಲೆಗಳು ವಿಸ್ತಾರವಾಗಿ ಬೆಳೆಯುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Top Dress Urea & Inter-Cultivation",
            "titleKn": "ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ ಮತ್ತು ಎಡೆಕುಂಟೆ",
            "bodyEn": "Apply 30 kg Urea per acre followed by inter-cultivation to suppress weeds and aerate soil.",
            "bodyKn": "ಎಕರೆಗೆ 30 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ ಎಡೆಕುಂಟೆ ಹೊಡೆಯಿರಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BOOT_LEAF_FLOWERING",
        "nameEn": "Boot Leaf & Earhead Emergence",
        "nameKn": "ತೆನೆ ಹೊರಬರುವ ಮತ್ತು ಹೂವಾಡುವ ಹಂತ",
        "startDay": 46,
        "endDay": 75,
        "descriptionEn": "Flag leaf swells and large panicle emerges with blooming flowers.",
        "descriptionKn": "ದೊಡ್ಡ ತೆನೆ ಹೊರಬಂದು ಪರಾಗಸ್ಪರ್ಶ ನಡೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Maintain Moisture at Flowering",
            "titleKn": "ತೆನೆ ಮೂಡುವಾಗ ನೀರು ನಿಲ್ಲಿಸಿ",
            "bodyEn": "Do not let soil crack during earhead emergence. Water stress causes chaffy grains.",
            "bodyKn": "ಜಳ್ಳು ಕಾಳುಗಳಾಗದಂತೆ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "GRAIN_FILLING_HARVEST",
        "nameEn": "Grain Ripening & Harvest",
        "nameKn": "ಕಾಳು ಮಾಗುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 76,
        "endDay": 110,
        "descriptionEn": "Grains turn pearly white or yellow. Stalks ready for cutting.",
        "descriptionKn": "ಕಾಳುಗಳು ಮಾಗಿ ಹೊಳಪು ಬಂದು ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest When Grains are Hard",
            "titleKn": "ಕಾಳುಗಳು ಗಟ್ಟಿಯಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Cut earheads when grains are hard and dry in sun to 12% moisture.",
            "bodyKn": "ಕಾಳು ಗಟ್ಟಿಯಾದಾಗ ತೆನೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "bajra",
    "nameEn": "Bajra (Pearl Millet)",
    "nameKn": "ಸಜ್ಜೆ (Bajra / Pearl Millet)",
    "scientificName": "Pennisetum glaucum",
    "category": "Cereals & Millets",
    "categoryKn": "ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು",
    "totalDays": 85,
    "isPerennial": false,
    "popularVarieties": [
      "ICTP 8203",
      "HHB 67",
      "GHB 558",
      "ProAgro 9444",
      "Kaveri Super Boss"
    ],
    "seasons": [
      "Kharif",
      "Summer"
    ],
    "soilType": "Light sandy soil with good percolation, drought tolerant",
    "soilTypeKn": "ಸಡಿಲವಾದ ಮರಳು ಮಿಶ್ರಿತ ಒಣ ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "GERMINATION_SEEDLING",
        "nameEn": "Germination & Seedling",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 18,
        "descriptionEn": "Rapid emergence under dry conditions.",
        "descriptionKn": "ಒಣ ಹವೆಯಲ್ಲಿಯೂ ವೇಗವಾಗಿ ಮೊಳಕೆಯೊಡೆಯುವ ಸಸಿ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Basal DAP & Thinning",
            "titleKn": "ಬುಡಕ್ಕೆ ಡಿಎಪಿ ಮತ್ತು ಸಸಿ ತೆಳು ಮಾಡುವುದು",
            "bodyEn": "Apply 30 kg DAP at sowing. Thin seedlings at 15 days to maintain 15cm spacing.",
            "bodyKn": "ಎಕರೆಗೆ 30 ಕೆಜಿ ಡಿಎಪಿ ನೀಡಿ 15ನೇ ದಿನ ಸಸಿಗಳನ್ನು ತೆಳು ಮಾಡಿ 15 ಸೆಂ.ಮೀ ಅಂತರ ಕಾಪಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_VEGETATIVE",
        "nameEn": "Tillering & Rapid Vegetative",
        "nameKn": "ಕವಲೊಡೆಯುವುದು ಮತ್ತು ಬೆಳವಣಿಗೆ",
        "startDay": 19,
        "endDay": 40,
        "descriptionEn": "Multiple basal tillers and fast shoot growth.",
        "descriptionKn": "ಬುಡದಿಂದ ಕವಲುಗಳು ಬಂದು ವೇಗವಾಗಿ ಬೆಳೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Urea Top Dressing",
            "titleKn": "ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
            "bodyEn": "Apply 25 kg Urea per acre when soil has light moisture.",
            "bodyKn": "ತೇವಾಂಶವಿದ್ದಾಗ ಎಕರೆಗೆ 25 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "EARHEAD_FLOWERING",
        "nameEn": "Earhead Emergence & Flowering",
        "nameKn": "ತೆನೆ ಹೊರಬರುವುದು ಮತ್ತು ಹೂವಾಡುವುದು",
        "startDay": 41,
        "endDay": 65,
        "descriptionEn": "Cylindrical spike earheads emerge with dense florets.",
        "descriptionKn": "ಉದ್ದನೆಯ ಸಿಲಿಂಡರ್ ಆಕಾರದ ತೆನೆಗಳು ಹೊರಬಂದು ಹೂ ಅರಳುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Ergot & Downy Mildew Protection",
            "titleKn": "ಜೇನು ಜಿಡ್ಡು (Ergot) ರೋಗ ತಡೆ",
            "bodyEn": "If pink honeydew drops appear on earheads, spray Mancozeb 75% WP (2g/L).",
            "bodyKn": "ತೆನೆಯ ಮೇಲೆ ಜೇನಿನಂತಹ ಹನಿ ಕಂಡರೆ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "GRAIN_FILLING_HARVEST",
        "nameEn": "Grain Ripening & Harvesting",
        "nameKn": "ಕಾಳು ಮಾಗುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 66,
        "endDay": 85,
        "descriptionEn": "Grains harden and turn slate-gray. Cut earheads.",
        "descriptionKn": "ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗಿ ಬೂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest and Sun Dry",
            "titleKn": "ಕೊಯ್ಲು ಮಾಡಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ",
            "bodyEn": "Cut earheads, dry for 3-4 days in sun before threshing to prevent mold.",
            "bodyKn": "ತೆನೆಗಳನ್ನು ಕತ್ತರಿಸಿ 3-4 ದಿನ ಚೆನ್ನಾಗಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "wheat",
    "nameEn": "Wheat",
    "nameKn": "ಗೋಧಿ (Wheat)",
    "scientificName": "Triticum aestivum",
    "category": "Cereals & Millets",
    "categoryKn": "ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು",
    "totalDays": 115,
    "isPerennial": false,
    "popularVarieties": [
      "DWR 162",
      "UAS 304",
      "DWR 2006",
      "Bijaga Yellow",
      "HD 2967",
      "GW 322"
    ],
    "seasons": [
      "Rabi"
    ],
    "soilType": "Well-drained fertile loam or deep black soil",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "CROWN_ROOT_INITIATION",
        "nameEn": "Crown Root Initiation (CRI)",
        "nameKn": "ಕಿರೀಟ ಬೇರುಗಳು (CRI) ಮೂಡುವ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Crown roots anchor plant; most critical irrigation stage.",
        "descriptionKn": "ಕಿರೀಟ ಬೇರುಗಳು ಮೂಡುವ ಅತ್ಯಂತ ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Mandatory CRI Irrigation at Day 21",
            "titleKn": "21ನೇ ದಿನ ಕಡ್ಡಾಯ ನೀರಾವರಿ",
            "bodyEn": "Never delay irrigation at Day 21 (CRI stage). Delay causes massive yield reduction.",
            "bodyKn": "21ನೇ ದಿನ ತಪ್ಪದೇ ನೀರು ಹರಿಸಿ; ಇಲ್ಲದಿದ್ದರೆ ಇಳುವರಿ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_JOINTING",
        "nameEn": "Tillering & Jointing",
        "nameKn": "ಕವಲೊಡೆಯುವುದು ಮತ್ತು ಗಿಣ್ಣು ಬೆಳವಣಿಗೆ",
        "startDay": 26,
        "endDay": 55,
        "descriptionEn": "Stalk joints push upward and canopy builds.",
        "descriptionKn": "ಕಾಂಡದ ಗಿಣ್ಣುಗಳು ಬೆಳೆದು ಕವಲುಗಳು ಹೆಚ್ಚುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Urea Top Dressing at Jointing",
            "titleKn": "ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
            "bodyEn": "Apply 30 kg Urea per acre just before second irrigation.",
            "bodyKn": "ಎರಡನೇ ನೀರಾವರಿಗೂ ಮುನ್ನ ಎಕರೆಗೆ 30 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_HEADING",
        "nameEn": "Heading & Anthesis (Flowering)",
        "nameKn": "ತೆನೆ ಹೊರಬರುವುದು ಮತ್ತು ಹೂವಾಡುವ ಹಂತ",
        "startDay": 56,
        "endDay": 80,
        "descriptionEn": "Ears fully emerge and anthers shed pollen.",
        "descriptionKn": "ಗೋಧಿ ತೆನೆಗಳು ಸಂಪೂರ್ಣ ಹೊರಬಂದು ಪರಾಗಸ್ಪರ್ಶ ನಡೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Rust & Powdery Mildew Watch",
            "titleKn": "ತುಕ್ಕು ರೋಗ ಮತ್ತು ಬೂದಿ ರೋಗ ತಡೆ",
            "bodyEn": "If orange/yellow rust pustules appear on leaves, spray Propiconazole 25% EC (1 ml/L).",
            "bodyKn": "ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಅಥವಾ ಕಂದು ತುಕ್ಕು ಕಂಡರೆ ಪ್ರೊಪಿಕೊನಾಜೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "DOUGH_RIPENING",
        "nameEn": "Milk, Dough & Ripening",
        "nameKn": "ಕಾಳು ಮಾಗುವ ಹಂತ",
        "startDay": 81,
        "endDay": 100,
        "descriptionEn": "Kernels pass from milk to hard dough stage.",
        "descriptionKn": "ಕಾಳುಗಳಲ್ಲಿ ಹಾಲು ಗಟ್ಟಿಯಾಗಿ ಮಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Final Light Watering at Dough Stage",
            "titleKn": "ಅಂತಿಮ ಲಘು ನೀರಾವರಿ",
            "bodyEn": "Provide light irrigation at grain filling. Avoid irrigating in high wind to prevent lodging.",
            "bodyKn": "ಕಾಳು ತುಂಬಲು ಲಘು ನೀರು ನೀಡಿ; ಗಾಳಿಯಿರುವಾಗ ನೀರು ಹರಿಸಬೇಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 101,
        "endDay": 115,
        "descriptionEn": "Golden yellow straw. Grains snap cleanly under teeth.",
        "descriptionKn": "ಗಿಡವು ಹೊಂಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಾಳು ಗಟ್ಟಿಯಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Combine Harvest on Dry Sunny Day",
            "titleKn": "ಒಣ ಬಿಸಿಲಿನ ದಿನದಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Harvest with combine harvester when grains have less than 12% moisture.",
            "bodyKn": "ಕಾಳುಗಳಲ್ಲಿ 12% ಕ್ಕಿಂತ ಕಡಿಮೆ ತೇವಾಂಶವಿದ್ದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಸಂಗ್ರಹಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "ginger",
    "nameEn": "Ginger",
    "nameKn": "ಶುಂಠಿ (Ginger)",
    "scientificName": "Zingiber officinale",
    "category": "Commercial & Cash Crops",
    "categoryKn": "ವಾಣಿಜ್ಯ ಮತ್ತು ನಗದು ಬೆಳೆಗಳು",
    "totalDays": 240,
    "isPerennial": false,
    "popularVarieties": [
      "Rio de Janeiro",
      "Varada",
      "Maran",
      "Nadia",
      "Himachal"
    ],
    "seasons": [
      "Kharif"
    ],
    "soilType": "Deep sandy loam or clay loam rich in humus with excellent drainage",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಮರಳು ಗೋಡು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು, ನೀರು ಬಸಿಯುವ ವ್ಯವಸ್ಥೆ",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "SPROUTING_EMERGENCE",
        "nameEn": "Sprouting & Plantlet Emergence",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಎಳೆ ಗಿಡ ಹಂತ",
        "startDay": 0,
        "endDay": 45,
        "descriptionEn": "Rhizome bits sprout slowly under green leaf mulch.",
        "descriptionKn": "ಹಸಿರೆಲೆ ಹೊದಿಕೆಯಡಿ (Mulching) ಶುಂಠಿ ಬೆರಳುಗಳಿಂದ ಮೊಳಕೆ ಹೊರಬರುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Green Leaf Mulching is Crucial",
            "titleKn": "ಹಸಿರೆಲೆ ಹೊದಿಕೆ (Mulch) ಅತ್ಯಗತ್ಯ",
            "bodyEn": "Apply green leaf mulch (10-12 tons/acre) immediately after planting to protect rhizomes from heavy rain and sun.",
            "bodyKn": "ನಾಟಿ ಮಾಡಿದ ತಕ್ಷಣ ಎಕರೆಗೆ 10-12 ಟನ್ ಹಸಿರೆಲೆ ಹೊದಿಕೆ ಹಾಕಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_VEGETATIVE",
        "nameEn": "Tillering & Foliage Spurt",
        "nameKn": "ಕವಲೊಡೆಯುವುದು ಮತ್ತು ಬೆಳವಣಿಗೆ",
        "startDay": 46,
        "endDay": 120,
        "descriptionEn": "Plant produces multiple pseudostems and dense dark green leaves.",
        "descriptionKn": "ಗಿಡವು ಅನೇಕ ಕವಲುಗಳನ್ನು ಬಿಟ್ಟು ದಟ್ಟವಾಗಿ ಬೆಳೆಯುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Soft Rot / Rhizome Rot Drenching",
            "titleKn": "ಶುಂಠಿ ಕೊಳೆ ರೋಗ (Soft Rot) ನಿಯಂತ್ರಣ",
            "bodyEn": "If pseudostems rot and pull out easily with foul smell, drench with Metalaxyl-Mancozeb (2.5g/L) or Copper Oxychloride (3g/L).",
            "bodyKn": "ಬುಡ ಕೊಳೆತು ವಾಸನೆ ಬಂದರೆ ತಕ್ಷಣ ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಅಥವಾ ಮೆಟಲಾಕ್ಸಿಲ್ ದ್ರಾವಣವನ್ನು ಬುಡಕ್ಕೆ ಸುರಿಯಿರಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "FERTILIZER",
            "titleEn": "Second Mulching & NPK Top-Dressing",
            "titleKn": "ಎರಡನೇ ಹೊದಿಕೆ ಮತ್ತು ರಸಗೊಬ್ಬರ",
            "bodyEn": "Apply 30 kg Urea + 25 kg Potash/acre and apply second fresh leaf mulch at day 60.",
            "bodyKn": "60ನೇ ದಿನ ಯೂರಿಯಾ + ಪೊಟ್ಯಾಷ್ ನೀಡಿ ಎರಡನೇ ಬಾರಿ ಹಸಿರೆಲೆ ಹೊದಿಕೆ ಹಾಕಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "RHIZOME_ENLARGEMENT",
        "nameEn": "Rhizome Enlargement & Bulking",
        "nameKn": "ಶುಂಠಿ ಗಡ್ಡೆ ಬೆಳೆಯುವುದು ಮತ್ತು ದಪ್ಪವಾಗುವುದು",
        "startDay": 121,
        "endDay": 190,
        "descriptionEn": "Underground rhizomes branch into plump fragrant fingers.",
        "descriptionKn": "ಮಣ್ಣಿನೊಳಗೆ ಶುಂಠಿ ಬೆರಳುಗಳು ದಪ್ಪವಾಗಿ ಆಹಾರ ಸಂಗ್ರಹಿಸುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Earthing Up & Potassium Booster",
            "titleKn": "ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸುವುದು ಮತ್ತು ಪೊಟ್ಯಾಷ್",
            "bodyEn": "Apply 0:0:50 (5 kg/acre) through fertigation and cover exposed rhizomes with soil.",
            "bodyKn": "ಶುಂಠಿ ಮೇಲೆ ಕಾಣಿಸದಂತೆ ಮಣ್ಣು ಏರಿಸಿ 0:0:50 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Rhizome Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 191,
        "endDay": 240,
        "descriptionEn": "Leaves turn yellow and pseudostems dry completely.",
        "descriptionKn": "ಎಲೆಗಳು ಮತ್ತು ಕಾಂಡ ಒಣಗಿ ಗಡ್ಡೆ ಪೂರ್ಣ ಬಲಿಯುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Dig Plump Rhizomes Carefully",
            "titleKn": "ಗಾಯವಾಗದಂತೆ ಶುಂಠಿ ಅಗೆಯಿರಿ",
            "bodyEn": "Dig carefully with forks to avoid cutting rhizomes. Wash clean and dry in shade for fresh/dry ginger.",
            "bodyKn": "ಗಡ್ಡೆಗೆ ಗಾಯವಾಗದಂತೆ ಅಗೆದು ತೆಗೆದು ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "turmeric",
    "nameEn": "Turmeric",
    "nameKn": "ಅರಿಶಿನ (Turmeric)",
    "scientificName": "Curcuma longa",
    "category": "Commercial & Cash Crops",
    "categoryKn": "ವಾಣಿಜ್ಯ ಮತ್ತು ನಗದು ಬೆಳೆಗಳು",
    "totalDays": 270,
    "isPerennial": false,
    "popularVarieties": [
      "Prathibha",
      "IISR Prabha",
      "Salem",
      "Erode Local",
      "BSR 2"
    ],
    "seasons": [
      "Kharif"
    ],
    "soilType": "Deep well-drained loamy or alluvial soil rich in organic matter",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕೆಂಪು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "SPROUTING_EARLY_VEGETATIVE",
        "nameEn": "Sprouting & Early Emergence",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಚಿಗುರು ಹಂತ",
        "startDay": 0,
        "endDay": 50,
        "descriptionEn": "Mothers and fingers sprout beneath thick organic mulch.",
        "descriptionKn": "ಹಸಿರೆಲೆ ಹೊದಿಕೆಯಡಿ ತಾಯಿ ಗಡ್ಡೆ ಮತ್ತು ಬೆರಳುಗಳಿಂದ ಮೊಳಕೆ ಹೊರಬರುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Apply Green Mulch (12 T/acre)",
            "titleKn": "ಹಸಿರೆಲೆ ಹೊದಿಕೆ ಹಾಕಿ",
            "bodyEn": "Spread tree leaves or straw to conserve soil moisture and suppress weed emergence.",
            "bodyKn": "ಕಳೆ ಬರದಂತೆ ಮತ್ತು ತೇವಾಂಶ ಉಳಿಸಲು ಹಸಿರೆಲೆ ಹೊದಿಕೆ ಹಾಕಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "TILLERING_LEAF_CANOPY",
        "nameEn": "Tillering & Canopy Building",
        "nameKn": "ಕವಲೊಡೆಯುವುದು ಮತ್ತು ಎಲೆ ವಿಸ್ತರಣೆ",
        "startDay": 51,
        "endDay": 130,
        "descriptionEn": "Lush wide tropical leaves develop to maximize photosynthesis.",
        "descriptionKn": "ಅಗಲವಾದ ಹಸಿರು ಎಲೆಗಳು ಬೆಳೆದು ಸೂರ್ಯನ ಬೆಳಕನ್ನು ಹೀರಿಕೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Split Nitrogen & Micronutrient Spray",
            "titleKn": "ಯೂರಿಯಾ & ಲಘು ಪೋಷಕಾಂಶ ಸಿಂಪಡಣೆ",
            "bodyEn": "Apply 40 kg Urea + 30 kg Potash per acre along with zinc sulphate.",
            "bodyKn": "ಎಕರೆಗೆ 40 ಕೆಜಿ ಯೂರಿಯಾ + 30 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ನೀಡಿ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Rhizome Scale & Leaf Blotch Watch",
            "titleKn": "ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಕೊಳೆ ರೋಗ",
            "bodyEn": "Spray Mancozeb (2.5 g/L) or Carbendazim (1 g/L) if brown leaf blotches appear.",
            "bodyKn": "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಚುಕ್ಕೆ ಕಂಡರೆ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "RHIZOME_BULKING",
        "nameEn": "Rhizome Bulking & Curcumin Accumulation",
        "nameKn": "ಗಡ್ಡೆ ದಪ್ಪವಾಗುವುದು ಮತ್ತು ಕರ್ಕ್ಯುಮಿನ್ ಅಂಶ",
        "startDay": 131,
        "endDay": 210,
        "descriptionEn": "Underground mother and secondary fingers expand with deep orange pigment.",
        "descriptionKn": "ಮಣ್ಣಿನೊಳಗೆ ಗಡ್ಡೆಗಳು ದಪ್ಪವಾಗಿ ಗಾಢ ಕಿತ್ತಳೆ-ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Heavy Potash Fertigation",
            "titleKn": "ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ",
            "bodyEn": "Apply Potassium Sulphate (0:0:50) to enhance rhizome weight and curcumin content.",
            "bodyKn": "ಗಡ್ಡೆಯ ತೂಕ ಮತ್ತು ಅರಿಶಿನದ ಗುಣಮಟ್ಟಕ್ಕೆ 0:0:50 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Maturity & Harvesting",
        "nameKn": "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 211,
        "endDay": 270,
        "descriptionEn": "Leaves turn yellow, dry completely, and lodge. Ready to dig.",
        "descriptionKn": "ಎಲೆಗಳು ಪೂರ್ಣ ಒಣಗಿ ಮಣ್ಣಿಗೆ ಬಾಗಿ ಗಡ್ಡೆಗಳು ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವುದು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest Dry Clumps for Boiling & Curing",
            "titleKn": "ಗಡ್ಡೆಗಳನ್ನು ಅಗೆದು ಬೇಯಿಸಿ ಸಂಸ್ಕರಿಸಿ",
            "bodyEn": "Plough or dig clumps, separate fingers from mother rhizomes, and cure within 2-3 days.",
            "bodyKn": "ಗಡ್ಡೆಗಳನ್ನು ಅಗೆದು ಬೇರ್ಪಡಿಸಿ 2-3 ದಿನಗಳಲ್ಲಿ ಬೇಯಿಸಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "banana",
    "nameEn": "Banana",
    "nameKn": "ಬಾಳೆ (Banana)",
    "scientificName": "Musa acuminata",
    "category": "Plantation & Fruits",
    "categoryKn": "ತೋಟಗಾರಿಕೆ ಮತ್ತು ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
    "totalDays": 330,
    "isPerennial": true,
    "popularVarieties": [
      "Grand Naine (G9)",
      "Yelakki (Nanjangud Rasabale)",
      "Robusta",
      "Nendran",
      "Red Banana"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Deep rich well-drained loam or alluvial soil with pH 6.5-7.5",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಆಳವಾದ ಗೋಡು ಅಥವಾ ಕೆಂಪು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "SUCKER_ESTABLISHMENT",
        "nameEn": "Planting & Sucker Establishment",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಸಸಿ ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 60,
        "descriptionEn": "Tissue culture plantlets or sword suckers produce new healthy leaves.",
        "descriptionKn": "ಅಂಗಾಂಶ ಕೃಷಿ ಬಾಳೆ ಸಸಿಗಳು ಬೇರೂರಿ ಹೊಸ ಎಲೆಗಳನ್ನು ಬಿಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Regular Drip Irrigation Daily",
            "titleKn": "ದಿನವೂ ನಿಯಮಿತ ಹನಿ ನೀರಾವರಿ",
            "bodyEn": "Provide 15-20 liters water/plant/day through drip. Banana loves moist soil without standing water.",
            "bodyKn": "ದಿನಕ್ಕೆ ಒಂದು ಗಿಡಕ್ಕೆ 15-20 ಲೀಟರ್ ಹನಿ ನೀರಾವರಿ ಒದಗಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "GRAND_VEGETATIVE_GROWTH",
        "nameEn": "Grand Vegetative Growth",
        "nameKn": "ದೊಡ್ಡ ಎಲೆಗಳ ವೇಗದ ಬೆಳವಣಿಗೆ",
        "startDay": 61,
        "endDay": 180,
        "descriptionEn": "Pseudostem broadens and plant emits a large broad leaf every 7-10 days.",
        "descriptionKn": "ಕಾಂಡವು ದಪ್ಪವಾಗಿ ವಾರಕ್ಕೊಂದು ಹೊಸ ಅಗಲವಾದ ಎಲೆ ಹೊರಬರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "High Nitrogen & Potash Dosing",
            "titleKn": "ಯೂರಿಯಾ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ",
            "bodyEn": "Apply 50g Urea + 50g Potash per plant monthly. Desucker unwanted side suckers.",
            "bodyKn": "ತಿಂಗಳಿಗೆ ಪ್ರತಿ ಗಿಡಕ್ಕೆ 50 ಗ್ರಾಂ ಯೂರಿಯಾ + 50 ಗ್ರಾಂ ಪೊಟ್ಯಾಷ್ ನೀಡಿ ಪಕ್ಕದ ಸಸಿಗಳನ್ನು ಕತ್ತರಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Sigatoka Leaf Spot Protection",
            "titleKn": "ಸಿಗಟೋಕ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ ನಿಯಂತ್ರಣ",
            "bodyEn": "If narrow brown spots appear on leaves, spray Propiconazole (1ml/L) + mineral oil.",
            "bodyKn": "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಚುಕ್ಕೆ ಕಂಡರೆ ಪ್ರೊಪಿಕೊನಾಜೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "INFLORESCENCE_SHOOTING",
        "nameEn": "Inflorescence & Bunch Shooting",
        "nameKn": "ಬಾಳೆ ಹೂವು ಮತ್ತು ಗೊನೆ ಹೊರಬರುವ ಹಂತ",
        "startDay": 181,
        "endDay": 240,
        "descriptionEn": "Heart-shaped flower bud shoots out and opens into multiple hands of bananas.",
        "descriptionKn": "ಬಾಳೆ ಹೂವು ಹೊರಬಂದು ಬಾಳೆಕಾಯಿಗಳ ಗೊನೆ ರೂಪುಗೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Remove Male Bud (Denavelling) & Spray SOP",
            "titleKn": "ಕೊನೆಯ ಹೂವು ಕತ್ತರಿಸಿ & 0:0:50 ಸಿಂಪಡಿಸಿ",
            "bodyEn": "Remove male flower bud after all hands open to speed up finger filling. Spray 0:0:50 (5g/L).",
            "bodyKn": "ಎಲ್ಲಾ ಸೀಪುಗಳು ಬಿಟ್ಟ ನಂತರ ಕೊನೆಯ ಹೂವನ್ನು ಕತ್ತರಿಸಿ; ಕಾಯಿ ದಪ್ಪವಾಗಲು 0:0:50 ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BUNCH_DEVELOPMENT_HARVEST",
        "nameEn": "Bunch Development & Harvest",
        "nameKn": "ಗೊನೆ ಬಲಿಯುವುದು ಮತ್ತು ಕಟಾವು",
        "startDay": 241,
        "endDay": 330,
        "descriptionEn": "Bananas fill out plump and ridges disappear. Prop trees to avoid lodging.",
        "descriptionKn": "ಕಾಯಿಗಳು ದಪ್ಪವಾಗಿ ಮೂಲೆಗಳು ದುಂಡಾಗುವುದು; ಗಿಡ ಮುರಿಯದಂತೆ ಬಿದಿರಿನ ಆಸರೆ ನೀಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Prop Trees with Bamboo & Cover Bunches",
            "titleKn": "ಬಿದಿರಿನ ಆಸರೆ ನೀಡಿ & ಗೊನೆಗೆ ಚೀಲ ತೊಡಿಸಿ",
            "bodyEn": "Support heavy bunch with bamboo poles. Cover bunch with blue perforated poly sleeve.",
            "bodyKn": "ಗಾಳಿಗೆ ಗಿಡ ಬೀಳದಂತೆ ಆಸರೆ ನೀಡಿ, ಕಾಯಿ ಹೊಳಪಿಗೆ ನೀಲಿ ಚೀಲ ತೊಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "arecanut",
    "nameEn": "Arecanut (Betelnut)",
    "nameKn": "ಅಡಿಕೆ (Arecanut)",
    "scientificName": "Areca catechu",
    "category": "Plantation & Fruits",
    "categoryKn": "ತೋಟಗಾರಿಕೆ ಮತ್ತು ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
    "totalDays": 365,
    "isPerennial": true,
    "popularVarieties": [
      "Mangala",
      "Sumangala",
      "Sreemangala",
      "Mohitnagar",
      "Thirthahalli Local"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Deep well-drained gravelly laterite or red loam soil with pH 5.5-6.5",
    "soilTypeKn": "ಆಳವಾದ ಜೇಡಿ ಕೆಂಪು ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "PRE_MONSOON_SPURT",
        "nameEn": "Pre-Monsoon Crown & Basin Work",
        "nameKn": "ಮುಂಗಾರು ಪೂರ್ವ ನಿರ್ವಹಣೆ ಮತ್ತು ಗೊಬ್ಬರ",
        "startDay": 0,
        "endDay": 90,
        "descriptionEn": "Summer crown irrigation and organic manuring in root basin.",
        "descriptionKn": "ಬೇಸಿಗೆಯ ನೀರಿನ ನಿರ್ವಹಣೆ ಮತ್ತು ಬುಡದ ಪಾತಿಯಲ್ಲಿ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ನೀಡುವಿಕೆ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Summer Drip/Sprinkler Irrigation",
            "titleKn": "ಬೇಸಿಗೆಯಲ್ಲಿ ನಿಯಮಿತ ನೀರಾವರಿ",
            "bodyEn": "Provide 20-25 liters/palm/day in hot summer months. Sun scorching damages crown.",
            "bodyKn": "ಬೇಸಿಗೆಯಲ್ಲಿ ಪ್ರತಿ ಮರಕ್ಕೆ ದಿನಕ್ಕೆ 20-25 ಲೀಟರ್ ನೀರು ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MONSOON_KOLEROGA_PREVENTION",
        "nameEn": "Monsoon & Koleroga (Fruit Rot) Spray",
        "nameKn": "ಮುಂಗಾರು ಮಳೆ ಮತ್ತು ಕೊಳೆ ರೋಗ (Koleroga) ತಡೆ",
        "startDay": 91,
        "endDay": 180,
        "descriptionEn": "Heavy rains trigger Phytophthora nut rot (Koleroga) and button shedding.",
        "descriptionKn": "ವಿಪರೀತ ಮಳೆಗೆ ಅಡಿಕೆ ಹಿಂಗಾರ ಮತ್ತು ಕಾಯಿಗಳಿಗೆ ಕೊಳೆ ರೋಗ ಬರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "1% Bordeaux Mixture Spray on Bunches",
            "titleKn": "ಗೊನೆಗಳಿಗೆ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray 1% Bordeaux mixture on all bunches before heavy monsoon begins and repeat 40 days later.",
            "bodyKn": "ಕೊಳೆ ರೋಗ ತಡೆಯಲು ಮಳೆ ಆರಂಭಕ್ಕೂ ಮುನ್ನವೇ ಗೊನೆಗಳಿಗೆ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "POST_MONSOON_NUT_FILLING",
        "nameEn": "Post-Monsoon Nut Development",
        "nameKn": "ಮಳೆಯ ನಂತರದ ಕಾಯಿ ಬೆಳವಣಿಗೆ",
        "startDay": 181,
        "endDay": 270,
        "descriptionEn": "Nut expands and develops solid endosperm inside green husk.",
        "descriptionKn": "ಕಾಯಿಗಳು ದಪ್ಪವಾಗಿ ಒಳಗೆ ಅಡಿಕೆ ಬಲಿಯುವ ಪ್ರಮುಖ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Second Dose of NPK + Magnesium",
            "titleKn": "ಎರಡನೇ ಕಂತಿನ ರಸಗೊಬ್ಬರ ಮತ್ತು ಮೆಗ್ನೀಸಿಯಂ",
            "bodyEn": "Apply 100g Urea + 200g Rock Phosphate + 150g Potash per palm into basin.",
            "bodyKn": "ಪ್ರತಿ ಮರಕ್ಕೆ 100 ಗ್ರಾಂ ಯೂರಿಯಾ + 200 ಗ್ರಾಂ ರಂಜಕ + 150 ಗ್ರಾಂ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "HARVEST_AND_PROCESSING",
        "nameEn": "Harvesting & Curing (Chali / Rashi)",
        "nameKn": "ಅಡಿಕೆ ಕೊಯ್ಲು ಮತ್ತು ಸಂಸ್ಕರಣೆ",
        "startDay": 271,
        "endDay": 365,
        "descriptionEn": "Pluck tender nuts for boiled Chali/Bette or let ripen to deep orange for whole dry nut.",
        "descriptionKn": "ಕೆಂಪಡಿಕೆಗೆ ಎಳೆ ಕಾಯಿ ಕೊಯ್ಲು ಅಥವಾ ಚಾಲಿ ಅಡಿಕೆಗೆ ಮಾಗಿದ ಹಣ್ಣಡಿಕೆ ಕೊಯ್ಲು.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Dry Ripe Nuts Under Sun for 40 Days",
            "titleKn": "ಹಣ್ಣಡಿಕೆಯನ್ನು 40 ದಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ",
            "bodyEn": "Harvest deep orange ripe nuts and spread on drying yard under full sun to make white Chali.",
            "bodyKn": "ಚಾಲಿ ಅಡಿಕೆಗೆ ಹಣ್ಣಾದ ಅಡಿಕೆಯನ್ನು ಚೆನ್ನಾಗಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "coconut",
    "nameEn": "Coconut",
    "nameKn": "ತೆಂಗು (Coconut)",
    "scientificName": "Cocos nucifera",
    "category": "Plantation & Fruits",
    "categoryKn": "ತೋಟಗಾರಿಕೆ ಮತ್ತು ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
    "totalDays": 365,
    "isPerennial": true,
    "popularVarieties": [
      "Tiptur Tall",
      "Arasampatti Tall",
      "Chowghat Orange Dwarf",
      "D × T Hybrid",
      "Kera Sankara"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Deep sandy loam, alluvial or red loam with good water table",
    "soilTypeKn": "ಆಳವಾದ ಮರಳು ಗೋಡು ಅಥವಾ ಕೆಂಪು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "SUMMER_CROWN_MANAGEMENT",
        "nameEn": "Summer Crown & Basin Watering",
        "nameKn": "ಬೇಸಿಗೆಯ ನೀರಿನ ನಿರ್ವಹಣೆ",
        "startDay": 0,
        "endDay": 90,
        "descriptionEn": "Water stress in summer leads to button shedding 8-10 months later.",
        "descriptionKn": "ಬೇಸಿಗೆಯಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯಾದರೆ ಮುಂದಿನ ವರ್ಷ ಕಾಯಿ ಕಚ್ಚುವುದು ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Provide 40-50 Liters Water/Palm/Day",
            "titleKn": "ದಿನಕ್ಕೆ 40-50 ಲೀಟರ್ ನೀರು ನೀಡಿ",
            "bodyEn": "Irrigate through drip or basin. Mulch tree base with coconut coir pith or dried fronds.",
            "bodyKn": "ಬುಡಕ್ಕೆ ತೆಂಗಿನ ನಾರಿನ ತ್ಯಾಜ್ಯ ಅಥವಾ ಒಣಗಿದ ಗರಿಗಳಿಂದ ಹೊದಿಕೆ ಹಾಕಿ ನೀರು ಉಳಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MONSOON_MANURING",
        "nameEn": "Monsoon Basin Manuring",
        "nameKn": "ಮುಂಗಾರಿನ ಸಾವಯವ ಮತ್ತು ರಸಗೊಬ್ಬರ",
        "startDay": 91,
        "endDay": 180,
        "descriptionEn": "Open basin around 2-meter radius from trunk and apply balanced fertilizers.",
        "descriptionKn": "ಕಾಂಡದಿಂದ 2 ಮೀಟರ್ ದೂರದಲ್ಲಿ ಪಾತಿ ತೆಗೆದು ಗೊಬ್ಬರ ನೀಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Apply 50 kg Compost + 1.3 kg Urea + 2 kg Potash",
            "titleKn": "50 ಕೆಜಿ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ + ಯೂರಿಯಾ + ಪೊಟ್ಯಾಷ್",
            "bodyEn": "Apply into circular trench along with 1 kg common salt (NaCl) and 1 kg Borax.",
            "bodyKn": "ಪ್ರತಿ ಮರಕ್ಕೆ 50 ಕೆಜಿ ಕಳಿತ ಗೊಬ್ಬರ + 1.3 ಕೆಜಿ ಯೂರಿಯಾ + 2 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ಜೊತೆಗೆ 1 ಕೆಜಿ ಉಪ್ಪು ನೀಡಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Rhinoceros Beetle & Red Palm Weevil Hooking",
            "titleKn": "ಕಪ್ಪು ಮೂತಿ & ಕೆಂಪು ಮೂತಿ ಜೀರುಂಡೆ ನಿಯಂತ್ರಣ",
            "bodyEn": "Fill top leaf axils with sand + Neem seed powder (1:1) to stop rhinoceros beetle tunneling.",
            "bodyKn": "ಮರದ ತುದಿಗೆ ಮರಳು ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ಮಿಶ್ರಣವನ್ನು ಹಾಕಿ ಜೀರುಂಡೆ ತಡೆಯಿರಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BUTTON_SETTING",
        "nameEn": "Inflorescence Spurt & Button Setting",
        "nameKn": "ಹಿಂಗಾರ ಮೂಡುವುದು ಮತ್ತು ಕಾಯಿ ಕಚ್ಚುವುದು",
        "startDay": 181,
        "endDay": 270,
        "descriptionEn": "Spathe opens releasing female flowers (buttons).",
        "descriptionKn": "ಹಿಂಗಾರ ಅರಳಿ ಸಣ್ಣ ತೆಂಗಿನ ಕಾಯಿಗಳು (ಗುಂಡುಗಳು) ಕಟ್ಟುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Boron Spray Against Nut Cracking",
            "titleKn": "ಕಾಯಿ ಸೀಳುವುದು ತಪ್ಪಿಸಲು ಬೋರಾನ್",
            "bodyEn": "Apply 50g Borax per palm to stop immature button shedding and nut cracking.",
            "bodyKn": "ಸಣ್ಣ ಕಾಯಿ ಉದುರುವುದು ನಿಲ್ಲಲು ಪ್ರತಿ ಮರಕ್ಕೆ 50 ಗ್ರಾಂ ಬೋರಾಕ್ಸ್ ನೀಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "NUT_MATURATION_HARVEST",
        "nameEn": "Nut Maturation & Monthly Plucking",
        "nameKn": "ತೆಂಗಿನಕಾಯಿ ಬಲಿಯುವುದು ಮತ್ತು ಮಾಸಿಕ ಕೊಯ್ಲು",
        "startDay": 271,
        "endDay": 365,
        "descriptionEn": "Nuts take 11-12 months from flower opening to full mature copra.",
        "descriptionKn": "ಹೂವು ಅರಳಿದ 11-12 ತಿಂಗಳಿಗೆ ತೆಂಗಿನಕಾಯಿ ಪೂರ್ಣ ಬಲಿತು ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುತ್ತದೆ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Regular 45-Day Harvesting Cycle",
            "titleKn": "ಪ್ರತಿ 45 ದಿನಕ್ಕೊಮ್ಮೆ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Harvest brown mature nuts regularly every 45-60 days to stimulate continuous bunch development.",
            "bodyKn": "ಹೊಸ ಗೊನೆಗಳು ಬಿಡಲು ಪ್ರತಿ 45 ದಿನಕ್ಕೊಮ್ಮೆ ಬಲಿತ ಕಾಯಿಗಳನ್ನು ಕಟಾವು ಮಾಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "coffee",
    "nameEn": "Coffee",
    "nameKn": "ಕಾಫಿ (Coffee)",
    "scientificName": "Coffea arabica / canephora",
    "category": "Plantation & Fruits",
    "categoryKn": "ತೋಟಗಾರಿಕೆ ಮತ್ತು ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
    "totalDays": 365,
    "isPerennial": true,
    "popularVarieties": [
      "Arabica Selection 795",
      "Cauvery",
      "Chandragiri",
      "Robusta S.274",
      "CxR Hybrid"
    ],
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "soilType": "Deep rich volcanic/laterite forest loam with thick humus layer",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಅರಣ್ಯದ ಕೆಂಪು ಜೇಡಿ ಮಣ್ಣು, ಹ್ಯೂಮಸ್ ಭರಿತ",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "BLOSSOM_SHOWERS",
        "nameEn": "Blossom Showers & Fruit Set",
        "nameKn": "ಹೂಮಳೆ ಮತ್ತು ಕಾಯಿ ಕಚ್ಚುವ ಹಂತ",
        "startDay": 0,
        "endDay": 90,
        "descriptionEn": "Summer showers induce white aromatic blossoms covering estates in snow-white flowers.",
        "descriptionKn": "ಬೇಸಿಗೆಯ ಹೂಮಳೆಯ ನಂತರ ಬಿಳಿ ಹೂಗಳು ಅರಳಿ ಕಾಳು ಕಚ್ಚುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Blossom & Backing Irrigation",
            "titleKn": "ಹೂಮಳೆ ಮತ್ತು ಬ್ಯಾಕಿಂಗ್ ನೀರಾವರಿ",
            "bodyEn": "Provide 25mm sprinkler irrigation if summer rains fail in March-April, followed by backing shower 20 days later.",
            "bodyKn": "ಮಾರ್ಚ್-ಏಪ್ರಿಲ್‌ನಲ್ಲಿ ಮಳೆ ಬಾರದಿದ್ದರೆ ಸ್ಪ್ರಿಂಕ್ಲರ್ ಮೂಲಕ ನೀರು ಹಾಯಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MONSOON_SHADE_NUTRIENTS",
        "nameEn": "Monsoon Shade & Berry Development",
        "nameKn": "ಮುಂಗಾರಿನ ನೆರಳು ನಿರ್ವಹಣೆ & ಗೊಬ್ಬರ",
        "startDay": 91,
        "endDay": 180,
        "descriptionEn": "Shade tree regulation and protection against wet black rot.",
        "descriptionKn": "ಹೆಚ್ಚು ಮಳೆಯಿಂದ ಬರುವ ಕಪ್ಪು ಕೊಳೆ ರೋಗ ತಡೆಯುವುದು ಮತ್ತು ನೆರಳು ಕತ್ತರಿಸುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Pre-Monsoon 0.5% Bordeaux Mixture Spray",
            "titleKn": "0.5% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray 0.5% Bordeaux mixture against Leaf Rust (Hemileia vastatrix) and Black Rot before southwest monsoon.",
            "bodyKn": "ಎಲೆ ತುಕ್ಕು ರೋಗ ತಡೆಯಲು ಮಳೆಗೆ ಮುನ್ನ 0.5% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BERRY_BULKING",
        "nameEn": "Berry Expansion & Post-Monsoon Manuring",
        "nameKn": "ಕಾಫಿ ಕಾಳು ದಪ್ಪವಾಗುವುದು ಮತ್ತು ಗೊಬ್ಬರ",
        "startDay": 181,
        "endDay": 270,
        "descriptionEn": "Berries enlarge and beans fill with caffeine and aromatic solids.",
        "descriptionKn": "ಕಾಫಿ ಕಾಳುಗಳು ದಪ್ಪವಾಗಿ ಒಳಗೆ ಬೀಜ ಗಟ್ಟಿಯಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Post-Monsoon NPK Manuring",
            "titleKn": "ಮಳೆಯ ನಂತರದ ರಸಗೊಬ್ಬರ",
            "bodyEn": "Apply 40 kg Nitrogen + 30 kg Phosphorus + 40 kg Potash per acre into drip circle.",
            "bodyKn": "ಗಿಡದ ಸುತ್ತಲೂ ಸಮತೋಲಿತ ಎನ್‌ಪಿಕೆ ಗೊಬ್ಬರವನ್ನು ನೀಡಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Coffee Berry Borer & White Stem Borer Watch",
            "titleKn": "ಕಾಳು ಕೊರೆಯುವ ಮತ್ತು ಬಿಳಿ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು",
            "bodyEn": "Install Brocap pheromone traps for berry borer. Swab main stems with lime to stop stem borer.",
            "bodyKn": "ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ತಡೆಯಲು ಕಾಂಡಕ್ಕೆ ಸುಣ್ಣ ಬಳಿಯಿರಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "BERRY_RIPENING_PICKING",
        "nameEn": "Ripening & Hand Picking",
        "nameKn": "ಕಾಫಿ ಹಣ್ಣಾಗುವುದು ಮತ್ತು ಕಟಾವು",
        "startDay": 271,
        "endDay": 365,
        "descriptionEn": "Berries turn crimson red. Selective hand picking for parchment coffee.",
        "descriptionKn": "ಕಾಫಿ ಹಣ್ಣುಗಳು ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಆಯ್ದು ಕಟಾವು ಮಾಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Pick Only Bright Red Cherries",
            "titleKn": "ಕೇವಲ ಮಾಗಿದ ಕೆಂಪು ಹಣ್ಣುಗಳನ್ನೇ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Hand-pick only bright red ripe cherries for pulping to produce premium washed Arabica Plantation A coffee.",
            "bodyKn": "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಕಾಫಿಗಾಗಿ ಕೇವಲ ಚೆನ್ನಾಗಿ ಮಾಗಿದ ಕೆಂಪು ಹಣ್ಣುಗಳನ್ನೇ ಬಿಡಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "pomegranate",
    "nameEn": "Pomegranate",
    "nameKn": "ದಾಳಿಂಬೆ (Pomegranate)",
    "scientificName": "Punica granatum",
    "category": "Plantation & Fruits",
    "categoryKn": "ತೋಟಗಾರಿಕೆ ಮತ್ತು ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
    "totalDays": 180,
    "isPerennial": true,
    "popularVarieties": [
      "Bhagwa (Kesar)",
      "Arakta",
      "Ganesh",
      "Ruby",
      "Mridula"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Deep sandy loam or alluvial soil with pH 6.5-7.5, excellent drainage",
    "soilTypeKn": "ಚೆನ್ನಾಗಿ ನೀರು ಬಸಿಯುವ ಮರಳು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "BAHAR_REST_FLOWERING",
        "nameEn": "Bahar Treatment & Flowering",
        "nameKn": "ಬಹಾರ್ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಹೂವಾಡುವ ಹಂತ",
        "startDay": 0,
        "endDay": 40,
        "descriptionEn": "Water stress followed by heavy watering and pruning triggers massive flowering.",
        "descriptionKn": "ನೀರನ್ನು ನಿಲ್ಲಿಸಿ ನಂತರ ನೀರು ಕೊಟ್ಟು ಕತ್ತರಿಸುವುದರಿಂದ ಹೂಗಳು ಬಿಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Pruning & Basal Fertigation",
            "titleKn": "ಕೊಂಬೆ ಕತ್ತರಿಸುವುದು ಮತ್ತು ಗೊಬ್ಬರ",
            "bodyEn": "Prune criss-cross twigs. Apply 20 kg FYM + 250g 12:61:0 (Mono Ammonium Phosphate) per plant.",
            "bodyKn": "ಒಣ ಕೊಂಬೆ ಕತ್ತರಿಸಿ ಗಿಡಕ್ಕೆ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮತ್ತು 12:61:0 ರಸಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FRUIT_SET_THINNING",
        "nameEn": "Fruit Set & Thinning",
        "nameKn": "ಕಾಯಿ ಕಚ್ಚುವುದು ಮತ್ತು ಹೆಚ್ಚುವರಿ ಕಾಯಿ ತೆಗೆಯುವುದು",
        "startDay": 41,
        "endDay": 80,
        "descriptionEn": "Hermaphrodite blossoms set into small shiny round fruits.",
        "descriptionKn": "ಹೂಗಳು ಕಾಯಿ ಕಟ್ಟಿ ಸಣ್ಣ ಹಸಿರು ದಾಳಿಂಬೆಯಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Bacterial Blight (Telya) Strict Prevention",
            "titleKn": "ತೆಲ್ಯ (Bacterial Blight) ರೋಗ ತಡೆ",
            "bodyEn": "Spray Streptocycline (0.5g/L) + Copper Oxychloride (2.5g/L) immediately if oily black spots appear.",
            "bodyKn": "ಕಾಯಿ ಮತ್ತು ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಎಣ್ಣೆಯಂತಹ ಕಲೆ ಕಂಡರೆ ಸ್ಟ್ರೆಪ್ಟೋಸೈಕ್ಲಿನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FRUIT_ENLARGEMENT_BAGGING",
        "nameEn": "Fruit Enlargement & Paper Bagging",
        "nameKn": "ಹಣ್ಣು ಬೆಳೆಯುವುದು ಮತ್ತು ಪೇಪರ್ ಬ್ಯಾಗಿಂಗ್",
        "startDay": 81,
        "endDay": 135,
        "descriptionEn": "Arils expand with deep ruby juice. Fruits need protection from borers and sunburn.",
        "descriptionKn": "ಕಾಯಿಯೊಳಗೆ ರಸಭರಿತ ಬೀಜಗಳು ಬೆಳೆಯುವುದು; ಹಣ್ಣಿನ ನೊಣ ತಡೆಯಲು ಚೀಲ ತೊಡಿಸುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Bag Fruits with Butter Paper Cover",
            "titleKn": "ಕಾಯಿಗಳಿಗೆ ಬಟರ್ ಪೇಪರ್ ಕವರ್ ತೊಡಿಸಿ",
            "bodyEn": "Bag developing fruits when lemon-sized to completely prevent fruit borer (Deudorix isocrates) and fungal spots.",
            "bodyKn": "ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ಬರದಂತೆ ನಿಂಬೆಹಣ್ಣಿನ ಗಾತ್ರದಲ್ಲಿದ್ದಾಗಲೇ ಪೇಪರ್ ಚೀಲ ತೊಡಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "FERTILIZER",
            "titleEn": "Calcium & Boron for Crack Prevention",
            "titleKn": "ಕಾಯಿ ಬಿರುಕು ಬಿಡುವುದನ್ನು ತಡೆಯಲು ಬೋರಾನ್",
            "bodyEn": "Spray Calcium Nitrate (3g/L) + Boron (1.5g/L) fortnightly to stop rind splitting.",
            "bodyKn": "ದಾಳಿಂಬೆ ಕಾಯಿ ಒಡೆಯದಂತೆ ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "COLORING_HARVEST",
        "nameEn": "Coloration & Harvesting",
        "nameKn": "ಬಣ್ಣ ಬರುವುದು ಮತ್ತು ಕಟಾವು",
        "startDay": 136,
        "endDay": 180,
        "descriptionEn": "Rind turns rich saffron-red and base metallic ring rings clear when tapped.",
        "descriptionKn": "ದಾಳಿಂಬೆಯ ಸಿಪ್ಪೆ ಗಾಢ ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಟಾವಿಗೆ ಸಿದ್ಧವಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest with Sharp Secateurs",
            "titleKn": "ಕತ್ತರಿಯಿಂದ ಎಚ್ಚರಿಕೆಯಿಂದ ಕಟಾವು ಮಾಡಿ",
            "bodyEn": "Clip fruits close to base without pulling. Grade by size and color for export/mandi.",
            "bodyKn": "ಕಾಯಿಯನ್ನು ಎಳೆಯದೆ ಕತ್ತರಿಯಿಂದ ಕತ್ತರಿಸಿ ಗಾತ್ರದ ಪ್ರಕಾರ ವರ್ಗೀಕರಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "mango",
    "nameEn": "Mango",
    "nameKn": "ಮಾವು (Mango)",
    "scientificName": "Mangifera indica",
    "category": "Plantation & Fruits",
    "categoryKn": "ತೋಟಗಾರಿಕೆ ಮತ್ತು ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
    "totalDays": 365,
    "isPerennial": true,
    "popularVarieties": [
      "Alphonso (Badami)",
      "Banganapalli",
      "Kesar",
      "Mallika",
      "Totapuri",
      "Raspuri"
    ],
    "seasons": [
      "Summer"
    ],
    "soilType": "Deep well-drained alluvial or red loamy soil, pH 5.5-7.5",
    "soilTypeKn": "ಆಳವಾದ ಫಲವತ್ತಾದ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Wheat",
    "stages": [
      {
        "key": "POST_HARVEST_REST",
        "nameEn": "Post-Harvest Flush & Winter Rest",
        "nameKn": "ಕೊಯ್ಲಿನ ನಂತರದ ವಿಶ್ರಾಂತಿ ಮತ್ತು ಚಿಗುರು",
        "startDay": 0,
        "endDay": 90,
        "descriptionEn": "Pruning of dead wood and withholding water to induce flower buds in winter.",
        "descriptionKn": "ಒಣ ಕೊಂಬೆ ಕತ್ತರಿಸಿ ಚಳಿಗಾಲದಲ್ಲಿ ಹೂವು ಬಿಡಲು ನೀರು ನಿಲ್ಲಿಸುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Post-Harvest Manuring",
            "titleKn": "ಕೊಯ್ಲಿನ ನಂತರದ ಗೊಬ್ಬರ",
            "bodyEn": "Apply 50 kg FYM + 1 kg Urea + 1 kg Potash in canopy drip line. Stop irrigation from October.",
            "bodyKn": "ಅಕ್ಟೋಬರ್‌ನಿಂದ ನೀರು ನಿಲ್ಲಿಸಿ ಮರಕ್ಕೆ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮತ್ತು ರಸಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_PANICLE",
        "nameEn": "Panicle Emergence & Flowering",
        "nameKn": "ಹೂಗೊಂಚಲು (Panicle) ಮೂಡುವ ಹಂತ",
        "startDay": 91,
        "endDay": 150,
        "descriptionEn": "Pyramidal flower panicles emerge covered in thousands of fragrant florets.",
        "descriptionKn": "ಮರವೆಲ್ಲಾ ಹಳದಿ-ಬಿಳಿ ಹೂಗೊಂಚಲುಗಳಿಂದ ತುಂಬುವ ಸುಂದರ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Mango Hopper & Powdery Mildew Spray",
            "titleKn": "ಮಾವಿನ ಜಿಗಿಹುಳು ಮತ್ತು ಬೂದಿ ರೋಗ ನಿಯಂತ್ರಣ",
            "bodyEn": "Spray Imidacloprid (0.3 ml/L) + Hexaconazole (1 ml/L) before flowers open to stop hopper sap sucking.",
            "bodyKn": "ಹೂಗಳು ಒಣಗಿ ಉದುರದಂತೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ ಮತ್ತು ಹೆಕ್ಸಾಕೋನಾಜೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FRUIT_SET_MARBLE",
        "nameEn": "Fruit Set & Pea/Marble Stage",
        "nameKn": "ಕಾಯಿ ಕಚ್ಚುವುದು ಮತ್ತು ಗೋಲಿ ಗಾತ್ರದ ಹಂತ",
        "startDay": 151,
        "endDay": 210,
        "descriptionEn": "Fertilized flowers develop into pea-sized then marble-sized green fruitlets.",
        "descriptionKn": "ಹೂಗಳು ಉದುರಿ ಸಣ್ಣ ಗೋಲಿಯಂತಹ ಹಸಿರು ಮಾವಿನ ಕಾಯಿಗಳು ಉಳಿಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Resume Light Irrigation at Marble Size",
            "titleKn": "ಕಾಯಿ ಗೋಲಿ ಗಾತ್ರವಾದಾಗ ನೀರು ನೀಡಿ",
            "bodyEn": "Resume light watering after fruit set to avoid fruit drop. Never irrigate during peak bloom.",
            "bodyKn": "ಕಾಯಿ ಉದುರುವುದು ತಪ್ಪಿಸಲು ಗೋಲಿ ಗಾತ್ರದ ನಂತರ ಲಘು ನೀರಾವರಿ ಆರಂಭಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "MATURITY_HARVEST",
        "nameEn": "Fruit Maturation & Plucking",
        "nameKn": "ಕಾಯಿ ಬಲಿಯುವುದು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 211,
        "endDay": 365,
        "descriptionEn": "Shoulders rise above stalk cavity. Tap water test shows sinkers.",
        "descriptionKn": "ಮಾವಿನ ಕಾಯಿ ಚೆನ್ನಾಗಿ ಬಲಿತು ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest with 1cm Pedicel Using Harvester",
            "titleKn": "1 ಸೆಂ.ಮೀ ತೊಟ್ಟಿನೊಂದಿಗೆ ಮಾವು ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Harvest with poles having net bag and clip with 1cm stem to prevent latex staining the fruit.",
            "bodyKn": "ಹಾಲು ಕಾಯಿಗೆ ತಾಗದಂತೆ 1 ಸೆಂ.ಮೀ ತೊಟ್ಟಿನೊಂದಿಗೆ ಕತ್ತರಿಸಿ ನೆರಳಿನಲ್ಲಿ ಹಣ್ಣು ಮಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "capsicum",
    "nameEn": "Capsicum (Bell Pepper)",
    "nameKn": "ದೊಡ್ಡ ಮೆಣಸಿನಕಾಯಿ (Capsicum)",
    "scientificName": "Capsicum annuum var. grossum",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 130,
    "isPerennial": false,
    "popularVarieties": [
      "Indra",
      "Bachata (Yellow)",
      "Pasarella (Red)",
      "Bomby",
      "Orobelle"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Porous fertile sandy loam rich in organic manure",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಸಡಿಲವಾದ ಮರಳು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "TRANSPLANTING_ESTABLISHMENT",
        "nameEn": "Transplanting & Rooting",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Seedlings establish in raised beds with silver-black mulch.",
        "descriptionKn": "ಮಲ್ಚಿಂಗ್ ಶೀಟ್ ಮೇಲೆ ನಾಟಿ ಮಾಡಿದ ಸಸಿಗಳು ಬೇರೂರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Strict Moisture Balance Under Mulch",
            "titleKn": "ಮಲ್ಚಿಂಗ್ ಕೆಳಗೆ ಸಮತೋಲಿತ ತೇವಾಂಶ",
            "bodyEn": "Run drip for 30-45 minutes daily. Do not overwater to prevent Pythium collar rot.",
            "bodyKn": "ಕತ್ತು ಕೊಳೆ ರೋಗ ಬರದಂತೆ ದಿನಕ್ಕೆ 30-45 ನಿಮಿಷ ಮಾತ್ರ ಹನಿ ನೀರು ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_BRANCHING",
        "nameEn": "Vegetative Branching & Staking",
        "nameKn": "ಕವಲುಗಳು ಮತ್ತು ತಂತಿಗೆ ಕಟ್ಟುವುದು",
        "startDay": 26,
        "endDay": 50,
        "descriptionEn": "Two-stem training and nylon twine trellising.",
        "descriptionKn": "ಗಿಡಕ್ಕೆ ನೈಲಾನ್ ದಾರ ಕಟ್ಟಿ ಎರಡು ಕವಲುಗಳನ್ನು ಮೇಲಕ್ಕೆ ಹಬ್ಬಿಸುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Fertigate 19:19:19 & Micronutrients",
            "titleKn": "19:19:19 ಕರಗುವ ಗೊಬ್ಬರ ನೀಡಿ",
            "bodyEn": "Apply 19:19:19 (3 kg/acre) through fertigation twice weekly.",
            "bodyKn": "ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ 3 ಕೆಜಿ 19:19:19 ಗೊಬ್ಬರವನ್ನು ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_FRUIT_SET",
        "nameEn": "Flowering & Blocky Fruit Setting",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 51,
        "endDay": 75,
        "descriptionEn": "Four-lobed blocky fruits set on nodes.",
        "descriptionKn": "ನಾಲ್ಕು ಮೂಲೆಗಳ ದಪ್ಪನೆಯ ಕ್ಯಾಪ್ಸಿಕಂ ಕಾಯಿಗಳು ರೂಪುಗೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Calcium Nitrate + Boron Spray",
            "titleKn": "ಕ್ಯಾಲ್ಸಿಯಂ & ಬೋರಾನ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray Calcium Nitrate (2g/L) + Boron (1g/L) to prevent blossom-end rot.",
            "bodyKn": "ಕಾಯಿ ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FRUIT_PLUCKING",
        "nameEn": "Periodic Harvest Flushes",
        "nameKn": "ನಿರಂತರ ಕಟಾವು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 76,
        "endDay": 130,
        "descriptionEn": "Pluck glossy blocky green peppers or allow to mature into yellow/red.",
        "descriptionKn": "ಹೊಳಪಿನ ದಪ್ಪ ಕಾಯಿಗಳನ್ನು ವಾರಕ್ಕೊಮ್ಮೆ ಕೊಯ್ಲು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest with Pedicel Attached",
            "titleKn": "ತೊಟ್ಟಿನೊಂದಿಗೆ ಕತ್ತರಿಯಿಂದ ಕಟಾವು ಮಾಡಿ",
            "bodyEn": "Clip fruits with sharp clippers keeping 1cm green stem to maximize shelf life.",
            "bodyKn": "ಕಾಯಿಯ ತೊಟ್ಟನ್ನು ಉಳಿಸಿಕೊಂಡು ಕತ್ತರಿಸಿ ತಕ್ಷಣ ನೆರಳಿನಲ್ಲಿಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "brinjal",
    "nameEn": "Brinjal (Eggplant)",
    "nameKn": "ಬದನೆಕಾಯಿ (Brinjal)",
    "scientificName": "Solanum melongena",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 140,
    "isPerennial": false,
    "popularVarieties": [
      "Arka Anand",
      "Mattugulla",
      "Pusa Purple Long",
      "Pusa Kranti",
      "Mahyco Ravaiya"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Fertile rich silt loam or well-drained clay loam",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "TRANSPLANTING_ESTABLISHMENT",
        "nameEn": "Transplanting & Establishment",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Seedlings adapt and roots penetrate deep into ridges.",
        "descriptionKn": "ನಾಟಿ ಮಾಡಿದ ಬದನೆ ಸಸಿಗಳು ಬೇರೂರಿ ಚಿಗುರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Shoot & Fruit Borer Prevention",
            "titleKn": "ಸುಳಿ ಮತ್ತು ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ತಡೆ",
            "bodyEn": "Clip and destroy withered drooping terminal shoots. Apply Neem cake in soil.",
            "bodyKn": "ಬಾಡಿದ ಸುಳಿಗಳನ್ನು ಕತ್ತರಿಸಿ ನಾಶಪಡಿಸಿ ಬುಡಕ್ಕೆ ಬೇವಿನ ಹಿಂಡಿ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_BRANCHING",
        "nameEn": "Vegetative Branching",
        "nameKn": "ಕವಲುಗಳು ಮತ್ತು ಬೆಳವಣಿಗೆ",
        "startDay": 26,
        "endDay": 50,
        "descriptionEn": "Broad fuzzy leaves and purple-tinted sturdy branches.",
        "descriptionKn": "ಗಿಡವು ಕವಲೊಡೆದು ದಟ್ಟವಾಗಿ ಬೆಳೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Nitrogen Top-Dressing & Earthing Up",
            "titleKn": "ಯೂರಿಯಾ ಮತ್ತು ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸುವುದು",
            "bodyEn": "Apply 25 kg Urea per acre and hill soil around roots.",
            "bodyKn": "ಎಕರೆಗೆ 25 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ ಬುಡಕ್ಕೆ ಚೆನ್ನಾಗಿ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_FRUIT_SET",
        "nameEn": "Flowering & Fruit Setting",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 51,
        "endDay": 75,
        "descriptionEn": "Purple star-shaped flowers set into glossy tender brinjals.",
        "descriptionKn": "ನೇರಳೆ ಹೂಗಳು ಅರಳಿ ಹೊಳಪಿನ ಎಳೆ ಬದನೆಕಾಯಿಗಳಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Fruit Borer Spray with Spinosad / Chlorantraniliprole",
            "titleKn": "ಕಾಯಿಕೊರಕ ಹುಳುವಿಗೆ ಸ್ಪಿನೋಸ್ಯಾಡ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray Spinosad 45% SC (0.3 ml/L) or Emamectin Benzoate (0.4 g/L).",
            "bodyKn": "ಕಾಯಿ ಕೊರೆಯುವುದನ್ನು ತಡೆಯಲು ಸ್ಪಿನೋಸ್ಯಾಡ್ ಅಥವಾ ಎಮಾಮೆಕ್ಟಿನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "CONTINUOUS_HARVEST",
        "nameEn": "Multiple Plucking Flushes",
        "nameKn": "ನಿರಂತರ ಕಟಾವು ಮತ್ತು ಕೊಯ್ಲು",
        "startDay": 76,
        "endDay": 140,
        "descriptionEn": "Harvest tender fruits every 5-7 days before seeds harden.",
        "descriptionKn": "ಬೀಜ ಗಟ್ಟಿಯಾಗುವ ಮುನ್ನ ಎಳೆ ಹೊಳಪಿನ ಕಾಯಿಗಳನ್ನು ವಾರಕ್ಕೊಮ್ಮೆ ಕಟಾವು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Booster Dose After Every 3 Pluckings",
            "titleKn": "ಪ್ರತಿ 3 ಕೊಯ್ಲಿನ ನಂತರ ರಸಗೊಬ್ಬರ",
            "bodyEn": "Apply 10 kg Urea + 10 kg Potash per acre after picking to keep bushes blooming.",
            "bodyKn": "ನಿರಂತರ ಕಾಯಿ ಬರಲು ಪ್ರತಿ 3 ಕೊಯ್ಲಿನ ನಂತರ ಲಘುವಾಗಿ ಯೂರಿಯಾ + ಪೊಟ್ಯಾಷ್ ನೀಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "bhendi",
    "nameEn": "Bhendi (Okra / Ladies Finger)",
    "nameKn": "ಬೆಂಡೆಕಾಯಿ (Bhendi / Okra)",
    "scientificName": "Abelmoschus esculentus",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 90,
    "isPerennial": false,
    "popularVarieties": [
      "Arka Anamika",
      "Parbhani Kranti",
      "Radhika",
      "Syngenta 152",
      "Kashi Kranti"
    ],
    "seasons": [
      "Kharif",
      "Rabi",
      "Summer"
    ],
    "soilType": "Fertile well-drained sandy loam or clay loam with organic matter",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕೆಂಪು ಮಣ್ಣು",
    "iconName": "Sprout",
    "stages": [
      {
        "key": "GERMINATION_SEEDLING",
        "nameEn": "Germination & Seedling",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ಎಳೆ ಸಸಿ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Quick seed emergence within 5-7 days and first true leaves.",
        "descriptionKn": "5-7 ದಿನಗಳಲ್ಲಿ ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಸಸಿ ಬರುವುದು.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Yellow Vein Mosaic Virus (YVMV) Protection",
            "titleKn": "ಹಳದಿ ನರ ರೋಗ (YVMV) ತಡೆ",
            "bodyEn": "Spread by whiteflies. Install yellow sticky traps and spray Imidacloprid (0.3 ml/L).",
            "bodyKn": "ಹಳದಿ ನರ ರೋಗ ಹರಡುವ ಬಿಳಿ ನೊಣಗಳನ್ನು ತಡೆಯಲು ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಇರಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_BRANCHING",
        "nameEn": "Vegetative Growth & Branching",
        "nameKn": "ಕಾಯಿಕ ಬೆಳವಣಿಗೆ ಮತ್ತು ಕವಲುಗಳು",
        "startDay": 21,
        "endDay": 40,
        "descriptionEn": "Vigorous single stem or branched bush with yellow flower buds.",
        "descriptionKn": "ಕಾಂಡ ದಪ್ಪವಾಗಿ ಎಲೆಗಳು ಮತ್ತು ಹೂವಿನ ಮೊಗ್ಗುಗಳು ಮೂಡುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Nitrogen Top-Dressing at Day 30",
            "titleKn": "30ನೇ ದಿನ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
            "bodyEn": "Apply 25 kg Urea per acre followed by weeding and earthing up.",
            "bodyKn": "ಎಕರೆಗೆ 25 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ ಕಳೆ ಕೀಳಿಸಿ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "FLOWERING_FRUIT_SET",
        "nameEn": "Flowering & Tender Pod Emergence",
        "nameKn": "ಹೂವಾಡುವ ಮತ್ತು ಎಳೆ ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 41,
        "endDay": 60,
        "descriptionEn": "Large cream flowers with maroon centers produce tender ribbed green pods.",
        "descriptionKn": "ಹೂಗಳು ಅರಳಿ ಎಳೆ ಬೆಂಡೆಕಾಯಿಗಳು ವೇಗವಾಗಿ ಬೆಳೆಯುವ ಹಂತ.",
        "advisories": [
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Shoot and Fruit Borer Spray",
            "titleKn": "ಕಾಯಿಕೊರಕ ಹುಳು ನಿಯಂತ್ರಣ",
            "bodyEn": "Spray Chlorantraniliprole (0.3ml/L) or Spinosad (0.3ml/L) when pods start forming.",
            "bodyKn": "ಕಾಯಿ ಕೊರೆಯದಂತೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "REGULAR_PLUCKING",
        "nameEn": "Alternate Day Pod Plucking",
        "nameKn": "ದಿನಬಿಟ್ಟು ದಿನ ಎಳೆ ಕಾಯಿ ಕೊಯ್ಲು",
        "startDay": 61,
        "endDay": 90,
        "descriptionEn": "Pluck pods every alternate day when tips snap crisp without fiber.",
        "descriptionKn": "ತುದಿ ಮುರಿದಾಗ ಸುಲಭವಾಗಿ ತುಂಡಾಗುವ ಎಳೆ ಬೆಂಡೆಕಾಯಿಗಳನ್ನು ದಿನಬಿಟ್ಟು ದಿನ ಕಟಾವು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Pick Frequently in Morning or Evening",
            "titleKn": "ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಕೊಯ್ಲು ಮಾಡಿ",
            "bodyEn": "Do not let pods overgrow and turn fibrous. Regular picking prolongs harvest flushes.",
            "bodyKn": "ಕಾಯಿ ಬಲಿತು ನಾರು ಬರದಂತೆ ನಿಯಮಿತವಾಗಿ ಕಟಾವು ಮಾಡಿ.",
            "urgency": "HIGH"
          }
        ]
      }
    ]
  },
  {
    "id": "cabbage",
    "nameEn": "Cabbage",
    "nameKn": "ಎಲೆಕೋಸು (Cabbage)",
    "scientificName": "Brassica oleracea var. capitata",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 90,
    "isPerennial": false,
    "popularVarieties": [
      "Golden Acre",
      "Pride of India",
      "Green Express",
      "Pusa Mukta",
      "Saint"
    ],
    "seasons": [
      "Rabi",
      "Kharif"
    ],
    "soilType": "Well-drained rich sandy loam to silt loam with pH 6.0-6.8",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ಕಪ್ಪು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "TRANSPLANTING_ROOTING",
        "nameEn": "Transplanting & Rooting",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Seedlings establish shallow roots in moist ridges.",
        "descriptionKn": "ನಾಟಿ ಮಾಡಿದ ಎಲೆಕೋಸು ಸಸಿಗಳು ಬೇರೂರಿ ಬೆಳೆಯುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Maintain Steady Moisture",
            "titleKn": "ಸಮಾನ ತೇವಾಂಶ ಕಾಪಾಡಿ",
            "bodyEn": "Provide light irrigation every 3-4 days to establish root system.",
            "bodyKn": "ಬೇರುಗಳು ಆಳಕ್ಕೆ ಇಳಿಯಲು 3-4 ದಿನಕ್ಕೊಮ್ಮೆ ಲಘು ನೀರು ನೀಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      },
      {
        "key": "VEGETATIVE_FOLIAGE",
        "nameEn": "Foliage Frame Building",
        "nameKn": "ಎಲೆಗಳ ಹರಡುವಿಕೆ",
        "startDay": 21,
        "endDay": 45,
        "descriptionEn": "Large outer waxy leaves develop to power head formation.",
        "descriptionKn": "ದೊಡ್ಡ ಎಲೆಗಳು ಹರಡಿ ಗಡ್ಡೆ ಕಟ್ಟಲು ಸಿದ್ಧವಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Urea Top Dressing & Earthing Up",
            "titleKn": "ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ ಮತ್ತು ಮಣ್ಣು ಏರಿಸುವುದು",
            "bodyEn": "Apply 30 kg Urea per acre and bank soil around stem base.",
            "bodyKn": "ಎಕರೆಗೆ 30 ಕೆಜಿ ಯೂರಿಯಾ ನೀಡಿ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ.",
            "urgency": "HIGH"
          },
          {
            "category": "PEST_PREVENTION",
            "titleEn": "Diamondback Moth (DBM) Surveillance",
            "titleKn": "ವಜ್ರದ ಬೆನ್ನಿನ ಚಿಟ್ಟೆ (DBM) ನಿಯಂತ್ರಣ",
            "bodyEn": "If windowing damage appears on leaves, spray Chlorantraniliprole (0.3ml/L) or Spinosad (0.3ml/L).",
            "bodyKn": "ಎಲೆಗಳಲ್ಲಿ ರಂಧ್ರ ಕಂಡರೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "HEAD_FORMATION",
        "nameEn": "Head Formation & Cupping",
        "nameKn": "ಗಡ್ಡೆ ಕಟ್ಟುವ ಹಂತ",
        "startDay": 46,
        "endDay": 70,
        "descriptionEn": "Center leaves cup inwards and pack tightly into dense round ball.",
        "descriptionKn": "ಮಧ್ಯದ ಎಲೆಗಳು ಒಳಗೇ ಸುತ್ತಿಕೊಂಡು ಗಟ್ಟಿಯಾದ ಕೋಸು ಗಡ್ಡೆಯಾಗುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Potassium & Boron for Solid Heads",
            "titleKn": "ಗಟ್ಟಿಯಾದ ಗಡ್ಡೆಗಾಗಿ ಪೊಟ್ಯಾಷ್ & ಬೋರಾನ್",
            "bodyEn": "Apply 0:0:50 (5g/L) + Boron (1g/L) to prevent head splitting and internal browning.",
            "bodyKn": "ಗಡ್ಡೆ ಒಡೆಯದಂತೆ ಮತ್ತು ಗಟ್ಟಿಯಾಗಲು 0:0:50 ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "HEAD_FIRMNESS_HARVEST",
        "nameEn": "Firm Head Harvesting",
        "nameKn": "ಬಲಿತ ಗಡ್ಡೆ ಕೊಯ್ಲು",
        "startDay": 71,
        "endDay": 90,
        "descriptionEn": "Heads are solid and firm to thumb press. Cut with wrapper leaves.",
        "descriptionKn": "ಗಡ್ಡೆಗಳು ಗಟ್ಟಿಯಾದಾಗ ಹೊರಗಿನ 2-3 ರಕ್ಷಣಾ ಎಲೆಗಳೊಂದಿಗೆ ಕಟಾವು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest Promptly to Avoid Bursting",
            "titleKn": "ಗಡ್ಡೆ ಒಡೆಯುವ ಮುನ್ನವೇ ಕಟಾವು ಮಾಡಿ",
            "bodyEn": "Cut mature heads early morning before field temperature rises.",
            "bodyKn": "ಬೆಳಗಿನ ತಂಪಿನಲ್ಲಿ ಚಾಕುವಿನಿಂದ ಗಡ್ಡೆಗಳನ್ನು ಕಟಾವು ಮಾಡಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "cauliflower",
    "nameEn": "Cauliflower",
    "nameKn": "ಹೂಕೋಸು (Cauliflower)",
    "scientificName": "Brassica oleracea var. botrytis",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 95,
    "isPerennial": false,
    "popularVarieties": [
      "Pusa Deepali",
      "Pusa Snowball",
      "Madhuri",
      "Candid Charm",
      "Girija"
    ],
    "seasons": [
      "Rabi",
      "Kharif"
    ],
    "soilType": "Deep fertile rich loam with high organic matter, pH 6.0-6.8",
    "soilTypeKn": "ಫಲವತ್ತಾದ ಸಾವಯವ ಭರಿತ ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "TRANSPLANTING_ESTABLISHMENT",
        "nameEn": "Transplanting & Establishment",
        "nameKn": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
        "startDay": 0,
        "endDay": 25,
        "descriptionEn": "Seedlings establish deep roots in ridges.",
        "descriptionKn": "ನಾಟಿ ಮಾಡಿದ ಹೂಕೋಸು ಸಸಿಗಳು ಬೇರೂರುವ ಹಂತ.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Uniform Soil Moisture Daily",
            "titleKn": "ಸಮಾನ ತೇವಾಂಶ ನಿರ್ವಹಿಸಿ",
            "bodyEn": "Never allow root zone to dry out to prevent early buttoning (miniature heads).",
            "bodyKn": "ಸಣ್ಣ ಗಡ್ಡೆಗಳಾಗುವುದನ್ನು (Buttoning) ತಪ್ಪಿಸಲು ನಿಯಮಿತವಾಗಿ ನೀರು ಹರಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "VEGETATIVE_CANOPY",
        "nameEn": "Vegetative Frame Building",
        "nameKn": "ಎಲೆಗಳ ಬೆಳವಣಿಗೆ",
        "startDay": 26,
        "endDay": 50,
        "descriptionEn": "Large upright leaves frame the growing point.",
        "descriptionKn": "ದೊಡ್ಡ ಎಲೆಗಳು ಬೆಳೆದು ಹೂಗಡ್ಡೆ ಕಟ್ಟಲು ಅಡಿಪಾಯವಾಗುವುದು.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Boron & Molybdenum Essential Spray",
            "titleKn": "ಬೋರಾನ್ ಮತ್ತು ಮಾಲಿಬ್ಡಿನಮ್ ಸಿಂಪಡಣೆ",
            "bodyEn": "Spray Borax (1g/L) + Sodium Molybdate (0.5g/L) to prevent 'Whiptail' and hollow stem.",
            "bodyKn": "ಎಲೆಗಳು ಚಾವಟಿಯಾಗುವುದನ್ನು (Whiptail) ತಪ್ಪಿಸಲು ಬೋರಾನ್ ಮತ್ತು ಮಾಲಿಬ್ಡಿನಮ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "CURD_INITIATION_BLANCHING",
        "nameEn": "Curd Initiation & Blanching",
        "nameKn": "ಹೂಗಡ್ಡೆ (Curd) ಕಟ್ಟುವ ಹಂತ",
        "startDay": 51,
        "endDay": 75,
        "descriptionEn": "White flower curd forms; tie outer leaves to blanch and keep curd snowy white.",
        "descriptionKn": "ಹೂಗಡ್ಡೆ ಹಳದಿಯಾಗದಂತೆ ಹೊರಗಿನ ಎಲೆಗಳನ್ನು ಮಡಚಿ ಕಟ್ಟುವುದು (Blanching).",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Blanch Curd to Keep it Pure White",
            "titleKn": "ಹೂವು ಬೆಳ್ಳಗಿರಲು ಎಲೆಗಳಿಂದ ಮುಚ್ಚಿ (Blanching)",
            "bodyEn": "Fold outer leaves over curd and tie loosely so direct sunlight does not turn it yellow.",
            "bodyKn": "ಬಿಸಿಲಿಗೆ ಹೂವು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗದಂತೆ ಎಲೆಗಳಿಂದ ಮುಚ್ಚಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "CURD_HARVEST",
        "nameEn": "Compact Curd Harvesting",
        "nameKn": "ಗಟ್ಟಿಯಾದ ಹೂಕೋಸು ಕೊಯ್ಲು",
        "startDay": 76,
        "endDay": 95,
        "descriptionEn": "Curd is solid, crisp, and pure white before florets loosen.",
        "descriptionKn": "ಹೂವು ಸಡಿಲವಾಗುವ ಮುನ್ನವೇ ಗಟ್ಟಿಯಾಗಿರುವಾಗ ಕಟಾವು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Harvest Compact Curd with Stalk",
            "titleKn": "ತೊಟ್ಟಿನೊಂದಿಗೆ ಹೂಕೋಸು ಕಟಾವು ಮಾಡಿ",
            "bodyEn": "Cut curds with 2-3 wrapper leaves to protect the face during mandi transport.",
            "bodyKn": "ಮಾರುಕಟ್ಟೆಗೆ ಸಾಗಿಸುವಾಗ ಹಾಳಾಗದಂತೆ 2-3 ಎಲೆಗಳೊಂದಿಗೆ ಕತ್ತರಿಸಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  },
  {
    "id": "carrot",
    "nameEn": "Carrot",
    "nameKn": "ಕ್ಯಾರೆಟ್ (Carrot)",
    "scientificName": "Daucus carota",
    "category": "Vegetables",
    "categoryKn": "ತರಕಾರಿಗಳು",
    "totalDays": 85,
    "isPerennial": false,
    "popularVarieties": [
      "Pusa Rudhira (Red)",
      "Pusa Kesar",
      "Kuroda",
      "Nantes",
      "Super Kuroda"
    ],
    "seasons": [
      "Rabi",
      "Kharif"
    ],
    "soilType": "Deep stone-free loose sandy loam with pH 6.0-7.0",
    "soilTypeKn": "ಕಲ್ಲುಗಳಿಲ್ಲದ ಆಳವಾದ ಸಡಿಲ ಮರಳು ಗೋಡು ಮಣ್ಣು",
    "iconName": "Droplets",
    "stages": [
      {
        "key": "GERMINATION_EMERGENCE",
        "nameEn": "Germination & Fine Feathery Foliage",
        "nameKn": "ಮೊಳಕೆ ಮತ್ತು ನವಿರಾದ ಎಲೆಗಳು",
        "startDay": 0,
        "endDay": 20,
        "descriptionEn": "Delicate seeds sprout slowly under moist fine seedbed.",
        "descriptionKn": "ನವಿರಾದ ಬೀಜಗಳು ಮೊಳಕೆಯೊಡೆದು ಸಣ್ಣ ಎಲೆಗಳು ಬರುವುದು.",
        "advisories": [
          {
            "category": "IRRIGATION",
            "titleEn": "Keep Surface Moist Without Crust",
            "titleKn": "ಮೇಲ್ಮೈ ಮಣ್ಣು ಗಟ್ಟಿಯಾಗದಂತೆ ತೇವಾಂಶ ಕಾಪಾಡಿ",
            "bodyEn": "Sprinkle light water daily. Soil crust prevents tiny carrot seedlings from emerging.",
            "bodyKn": "ಮೊಳಕೆ ಸುಲಭವಾಗಿ ಹೊರಬರಲು ಲಘುವಾಗಿ ದಿನವೂ ನೀರು ಚಿಮುಕಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "THINNING_FOLIAGE_CANOPY",
        "nameEn": "Thinning & Taproot Elongation",
        "nameKn": "ಸಸಿ ತೆಳು ಮಾಡುವುದು & ಬೇರು ಉದ್ದವಾಗುವುದು",
        "startDay": 21,
        "endDay": 40,
        "descriptionEn": "Thin seedlings to 5-8 cm apart so roots grow straight without forking.",
        "descriptionKn": "ಕ್ಯಾರೆಟ್ ಕವಲೊಡೆಯದಂತೆ ನೇರವಾಗಿ ಬೆಳೆಯಲು 5-8 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಸಸಿ ತೆಳು ಮಾಡಿ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Mandatory Thinning at Day 25",
            "titleKn": "25ನೇ ದಿನ ಸಸಿಗಳನ್ನು ತೆಳು ಮಾಡಿ",
            "bodyEn": "Thin overcrowded seedlings to prevent twisted roots. Apply 20 kg Potash/acre.",
            "bodyKn": "ಕ್ಯಾರೆಟ್ ಡೊಂಕಾಗುವುದನ್ನು ತಪ್ಪಿಸಲು ಸಸಿ ತೆಳು ಮಾಡಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "ROOT_THICKENING_COLOR",
        "nameEn": "Root Thickening & Carotene Building",
        "nameKn": "ಕ್ಯಾರೆಟ್ ದಪ್ಪವಾಗುವುದು ಮತ್ತು ಕೆಂಪು-ಕಿತ್ತಳೆ ಬಣ್ಣ",
        "startDay": 41,
        "endDay": 65,
        "descriptionEn": "Carrot expands in girth and deposits rich beta-carotene pigment.",
        "descriptionKn": "ಬೇರು ದಪ್ಪವಾಗಿ ಗಾಢ ಕೆಂಪು/ಕಿತ್ತಳೆ ಬಣ್ಣ ತುಂಬಿಕೊಳ್ಳುವ ಹಂತ.",
        "advisories": [
          {
            "category": "FERTILIZER",
            "titleEn": "Potassium & Boron for Sweet Crunchy Roots",
            "titleKn": "ಸಿಹಿ ಮತ್ತು ಗರಿಗರಿ ಕ್ಯಾರೆಟ್‌ಗೆ ಪೊಟ್ಯಾಷ್ & ಬೋರಾನ್",
            "bodyEn": "Apply 0:0:50 (5g/L) + Boron (1g/L) to prevent carrot splitting and core hardness.",
            "bodyKn": "ಕ್ಯಾರೆಟ್ ಸಿಡಿಯದಂತೆ ಮತ್ತು ಸಿಹಿಯಾಗಿರಲು ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.",
            "urgency": "HIGH"
          }
        ]
      },
      {
        "key": "ROOT_PULLING_HARVEST",
        "nameEn": "Mature Root Pulling",
        "nameKn": "ಬಲಿತ ಕ್ಯಾರೆಟ್ ಕಿತ್ತು ಕಟಾವು ಮಾಡುವುದು",
        "startDay": 66,
        "endDay": 85,
        "descriptionEn": "Shoulders reach 3-4 cm diameter. Soil moistened for easy pulling.",
        "descriptionKn": "ಕ್ಯಾರೆಟ್ ಪೂರ್ಣ ಬಲಿತಾಗ ಮಣ್ಣಿಗೆ ನೀರು ಹಾಯಿಸಿ ಸುಲಭವಾಗಿ ಕಿತ್ತು ತೆಗೆಯಿರಿ.",
        "advisories": [
          {
            "category": "WEATHER_ALERT",
            "titleEn": "Irrigate Before Pulling and Wash Clean",
            "titleKn": "ಕಟಾವಿಗೂ ಮುನ್ನ ನೀರು ಹಾಯಿಸಿ ತೊಳೆದು ಒಣಗಿಸಿ",
            "bodyEn": "Lightly irrigate 1 day before pulling so roots pull out cleanly without snapping.",
            "bodyKn": "ಬೇರುಗಳು ತುಂಡಾಗದಂತೆ ಕಿತ್ತು ತೆಗೆಯುವ 1 ದಿನ ಮೊದಲು ನೀರು ಹಾಯಿಸಿ ನಂತರ ಸ್ವಚ್ಛವಾಗಿ ತೊಳೆಯಿರಿ.",
            "urgency": "MEDIUM"
          }
        ]
      }
    ]
  }
];

/**
 * Normalizes user/DB crop name strings and matches against catalog
 */
export function findCropInCatalog(input?: string): CropCalendarItem {
  if (!input) return CROPS_CATALOG[0]
  const clean = input.toLowerCase().trim()
  
  // Exact id or name match
  const exact = CROPS_CATALOG.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.nameEn.toLowerCase() === clean ||
      c.nameKn.toLowerCase() === clean
  )
  if (exact) return exact

  // Substring or alias matching
  for (const c of CROPS_CATALOG) {
    const idLower = c.id.toLowerCase()
    const enLower = c.nameEn.toLowerCase()
    const knLower = c.nameKn.toLowerCase()

    if (clean.includes(idLower) || idLower.includes(clean)) return c
    if (clean.includes(enLower) || enLower.includes(clean)) return c
    if (clean.includes(knLower) || knLower.includes(clean)) return c

    // Special common English/Kannada aliases
    if ((clean.includes("paddy") || clean.includes("ಭತ್ತ") || clean.includes("ಅಕ್ಕಿ")) && c.id === "rice") return c
    if ((clean.includes("finger millet") || clean.includes("ರಾಗಿ")) && c.id === "ragi") return c
    if ((clean.includes("corn") || clean.includes("ಮೆಕ್ಕೆಜೋಳ")) && c.id === "maize") return c
    if ((clean.includes("red gram") || clean.includes("arhar") || clean.includes("pigeonpea") || clean.includes("ತೊಗರಿ")) && c.id === "tur") return c
    if ((clean.includes("chana") || clean.includes("chickpea") || clean.includes("ಕಡಲೆ")) && c.id === "bengal_gram") return c
    if ((clean.includes("moong") || clean.includes("ಹೆಸರು")) && c.id === "green_gram") return c
    if ((clean.includes("urad") || clean.includes("ಉದ್ದು") || clean.includes("ಉದ್ದಿನ")) && c.id === "black_gram") return c
    if ((clean.includes("peanut") || clean.includes("ಶೇಂಗಾ") || clean.includes("ನೆಲಗಡಲೆ")) && c.id === "groundnut") return c
    if ((clean.includes("chilli") || clean.includes("chili") || clean.includes("ಮೆಣಸಿನಕಾಯಿ")) && c.id === "chilli") return c
    if ((clean.includes("bell pepper") || clean.includes("capsicum") || clean.includes("ದೊಡ್ಡ ಮೆಣಸಿನಕಾಯಿ")) && c.id === "capsicum") return c
    if ((clean.includes("eggplant") || clean.includes("aubergine") || clean.includes("ಬದನೆ")) && c.id === "brinjal") return c
    if ((clean.includes("okra") || clean.includes("ladies finger") || clean.includes("ಬೆಂಡೆ")) && c.id === "bhendi") return c
    if ((clean.includes("betelnut") || clean.includes("ಅಡಿಕೆ") || clean.includes("ಅಡಕೆ")) && c.id === "arecanut") return c
    if ((clean.includes("ಕಬ್ಬು")) && c.id === "sugarcane") return c
    if ((clean.includes("ಹತ್ತಿ")) && c.id === "cotton") return c
    if ((clean.includes("ಬಾಳೆ")) && c.id === "banana") return c
    if ((clean.includes("ತೆಂಗು") || clean.includes("ತೆಂಗಿನಕಾಯಿ")) && c.id === "coconut") return c
    if ((clean.includes("ಶುಂಠಿ")) && c.id === "ginger") return c
    if ((clean.includes("ಅರಿಶಿನ") || clean.includes("ಅರಿಷಿಣ")) && c.id === "turmeric") return c
    if ((clean.includes("ದಾಳಿಂಬೆ")) && c.id === "pomegranate") return c
    if ((clean.includes("ಮಾವು") || clean.includes("ಮಾವಿನ")) && c.id === "mango") return c
  }

  return CROPS_CATALOG[0] // fallback to Rice
}

export interface DynamicStageResult {
  crop: CropCalendarItem
  elapsedDays: number
  totalDays: number
  progressPct: number
  currentStage: CropGrowthStage
  currentStageIndex: number
  stages: (CropGrowthStage & {
    isCompleted: boolean
    isCurrent: boolean
    isUpcoming: boolean
    daysRemainingUntilStart: number
  })[]
}

/**
 * Calculates current dynamic growth stage, progress, and stage statuses for any crop & sowing date
 */
export function calculateDynamicCropStage(
  cropInput: string | CropCalendarItem,
  sowingDateOrDays: string | Date | number
): DynamicStageResult {
  const crop = typeof cropInput === "string" ? findCropInCatalog(cropInput) : cropInput

  let elapsedDays = 35
  if (typeof sowingDateOrDays === "number") {
    elapsedDays = Math.max(1, Math.round(sowingDateOrDays))
  } else {
    const sDate = new Date(sowingDateOrDays)
    if (!isNaN(sDate.getTime())) {
      const diffMs = Date.now() - sDate.getTime()
      elapsedDays = Math.max(1, Math.floor(diffMs / 86400000))
    }
  }

  // Handle perennial crops or crops past total duration
  const totalDays = crop.totalDays || 120
  const cappedDays = crop.isPerennial ? ((elapsedDays - 1) % totalDays) + 1 : Math.min(elapsedDays, totalDays)
  const progressPct = Math.min(100, Math.max(5, Math.round((cappedDays / totalDays) * 100)))

  let currentStageIndex = 0
  for (let i = 0; i < crop.stages.length; i++) {
    const s = crop.stages[i]
    if (cappedDays >= s.startDay && cappedDays <= s.endDay) {
      currentStageIndex = i
      break
    }
    if (cappedDays > s.endDay) {
      currentStageIndex = i // fallback to latest passed
    }
  }

  const currentStage = crop.stages[currentStageIndex] || crop.stages[0]

  const stagesWithStatus = crop.stages.map((st, idx) => {
    const isCompleted = idx < currentStageIndex || cappedDays > st.endDay
    const isCurrent = idx === currentStageIndex
    const isUpcoming = idx > currentStageIndex && cappedDays < st.startDay
    const daysRemainingUntilStart = Math.max(0, st.startDay - cappedDays)

    return {
      ...st,
      isCompleted,
      isCurrent,
      isUpcoming,
      daysRemainingUntilStart,
    }
  })

  return {
    crop,
    elapsedDays,
    totalDays,
    progressPct,
    currentStage,
    currentStageIndex,
    stages: stagesWithStatus,
  }
}
