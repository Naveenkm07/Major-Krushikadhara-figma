// ==============================================================================
// Crop Present Growth Stage & Tailored Agronomy Advisory Engine
// Dynamic agronomic suggestions tailored to the farmer's exact present stage.
// ==============================================================================

import { prisma } from "../config/db.js"

export interface GrowthStageDef {
  key: string
  nameEn: string
  nameKn: string
  startDay: number
  endDay: number
  descriptionEn: string
  descriptionKn: string
  advisories: {
    category: "IRRIGATION" | "FERTILIZER" | "PEST_PREVENTION" | "WEATHER_ALERT"
    titleEn: string
    titleKn: string
    bodyEn: string
    bodyKn: string
    urgency: "LOW" | "MEDIUM" | "HIGH"
  }[]
}

// Stage definitions for key crops
export const CROP_STAGE_DEFINITIONS: Record<string, GrowthStageDef[]> = {
  // Rice / Paddy (ಭತ್ತ)
  rice: [
    {
      key: "NURSERY_SOWING",
      nameEn: "Nursery & Sowing",
      nameKn: "ಸಸಿಮಡಿ ಮತ್ತು ಬಿತ್ತನೆ",
      startDay: 0,
      endDay: 25,
      descriptionEn: "Seed germination and seedling development in the nursery bed.",
      descriptionKn: "ಸಸಿಮಡಿಯಲ್ಲಿ ಬೀಜ ಮೊಳಕೆಯೊಡೆಯುವುದು ಮತ್ತು ಸಸಿಗಳ ಬೆಳವಣಿಗೆ.",
      advisories: [
        {
          category: "IRRIGATION",
          titleEn: "Maintain Shallow Water Bed",
          titleKn: "ತೆಳು ನೀರಿನ ಮಟ್ಟ ನಿರ್ವಹಿಸಿ",
          bodyEn: "Keep 2-3 cm water level in the nursery. Drain water before applying any booster fertilizer.",
          bodyKn: "ಸಸಿಮಡಿಯಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ನೀರಿನ ಮಟ್ಟ ಕಾಪಾಡಿ. ಪೋಷಕಾಂಶ ಕೊಡುವ ಮುನ್ನ ನೀರನ್ನು ಬಸಿದುಬಿಡಿ.",
          urgency: "MEDIUM",
        },
        {
          category: "PEST_PREVENTION",
          titleEn: "Seed Treatment with Trichoderma",
          titleKn: "ಟ್ರೈಕೋಡರ್ಮಾ ಬೀಜೋಪಚಾರ",
          bodyEn: "Treat seeds with Trichoderma viride (4g/kg seed) to prevent blast and seed-borne root rot.",
          bodyKn: "ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಬೇರು ಕೊಳೆತ ತಡೆಯಲು ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ 4 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಬೆರೆಸಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "TILLERING_VEGETATIVE",
      nameEn: "Tillering & Vegetative",
      nameKn: "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಕಾಯಿಕ ಬೆಳವಣಿಗೆ",
      startDay: 26,
      endDay: 50,
      descriptionEn: "Active tillering stage; plant produces multiple shoots and strengthens root system.",
      descriptionKn: "ಸಸಿ ಕವಲೊಡೆಯುವ ಹಂತ; ಗಿಡವು ಬಲವಾದ ಬೇರು ಮತ್ತು ಹೆಚ್ಚುವರಿ ಕವಲುಗಳನ್ನು ನೀಡುತ್ತದೆ.",
      advisories: [
        {
          category: "FERTILIZER",
          titleEn: "First Top-Dressing of Nitrogen (Urea)",
          titleKn: "ಮೊದಲ ಕಂತಿನ ಯೂರಿಯಾ ಸಿಂಪಡಣೆ",
          bodyEn: "Apply 25 kg Urea per acre along with 10 kg MOP (Potash) to boost tiller production.",
          bodyKn: "ಹೆಚ್ಚು ಕವಲುಗಳು ಬರಲು ಪ್ರತಿ ಎಕರೆಗೆ 25 ಕೆಜಿ ಯೂರಿಯಾ ಜೊತೆಗೆ 10 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
          urgency: "HIGH",
        },
        {
          category: "PEST_PREVENTION",
          titleEn: "Yellow Stem Borer Surveillance",
          titleKn: "ಹಳದಿ ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟ ಪರಿಶೀಲನೆ",
          bodyEn: "Look for 'dead hearts' in tillers. If 5% damage is seen, spray Chlorantraniliprole 18.5% SC (0.3 ml/L).",
          bodyKn: "ಸುಳಿ ಒಣಗುವುದನ್ನು ಗಮನಿಸಿ. 5% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಹಾನಿಯಿದ್ದರೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ (0.3 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "PANICLE_INITIATION",
      nameEn: "Panicle Initiation & Booting",
      nameKn: "ತೆನೆ ಮೂಡುವ ಮತ್ತು ಗರ್ಭಾವಸ್ಥೆ ಹಂತ",
      startDay: 51,
      endDay: 75,
      descriptionEn: "Panicles begin forming inside the leaf sheath. Crucial stage for yield determination.",
      descriptionKn: "ಎಲೆಗಳ ಒಳಗೆ ತೆನೆ ರೂಪುಗೊಳ್ಳುವ ಹಂತ. ಇಳುವರಿಯನ್ನು ನಿರ್ಧರಿಸುವ ಅತಿ ಮುಖ್ಯ ಹಂತ.",
      advisories: [
        {
          category: "IRRIGATION",
          titleEn: "Maintain Continuous 5cm Standing Water",
          titleKn: "ನಿರಂತರ 5 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ",
          bodyEn: "Drought stress at booting will lead to sterile grains. Do not let soil crack.",
          bodyKn: "ತೆನೆ ಮೂಡುವಾಗ ನೀರು ಕಡಿಮೆಯಾದರೆ ಜಳ್ಳು ಕಾಳುಗಳಾಗುತ್ತವೆ. ಗದ್ದೆಯಲ್ಲಿ ಬಿರುಕು ಬಿಡದಂತೆ ನೀರು ನಿಲ್ಲಿಸಿ.",
          urgency: "HIGH",
        },
        {
          category: "FERTILIZER",
          titleEn: "Second Potash & Micronutrient Boost",
          titleKn: "ಎರಡನೇ ಕಂತಿನ ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ",
          bodyEn: "Apply remaining Potash (15 kg/acre) to ensure grain filling and strong stalk.",
          bodyKn: "ಕಾಳು ತುಂಬಲು ಮತ್ತು ಕಾಂಡ ಗಟ್ಟಿಯಾಗಲು ಉಳಿದ 15 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರವನ್ನು ನೀಡಿ.",
          urgency: "MEDIUM",
        },
      ],
    },
    {
      key: "FLOWERING_HEADING",
      nameEn: "Flowering & Heading",
      nameKn: "ಹೂವಾಡುವ ಮತ್ತು ತೆನೆ ಹೊರಬರುವ ಹಂತ",
      startDay: 76,
      endDay: 95,
      descriptionEn: "Panicles fully emerge and pollination occurs. Avoid spraying during morning pollination.",
      descriptionKn: "ತೆನೆಗಳು ಸಂಪೂರ್ಣ ಹೊರಬಂದು ಪರಾಗಸ್ಪರ್ಶ ನಡೆಯುವ ಹಂತ.",
      advisories: [
        {
          category: "PEST_PREVENTION",
          titleEn: "Paddy Blast & Neck Blast Protection",
          titleKn: "ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣ",
          bodyEn: "Spray Tricyclazole 75% WP (0.6g/L) on panicles during early morning or late evening.",
          bodyKn: "ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ ತಡೆಯಲು ಟ್ರೈಸೈಕ್ಲೋಜೋಲ್ (0.6 ಗ್ರಾಂ/ಲೀ) ಅನ್ನು ಬೆಳಗಿನ ಜಾವ ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಿಸಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "GRAIN_FILLING_RIPENING",
      nameEn: "Grain Filling & Ripening",
      nameKn: "ಕಾಳು ಗಟ್ಟಿಯಾಗುವ ಮತ್ತು ಮಾಗುವ ಹಂತ",
      startDay: 96,
      endDay: 115,
      descriptionEn: "Milky grains turn to solid dough and golden yellow. Prepare for harvest.",
      descriptionKn: "ಹಾಲು ತುಂಬಿದ ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗಿ ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ. ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧತೆ.",
      advisories: [
        {
          category: "IRRIGATION",
          titleEn: "Drain Water 10 Days Before Harvest",
          titleKn: "ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮುಂಚೆ ನೀರು ಬಸಿದುಬಿಡಿ",
          bodyEn: "Drain all standing water to allow uniform ripening and easy field movement during harvesting.",
          bodyKn: "ಏಕರೂಪದ ಮಾಗುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು ಯಂತ್ರಗಳ ಸುಲಭ ಚಲನೆಗಾಗಿ ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲೇ ನೀರು ಬಸಿದುಬಿಡಿ.",
          urgency: "MEDIUM",
        },
      ],
    },
  ],

  // Ragi / Finger Millet (ರಾಗಿ)
  ragi: [
    {
      key: "SOWING_GERMINATION",
      nameEn: "Sowing & Germination",
      nameKn: "ಬಿತ್ತನೆ ಮತ್ತು ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ",
      startDay: 0,
      endDay: 20,
      descriptionEn: "Seed germination and seedling establishment.",
      descriptionKn: "ಬೀಜ ಮೊಳಕೆಯೊಡೆದು ಸಸಿಗಳು ನೆಲೆಯೂರುವುದು.",
      advisories: [
        {
          category: "FERTILIZER",
          titleEn: "Basal Application of DAP/NPK",
          titleKn: "ಬುಡಕ್ಕೆ ಡಿಎಪಿ ಅಥವಾ ಎನ್‌ಪಿಕೆ ಗೊಬ್ಬರ",
          bodyEn: "Apply 40 kg DAP and 15 kg Potash per acre during land preparation.",
          bodyKn: "ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಎಕರೆಗೆ 40 ಕೆಜಿ ಡಿಎಪಿ ಮತ್ತು 15 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "TILLERING_INTERCULTURE",
      nameEn: "Tillering & Inter-Cultivation",
      nameKn: "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಎಡೆಕುಂಟೆ ಹೊಡೆಯುವುದು",
      startDay: 21,
      endDay: 45,
      descriptionEn: "Weeding and inter-cultivation to aerate the soil and multiply tillers.",
      descriptionKn: "ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಹೆಚ್ಚಿನ ಕವಲುಗಳನ್ನು ಪಡೆಯುವುದು.",
      advisories: [
        {
          category: "IRRIGATION",
          titleEn: "Inter-cultivation & Earthing Up",
          titleKn: "ಎಡೆಕುಂಟೆ ಹೊಡೆದು ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ",
          bodyEn: "Pass light plough/kunte to control weeds and conserve soil moisture.",
          bodyKn: "ಕಳೆ ನಿಯಂತ್ರಿಸಲು ಮತ್ತು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉಳಿಸಲು ಎಡೆಕುಂಟೆ ಹೊಡೆಯಿರಿ.",
          urgency: "MEDIUM",
        },
        {
          category: "FERTILIZER",
          titleEn: "Urea Top Dressing",
          titleKn: "ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ",
          bodyEn: "Apply 20 kg Urea per acre when soil has adequate moisture.",
          bodyKn: "ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿದ್ದಾಗ ಪ್ರತಿ ಎಕರೆಗೆ 20 ಕೆಜಿ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ ನೀಡಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "HEADING_GRAIN_FORMATION",
      nameEn: "Earhead Emergence & Grain Formation",
      nameKn: "ತೆನೆ ಮೂಡುವ ಮತ್ತು ಕಾಳು ಕಟ್ಟುವ ಹಂತ",
      startDay: 46,
      endDay: 80,
      descriptionEn: "Finger earheads emerge and grain formation begins.",
      descriptionKn: "ರಾಗಿ ಗೊನೆಗಳು ಹೊರಬಂದು ಕಾಳು ತುಂಬುವ ಹಂತ.",
      advisories: [
        {
          category: "PEST_PREVENTION",
          titleEn: "Ragi Blast & Earhead Caterpillar",
          titleKn: "ರಾಗಿ ಬೆಂಕಿ ರೋಗ & ತೆನೆ ಕೀಟ ನಿಯಂತ್ರಣ",
          bodyEn: "Check for blast spots on earheads. Spray Mancozeb 75% WP (2g/L) if cloudy weather persists.",
          bodyKn: "ತೆನೆ ಬೆಂಕಿ ರೋಗ ಕಂಡುಬಂದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ (2 ಗ್ರಾಂ/ಲೀ) ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "MATURITY_HARVEST",
      nameEn: "Maturity & Harvesting",
      nameKn: "ಬಲಿತ ಹಂತ ಮತ್ತು ಕೊಯ್ಲು",
      startDay: 81,
      endDay: 110,
      descriptionEn: "Earheads turn brown and grains harden.",
      descriptionKn: "ಗೊನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗುವುದು.",
      advisories: [
        {
          category: "WEATHER_ALERT",
          titleEn: "Harvest on Sunny Dry Day",
          titleKn: "ಬಿಸಿಲಿನ ಒಣ ದಿನದಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಿ",
          bodyEn: "Cut earheads when 90% turn brown. Dry under sun to reach 12% moisture before threshing.",
          bodyKn: "90% ಗೊನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡಿ 12% ತೇವಾಂಶ ಬರುವವರೆಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
          urgency: "MEDIUM",
        },
      ],
    },
  ],

  // Tomato (ಟೊಮೇಟೊ)
  tomato: [
    {
      key: "TRANSPLANTING_ESTABLISHMENT",
      nameEn: "Transplanting & Establishment",
      nameKn: "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
      startDay: 0,
      endDay: 20,
      descriptionEn: "Seedlings establish root structure after transplanting to the main field.",
      descriptionKn: "ಮುಖ್ಯ ಗದ್ದೆಗೆ ನಾಟಿ ಮಾಡಿದ ನಂತರ ಸಸಿಗಳು ಬೇರೂರುವ ಹಂತ.",
      advisories: [
        {
          category: "IRRIGATION",
          titleEn: "Light Drip Irrigation Daily",
          titleKn: "ದಿನವೂ ಲಘು ಹನಿ ನೀರಾವರಿ",
          bodyEn: "Maintain consistent moisture without waterlogging to encourage deep rooting.",
          bodyKn: "ಬೇರುಗಳು ಆಳಕ್ಕೆ ಇಳಿಯಲು ನೀರು ನಿಲ್ಲದಂತೆ ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಹಿತವಾದ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
          urgency: "MEDIUM",
        },
        {
          category: "PEST_PREVENTION",
          titleEn: "Whitefly & Leaf Curl Protection",
          titleKn: "ಬಿಳಿ ನೊಣ & ಎಲೆ ಮುದುರು ರೋಗ ತಡೆ",
          bodyEn: "Install yellow sticky traps (10/acre) to trap whiteflies carrying leaf curl virus.",
          bodyKn: "ಎಲೆ ಮುದುರು ವೈರಸ್ ಹರಡುವ ಬಿಳಿ ನೊಣಗಳನ್ನು ಹಿಡಿಯಲು ಎಕರೆಗೆ 10 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "VEGETATIVE_STAKING",
      nameEn: "Vegetative Growth & Staking",
      nameKn: "ಕಾಯಿಕ ಬೆಳವಣಿಗೆ & ಕಡ್ಡಿ ಕಟ್ಟುವುದು",
      startDay: 21,
      endDay: 40,
      descriptionEn: "Rapid shoot branching and bamboo staking for support.",
      descriptionKn: "ವೇಗದ ಕವಲು ಬೆಳವಣಿಗೆ ಮತ್ತು ಗಿಡಗಳಿಗೆ ಬಿದಿರಿನ ಕಡ್ಡಿಗಳ ಬೆಂಬಲ ನೀಡುವುದು.",
      advisories: [
        {
          category: "FERTILIZER",
          titleEn: "Water-Soluble 19:19:19 Fertigation",
          titleKn: "19:19:19 ಕರಗುವ ಗೊಬ್ಬರ ನೀಡುವುದು",
          bodyEn: "Apply 19:19:19 (3 kg/acre) through drip twice weekly to build strong foliage.",
          bodyKn: "ಉತ್ತಮ ಕವಲುಗಳಿಗೆ ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ 3 ಕೆಜಿ 19:19:19 ಗೊಬ್ಬರವನ್ನು ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ನೀಡಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "FLOWERING_FRUIT_SET",
      nameEn: "Flowering & Fruit Setting",
      nameKn: "ಹೂವಾಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
      startDay: 41,
      endDay: 65,
      descriptionEn: "Yellow blossoms set into small green fruits. Calcium and boron are critical.",
      descriptionKn: "ಹಳದಿ ಹೂಗಳು ಸಣ್ಣ ಹಸಿರು ಕಾಯಿಗಳಾಗಿ ಪರಿವರ್ತನೆಯಾಗುವ ಹಂತ.",
      advisories: [
        {
          category: "FERTILIZER",
          titleEn: "Calcium Nitrate & Boron Spray",
          titleKn: "ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ & ಬೋರಾನ್ ಸಿಂಪಡಣೆ",
          bodyEn: "Spray Calcium Nitrate (2g/L) + Boron (1g/L) to prevent Blossom End Rot (black bottoms).",
          bodyKn: "ಕಾಯಿ ಕೊಳೆಯುವುದು ಮತ್ತು ಒಡೆಯುವುದನ್ನು ತಡೆಯಲು ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ (2 ಗ್ರಾಂ/ಲೀ) + ಬೋರಾನ್ (1 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
          urgency: "HIGH",
        },
        {
          category: "PEST_PREVENTION",
          titleEn: "Early Blight & Fruit Borer Watch",
          titleKn: "ಮುಂಚಿನ ಬೆಂಕಿ ರೋಗ & ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು",
          bodyEn: "If concentric rings appear on lower leaves, spray Azoxystrobin + Difenoconazole (1 ml/L).",
          bodyKn: "ಕೆಳ ಎಲೆಗಳಲ್ಲಿ ಕಂದು ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು ಕಂಡರೆ ಅಜಾಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ (1 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.",
          urgency: "HIGH",
        },
      ],
    },
    {
      key: "FRUIT_DEVELOPMENT_HARVEST",
      nameEn: "Fruit Development & Plucking",
      nameKn: "ಹಣ್ಣು ಬೆಳೆಯುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು",
      startDay: 66,
      endDay: 120,
      descriptionEn: "Fruits attain mature size and turn pink to red.",
      descriptionKn: "ಟೊಮೇಟೊ ಕಾಯಿಗಳು ಬಲಿತು ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.",
      advisories: [
        {
          category: "FERTILIZER",
          titleEn: "Potassium Booster 0:0:50 Fertigation",
          titleKn: "0:0:50 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ",
          bodyEn: "Apply 0:0:50 (SOP) 3 kg/acre weekly to give deep red color and shiny fruit skin.",
          bodyKn: "ಹಣ್ಣಿಗೆ ಗಾಢ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ತೂಕ ಬರಲು ವಾರಕ್ಕೆ 3 ಕೆಜಿ 0:0:50 ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.",
          urgency: "MEDIUM",
        },
      ],
    },
  ],
}

/**
 * Returns the growth stages defined for a given crop.
 */
export function getStagesForCrop(cropName: string): GrowthStageDef[] {
  const norm = cropName.toLowerCase()
  if (norm.includes("ragi") || norm.includes("finger millet")) {
    return CROP_STAGE_DEFINITIONS.ragi
  }
  if (norm.includes("tomato")) {
    return CROP_STAGE_DEFINITIONS.tomato
  }
  if (norm.includes("rice") || norm.includes("paddy")) {
    return CROP_STAGE_DEFINITIONS.rice
  }
  return CROP_STAGE_DEFINITIONS.rice
}

/**
 * Gets or calculates the current growth stage for a crop field
 */
export function getCropGrowthStage(cropName: string, daysSinceSowing: number): GrowthStageDef {
  const stages = getStagesForCrop(cropName)

  // Find stage matching daysSinceSowing
  for (const s of stages) {
    if (daysSinceSowing >= s.startDay && daysSinceSowing <= s.endDay) {
      return s
    }
  }

  // Default to final stage if past end
  return stages[stages.length - 1]
}

/**
 * Generates tailored agronomic advice based on farmer's voice/text question
 * evaluated in the context of their active crop and current growth stage!
 */
export function generateStageAwareAdvice(params: {
  cropName: string
  currentStage: GrowthStageDef
  daysSinceSowing: number
  farmerQuery: string
  language?: string
}): { adviceEn: string; adviceKn: string; urgency: "LOW" | "MEDIUM" | "HIGH" } {
  const { cropName, currentStage, daysSinceSowing, farmerQuery, language } = params
  const q = farmerQuery.toLowerCase()

  // 1. Water / Irrigation concerns
  if (q.includes("water") || q.includes("ನೀರು") || q.includes("irrigation") || q.includes("ಒಣಗು")) {
    return {
      adviceEn: `For ${cropName} in the ${currentStage.nameEn} stage (Day ${daysSinceSowing}): Maintain regular moisture. ${currentStage.advisories[0]?.bodyEn || "Avoid waterlogging and excessive moisture stress."}`,
      adviceKn: `${cropName} ಬೆಳೆಗೆ ${currentStage.nameKn} ಹಂತದಲ್ಲಿ (ದಿನ ${daysSinceSowing}): ಮಣ್ಣಿನಲ್ಲಿ ಹಿತವಾದ ತೇವಾಂಶ ಕಾಪಾಡಿ. ${currentStage.advisories[0]?.bodyKn || "ಹೆಚ್ಚು ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ."}`,
      urgency: "MEDIUM",
    }
  }

  // 2. Yellow Leaves / Disease / Pest concerns
  if (
    q.includes("yellow") ||
    q.includes("ಹಳದಿ") ||
    q.includes("pest") ||
    q.includes("ಕೀಟ") ||
    q.includes("ರೋಗ") ||
    q.includes("worm") ||
    q.includes("ಹುಳು")
  ) {
    const pestAdv = currentStage.advisories.find((a) => a.category === "PEST_PREVENTION")
    return {
      adviceEn: `In ${currentStage.nameEn} stage of ${cropName}: Yellowing is commonly caused by nitrogen deficiency or early borer activity. ${pestAdv?.bodyEn || "Spray Neem oil (5ml/L) and ensure proper drainage."}`,
      adviceKn: `${cropName} ನ ${currentStage.nameKn} ಹಂತದಲ್ಲಿ: ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು ನೈಟ್ರೋಜನ್ ಕೊರತೆ ಅಥವಾ ಕೀಟದ ಲಕ್ಷಣ. ${pestAdv?.bodyKn || "5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆಯನ್ನು ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ."}`,
      urgency: "HIGH",
    }
  }

  // 3. Fertilizer / Growth booster concerns
  if (
    q.includes("fertilizer") ||
    q.includes("ಗೊಬ್ಬರ") ||
    q.includes("urea") ||
    q.includes("ಯೂರಿಯಾ") ||
    q.includes("spray") ||
    q.includes("ಸಿಂಪಡಣೆ")
  ) {
    const fertAdv = currentStage.advisories.find((a) => a.category === "FERTILIZER")
    return {
      adviceEn: `Recommended nutrients for ${cropName} at ${currentStage.nameEn} (Day ${daysSinceSowing}): ${fertAdv?.bodyEn || "Apply balanced NPK with organic compost."}`,
      adviceKn: `${cropName} ಗೆ ${currentStage.nameKn} ಹಂತದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಿದ ಪೋಷಕಾಂಶ: ${fertAdv?.bodyKn || "ಸಮತೋಲಿತ ಎನ್‌ಪಿಕೆ ಗೊಬ್ಬರವನ್ನು ನೀಡಿ."}`,
      urgency: "MEDIUM",
    }
  }

  // General stage-tailored answer
  return {
    adviceEn: `Your ${cropName} is currently in the ${currentStage.nameEn} stage (Day ${daysSinceSowing}). Key focus today: ${currentStage.advisories[0]?.titleEn} — ${currentStage.advisories[0]?.bodyEn}`,
    adviceKn: `ನಿಮ್ಮ ${cropName} ಬೆಳೆಯು ಪ್ರಸ್ತುತ ${currentStage.nameKn} ಹಂತದಲ್ಲಿದೆ (ದಿನ ${daysSinceSowing}). ಇಂದಿನ ಮುಖ್ಯ ಸಲಹೆ: ${currentStage.advisories[0]?.titleKn} — ${currentStage.advisories[0]?.bodyKn}`,
    urgency: "LOW",
  }
}

