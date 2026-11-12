// ==============================================================================
// Crop to AGMARKNET Government Commodity Name Mapping
// Maps vernacular and application crop names to official government commodity strings.
// ==============================================================================

export interface CropMappingInfo {
  canonicalName: string
  govtCommodityNames: string[] // List of commodity names as registered on data.gov.in
  kannadaName: string
}

export const CROP_MAPPINGS: Record<string, CropMappingInfo> = {
  rice: {
    canonicalName: "Rice",
    govtCommodityNames: [
      "Paddy(Common)",
      "Paddy(Dhan)(Common)",
      "Rice",
      "Paddy(Dhan)(Basmati)",
      "Paddy(Dhan)",
    ],
    kannadaName: "ಭತ್ತ / ಅಕ್ಕಿ",
  },
  paddy: {
    canonicalName: "Paddy",
    govtCommodityNames: [
      "Paddy(Common)",
      "Paddy(Dhan)(Common)",
      "Paddy(Dhan)(Basmati)",
      "Rice",
    ],
    kannadaName: "ಭತ್ತ",
  },
  tomato: {
    canonicalName: "Tomato",
    govtCommodityNames: ["Tomato"],
    kannadaName: "ಟೊಮ್ಯಾಟೊ",
  },
  ragi: {
    canonicalName: "Ragi",
    govtCommodityNames: ["Ragi(Finger Millet)", "Ragi", "Finger Millet"],
    kannadaName: "ರಾಗಿ",
  },
  onion: {
    canonicalName: "Onion",
    govtCommodityNames: ["Onion", "Onion Green"],
    kannadaName: "ಈರುಳ್ಳಿ",
  },
  potato: {
    canonicalName: "Potato",
    govtCommodityNames: ["Potato"],
    kannadaName: "ಆಲೂಗಡ್ಡೆ",
  },
  chilli: {
    canonicalName: "Green Chilli",
    govtCommodityNames: ["Green Chilli", "Chilly Capsicum", "Dry Chillies", "Capsicum"],
    kannadaName: "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
  },
  "green chilli": {
    canonicalName: "Green Chilli",
    govtCommodityNames: ["Green Chilli", "Chilly Capsicum", "Capsicum"],
    kannadaName: "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
  },
  capsicum: {
    canonicalName: "Capsicum",
    govtCommodityNames: ["Capsicum", "Chilly Capsicum"],
    kannadaName: "ದೊಡ್ಡ ಮೆಣಸಿನಕಾಯಿ",
  },
  maize: {
    canonicalName: "Maize",
    govtCommodityNames: ["Maize"],
    kannadaName: "ಮೆಕ್ಕೆಜೋಳ",
  },
  wheat: {
    canonicalName: "Wheat",
    govtCommodityNames: ["Wheat"],
    kannadaName: "ಗೋಧಿ",
  },
  cabbage: {
    canonicalName: "Cabbage",
    govtCommodityNames: ["Cabbage"],
    kannadaName: "ಎಲೆಕೋಸು",
  },
  cauliflower: {
    canonicalName: "Cauliflower",
    govtCommodityNames: ["Cauliflower"],
    kannadaName: "ಹೂಕೋಸು",
  },
  beans: {
    canonicalName: "Beans",
    govtCommodityNames: ["Beans", "French Beans (Frasbean)", "Cluster beans"],
    kannadaName: "ಹುರುಳಿಕಾಯಿ",
  },
  brinjal: {
    canonicalName: "Brinjal",
    govtCommodityNames: ["Brinjal"],
    kannadaName: "ಬದನೆಕಾಯಿ",
  },
  radish: {
    canonicalName: "Radish",
    govtCommodityNames: ["Raddish", "Radish"],
    kannadaName: "ಮೂಲಂಗಿ",
  },
  cotton: {
    canonicalName: "Cotton",
    govtCommodityNames: ["Cotton"],
    kannadaName: "ಹತ್ತಿ",
  },
  sugarcane: {
    canonicalName: "Sugarcane",
    govtCommodityNames: ["Sugarcane", "Gur(Jaggery)"],
    kannadaName: "ಕಬ್ಬು",
  },
  banana: {
    canonicalName: "Banana",
    govtCommodityNames: ["Banana", "Banana - Green"],
    kannadaName: "ಬಾಳೆಹಣ್ಣು",
  },
  coconut: {
    canonicalName: "Coconut",
    govtCommodityNames: ["Coconut", "Tender Coconut", "Copra"],
    kannadaName: "ತೆಂಗಿನಕಾಯಿ",
  },
  arecanut: {
    canonicalName: "Arecanut",
    govtCommodityNames: ["Arecanut(Betelnut/Supari)", "Arecanut"],
    kannadaName: "ಅಡಿಕೆ",
  },
  groundnut: {
    canonicalName: "Groundnut",
    govtCommodityNames: ["Groundnut", "Ground Nut Seed", "Groundnut (Split)"],
    kannadaName: "ಶೇಂಗಾ / ನೆಲಗಡಲೆ",
  },
  jowar: {
    canonicalName: "Jowar",
    govtCommodityNames: ["Jowar(Sorghum)", "Jowar"],
    kannadaName: "ಜೋಳ",
  },
  bajra: {
    canonicalName: "Bajra",
    govtCommodityNames: ["Bajra(Pearl Millet/Cumbu)", "Bajra"],
    kannadaName: "ಸಜ್ಜೆ",
  },
  tur: {
    canonicalName: "Tur / Red Gram",
    govtCommodityNames: ["Red gram/Arhar/Tur(whole)", "Arhar (Tur/Red Gram)(Whole)", "Arhar Dal(Tur Dal)"],
    kannadaName: "ತೊಗರಿ ಬೇಳೆ",
  },
  "green gram": {
    canonicalName: "Green Gram",
    govtCommodityNames: ["Green Gram(Moong)(Whole)", "Green Gram (Moong)(Whole)"],
    kannadaName: "ಹೆಸರು ಕಾಳು",
  },
  "bengal gram": {
    canonicalName: "Bengal Gram",
    govtCommodityNames: ["Bengal Gram(Gram)(Whole)", "Bengal Gram Dal (Chana Dal)"],
    kannadaName: "ಕಡಲೆ ಕಾಳು",
  },
}

/**
 * Resolves a crop input string to official AGMARKNET commodity filter candidates.
 */
export function resolveGovtCommodityNames(cropInput?: string): string[] {
  if (!cropInput || cropInput.toLowerCase() === "all") return []

  const clean = cropInput.toLowerCase().trim()
  if (CROP_MAPPINGS[clean]) {
    return CROP_MAPPINGS[clean].govtCommodityNames
  }

  // Strip parentheticals e.g. "Rice (Paddy)" -> "rice paddy" and test tokens
  const stripped = clean.replace(/[()]/g, " ").replace(/\s+/g, " ").trim()
  if (CROP_MAPPINGS[stripped]) {
    return CROP_MAPPINGS[stripped].govtCommodityNames
  }

  // Check if clean matches any key word or substring (prefer exact word match first)
  const words = stripped.split(" ")
  for (const w of words) {
    if (CROP_MAPPINGS[w]) {
      return CROP_MAPPINGS[w].govtCommodityNames
    }
  }

  for (const [key, mapping] of Object.entries(CROP_MAPPINGS)) {
    if (stripped.includes(key) || key.includes(stripped)) {
      return mapping.govtCommodityNames
    }
  }

  // Default to the original string as a literal commodity
  return [cropInput.trim()]
}

