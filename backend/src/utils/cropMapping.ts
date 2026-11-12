// ==============================================================================
// Crop to AGMARKNET Government Commodity Name Mapping
// Maps vernacular and application crop names to official government commodity strings.
// ==============================================================================

export interface CropMappingInfo {
  canonicalName: string
  govtCommodityNames: string[] // List of commodity names as registered on data.gov.in
  kannadaName: string
  aliases?: string[]
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
    aliases: ["ಭತ್ತ", "ಅಕ್ಕಿ", "paddy"],
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
    aliases: ["ಭತ್ತ"],
  },
  tomato: {
    canonicalName: "Tomato",
    govtCommodityNames: ["Tomato"],
    kannadaName: "ಟೊಮ್ಯಾಟೊ",
    aliases: ["ಟೊಮ್ಯಾಟೊ", "ಟೊಮೆಟೊ", "ಟೊಮೇಟೊ"],
  },
  ragi: {
    canonicalName: "Ragi",
    govtCommodityNames: ["Ragi(Finger Millet)", "Ragi", "Finger Millet"],
    kannadaName: "ರಾಗಿ",
    aliases: ["ರಾಗಿ", "finger millet"],
  },
  onion: {
    canonicalName: "Onion",
    govtCommodityNames: ["Onion", "Onion Green"],
    kannadaName: "ಈರುಳ್ಳಿ",
    aliases: ["ಈರುಳ್ಳಿ", "ಉಳ್ಳಾಗಡ್ಡಿ"],
  },
  potato: {
    canonicalName: "Potato",
    govtCommodityNames: ["Potato"],
    kannadaName: "ಆಲೂಗಡ್ಡೆ",
    aliases: ["ಆಲೂಗಡ್ಡೆ", "ಬಟಾಟೆ"],
  },
  chilli: {
    canonicalName: "Green Chilli",
    govtCommodityNames: ["Green Chilli", "Chilly Capsicum", "Dry Chillies", "Capsicum"],
    kannadaName: "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
    aliases: ["ಮೆಣಸಿನಕಾಯಿ", "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ", "ಹಸಿ ಮೆಣಸಿನಕಾಯಿ"],
  },
  "green chilli": {
    canonicalName: "Green Chilli",
    govtCommodityNames: ["Green Chilli", "Chilly Capsicum", "Capsicum"],
    kannadaName: "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
    aliases: ["ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ", "ಮೆಣಸಿನಕಾಯಿ"],
  },
  capsicum: {
    canonicalName: "Capsicum",
    govtCommodityNames: ["Capsicum", "Chilly Capsicum"],
    kannadaName: "ದೊಡ್ಡ ಮೆಣಸಿನಕಾಯಿ",
    aliases: ["ದೊಡ್ಡ ಮೆಣಸಿನಕಾಯಿ", "ಕ್ಯಾಪ್ಸಿಕಂ"],
  },
  maize: {
    canonicalName: "Maize",
    govtCommodityNames: ["Maize"],
    kannadaName: "ಮೆಕ್ಕೆಜೋಳ",
    aliases: ["ಮೆಕ್ಕೆಜೋಳ", "ಮೆಕ್ಕೆ ಜೋಳ"],
  },
  wheat: {
    canonicalName: "Wheat",
    govtCommodityNames: ["Wheat"],
    kannadaName: "ಗೋಧಿ",
    aliases: ["ಗೋಧಿ"],
  },
  cabbage: {
    canonicalName: "Cabbage",
    govtCommodityNames: ["Cabbage"],
    kannadaName: "ಎಲೆಕೋಸು",
    aliases: ["ಎಲೆಕೋಸು", "ಕೋಸುಗಡ್ಡೆ"],
  },
  cauliflower: {
    canonicalName: "Cauliflower",
    govtCommodityNames: ["Cauliflower"],
    kannadaName: "ಹೂಕೋಸು",
    aliases: ["ಹೂಕೋಸು"],
  },
  beans: {
    canonicalName: "Beans",
    govtCommodityNames: ["Beans", "French Beans (Frasbean)", "Cluster beans"],
    kannadaName: "ಹುರುಳಿಕಾಯಿ",
    aliases: ["ಹುರುಳಿಕಾಯಿ", "ಬೀನ್ಸ್"],
  },
  brinjal: {
    canonicalName: "Brinjal",
    govtCommodityNames: ["Brinjal"],
    kannadaName: "ಬದನೆಕಾಯಿ",
    aliases: ["ಬದನೆಕಾಯಿ"],
  },
  radish: {
    canonicalName: "Radish",
    govtCommodityNames: ["Raddish", "Radish"],
    kannadaName: "ಮೂಲಂಗಿ",
    aliases: ["ಮೂಲಂಗಿ"],
  },
  cotton: {
    canonicalName: "Cotton",
    govtCommodityNames: ["Cotton"],
    kannadaName: "ಹತ್ತಿ",
    aliases: ["ಹತ್ತಿ"],
  },
  sugarcane: {
    canonicalName: "Sugarcane",
    govtCommodityNames: ["Sugarcane", "Gur(Jaggery)"],
    kannadaName: "ಕಬ್ಬು",
    aliases: ["ಕಬ್ಬು", "ಬೆಲ್ಲ"],
  },
  banana: {
    canonicalName: "Banana",
    govtCommodityNames: ["Banana", "Banana - Green"],
    kannadaName: "ಬಾಳೆಹಣ್ಣು",
    aliases: ["ಬಾಳೆಹಣ್ಣು", "ಬಾಳೆ"],
  },
  coconut: {
    canonicalName: "Coconut",
    govtCommodityNames: ["Coconut", "Tender Coconut", "Copra"],
    kannadaName: "ತೆಂಗಿನಕಾಯಿ",
    aliases: ["ತೆಂಗಿನಕಾಯಿ", "ತೆಂಗು", "ಕೊಬ್ಬರಿ"],
  },
  arecanut: {
    canonicalName: "Arecanut",
    govtCommodityNames: ["Arecanut(Betelnut/Supari)", "Arecanut"],
    kannadaName: "ಅಡಿಕೆ",
    aliases: ["ಅಡಿಕೆ"],
  },
  groundnut: {
    canonicalName: "Groundnut",
    govtCommodityNames: ["Groundnut", "Ground Nut Seed", "Groundnut (Split)"],
    kannadaName: "ಶೇಂಗಾ / ನೆಲಗಡಲೆ",
    aliases: ["ಶೇಂಗಾ", "ನೆಲಗಡಲೆ", "ಕಡಲೆಕಾಯಿ"],
  },
  jowar: {
    canonicalName: "Jowar",
    govtCommodityNames: ["Jowar(Sorghum)", "Jowar"],
    kannadaName: "ಜೋಳ",
    aliases: ["ಜೋಳ"],
  },
  bajra: {
    canonicalName: "Bajra",
    govtCommodityNames: ["Bajra(Pearl Millet/Cumbu)", "Bajra"],
    kannadaName: "ಸಜ್ಜೆ",
    aliases: ["ಸಜ್ಜೆ"],
  },
  tur: {
    canonicalName: "Tur / Red Gram",
    govtCommodityNames: ["Red gram/Arhar/Tur(whole)", "Arhar (Tur/Red Gram)(Whole)", "Arhar Dal(Tur Dal)"],
    kannadaName: "ತೊಗರಿ ಬೇಳೆ",
    aliases: ["ತೊಗರಿ", "ತೊಗರಿ ಬೇಳೆ", "red gram"],
  },
  "green gram": {
    canonicalName: "Green Gram",
    govtCommodityNames: ["Green Gram(Moong)(Whole)", "Green Gram (Moong)(Whole)"],
    kannadaName: "ಹೆಸರು ಕಾಳು",
    aliases: ["ಹೆಸರು ಕಾಳು", "ಹೆಸರುಬೇಳೆ"],
  },
  "bengal gram": {
    canonicalName: "Bengal Gram",
    govtCommodityNames: ["Bengal Gram(Gram)(Whole)", "Bengal Gram Dal (Chana Dal)"],
    kannadaName: "ಕಡಲೆ ಕಾಳು",
    aliases: ["ಕಡಲೆ ಕಾಳು", "ಕಡಲೆ"],
  },
  soybean: {
    canonicalName: "Soybean",
    govtCommodityNames: ["Soyabean", "Soybean"],
    kannadaName: "ಸೋಯಾಬೀನ್",
    aliases: ["ಸೋಯಾಬೀನ್", "soyabean"],
  },
  ginger: {
    canonicalName: "Ginger",
    govtCommodityNames: ["Ginger(Green)", "Ginger(Dry)"],
    kannadaName: "ಶುಂಠಿ",
    aliases: ["ಶುಂಠಿ"],
  },
  garlic: {
    canonicalName: "Garlic",
    govtCommodityNames: ["Garlic"],
    kannadaName: "ಬೆಳ್ಳುಳ್ಳಿ",
    aliases: ["ಬೆಳ್ಳುಳ್ಳಿ"],
  },
}

