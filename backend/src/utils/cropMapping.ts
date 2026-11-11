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
    govtCommodityNames: ["Paddy(Dhan)(Common)", "Rice", "Paddy(Dhan)(Basmati)"],
    kannadaName: "ಭತ್ತ / ಅಕ್ಕಿ",
  },
  paddy: {
    canonicalName: "Paddy",
    govtCommodityNames: ["Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)", "Rice"],
    kannadaName: "ಭತ್ತ",
  },
  tomato: {
    canonicalName: "Tomato",
    govtCommodityNames: ["Tomato"],
    kannadaName: "ಟೊಮ್ಯಾಟೊ",
  },
  ragi: {
    canonicalName: "Ragi",
    govtCommodityNames: ["Ragi", "Finger Millet"],
    kannadaName: "ರಾಗಿ",
  },
  onion: {
    canonicalName: "Onion",
    govtCommodityNames: ["Onion"],
    kannadaName: "ಈರುಳ್ಳಿ",
  },
  potato: {
    canonicalName: "Potato",
    govtCommodityNames: ["Potato"],
    kannadaName: "ಆಲೂಗಡ್ಡೆ",
  },
  chilli: {
    canonicalName: "Green Chilli",
    govtCommodityNames: ["Green Chilli", "Chilly Capsicum"],
    kannadaName: "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
  },
  "green chilli": {
    canonicalName: "Green Chilli",
    govtCommodityNames: ["Green Chilli", "Chilly Capsicum"],
    kannadaName: "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
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
    govtCommodityNames: ["Beans"],
    kannadaName: "ಹುರುಳಿಕಾಯಿ",
  },
  brinjal: {
    canonicalName: "Brinjal",
    govtCommodityNames: ["Brinjal"],
    kannadaName: "ಬದನೆಕಾಯಿ",
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
    govtCommodityNames: ["Coconut"],
    kannadaName: "ತೆಂಗಿನಕಾಯಿ",
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

  // Check if clean matches any key substring
  for (const [key, mapping] of Object.entries(CROP_MAPPINGS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return mapping.govtCommodityNames
    }
  }

  // Default to the original string capitalized as a literal commodity
  return [cropInput.trim()]
}