/**
 * Resolves a crop input string (English or Kannada) to official AGMARKNET commodity filter candidates.
 */
export function resolveGovtCommodityNames(cropInput?: string): string[] {
  if (!cropInput || cropInput.toLowerCase() === "all") return []

  const clean = cropInput.toLowerCase().trim()
  if (CROP_MAPPINGS[clean]) {
    return CROP_MAPPINGS[clean].govtCommodityNames
  }

  // Match Kannada script aliases and canonical names directly
  for (const mapping of Object.values(CROP_MAPPINGS)) {
    const knParts = mapping.kannadaName.split("/").map((p) => p.trim().toLowerCase())
    const allAliases = [
      mapping.canonicalName.toLowerCase(),
      ...knParts,
      ...(mapping.aliases || []).map((a) => a.toLowerCase()),
    ]
    if (allAliases.includes(clean)) {
      return mapping.govtCommodityNames
    }
  }

  // Strip parentheticals e.g. "Rice (Paddy)" -> "rice paddy" and test tokens
  const stripped = clean.replace(/[()]/g, " ").replace(/\s+/g, " ").trim()
  if (CROP_MAPPINGS[stripped]) {
    return CROP_MAPPINGS[stripped].govtCommodityNames
  }

  // Check if stripped matches any key word or alias substring (exact word/alias first)
  const words = stripped.split(" ")
  for (const w of words) {
    if (CROP_MAPPINGS[w]) {
      return CROP_MAPPINGS[w].govtCommodityNames
    }
    for (const mapping of Object.values(CROP_MAPPINGS)) {
      const knParts = mapping.kannadaName.split("/").map((p) => p.trim().toLowerCase())
      if (
        knParts.includes(w) ||
        (mapping.aliases || []).some((a) => a.toLowerCase() === w)
      ) {
        return mapping.govtCommodityNames
      }
    }
  }

  for (const [key, mapping] of Object.entries(CROP_MAPPINGS)) {
    const knParts = mapping.kannadaName.split("/").map((p) => p.trim().toLowerCase())
    const extraAliases = (mapping.aliases || []).map((a) => a.toLowerCase())
    if (
      stripped.includes(key) ||
      key.includes(stripped) ||
      knParts.some((k) => stripped.includes(k) || k.includes(stripped)) ||
      extraAliases.some((a) => stripped.includes(a) || a.includes(stripped))
    ) {
      return mapping.govtCommodityNames
    }
  }

  // Default to the original string as a literal commodity
  return [cropInput.trim()]
}

