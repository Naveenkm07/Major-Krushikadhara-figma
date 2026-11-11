import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { extraEn, extraKn } from "./locales"

export type Lang = "en" | "kn"

const en = {
  x: extraEn,
  greeting: "Namaskara",
  userName: "Naveen Kumar km",
  userNameKn: "ನವೀನ್ ಕುಮಾರ್",
  langLabel: "EN / ಕನ್ನಡ",
  location: "Mandya, Karnataka",

  weather: {
    place: "Mandya",
    refresh: "Refresh",
    condition: "Sunny",
    humidity: "Humidity: 62%",
  },

  quickActions: {
    title: "Quick Actions",
    pest: "Pest Detection",
    market: "Market Prices",
    calendar: "Crop Calendar",
    equipment: "Equipment Rental",
    insurance: "Crop Insurance",
    schemes: "Govt Schemes",
  },

  tips: {
    title: "Today's Tips",
    viewAll: "View all",
    items: [
      {
        title: "Irrigation Reminder",
        body: "Check soil moisture before irrigating. Over-watering damages roots.",
      },
      {
        title: "Weather",
        body: "Clear skies expected for 3 days — good time for spraying operations.",
      },
      {
        title: "Pest Alert",
        body: "Yellow stem borer activity reported in your region. Monitor rice fields.",
      },
    ],
  },

  market: {
    title: "Market Prices",
    perKg: "/kg",
    crops: { tomato: "Tomato", ragi: "Ragi", onion: "Onion" },
  },

  nav: { home: "Home", scan: "Scan", insights: "Insights", schemes: "Schemes", profile: "Profile" },

  scan: {
    title: "Crop Scan",
    subtitle: "Point your camera at a plant to detect pests, diseases and crop health.",
    modes: { pest: "Pest & Disease", crop: "Identify Crop", leaf: "Leaf Health" },
    hint: "Align the plant inside the frame",
    scanNow: "Scan Now",
    gallery: "Gallery",
    recent: "Recent Scans",
    results: [
      { crop: "Tomato Leaf", result: "Early Blight detected" },
      { crop: "Rice Plant", result: "Healthy — no issues" },
      { crop: "Chilli Leaf", result: "Leaf Curl Virus" },
    ],
  },

  insights: {
    title: "Insights",
    subtitle: "Your farm performance at a glance.",
    stats: {
      yield: "Total Yield",
      revenue: "Revenue",
      crops: "Active Crops",
      water: "Water Saved",
      ready: "2 ready",
      vsYr: "vs last yr",
    },
    yieldTrend: "Yield Trend",
    yieldUp: "Up 18% this season",
    cropDist: "Crop Distribution",
    cropNames: { rice: "Rice", ragi: "Ragi", tomato: "Tomato", others: "Others" },
    money: "Income vs Expense",
    moneyUnit: "₹ in thousands",
    income: "Income",
    expense: "Expense",
    soil: "Soil Health",
    soilRows: {
      n: "Nitrogen (N)",
      p: "Phosphorus (P)",
      k: "Potassium (K)",
      moisture: "Moisture",
    },
  },

  profile: {
    title: "Profile",
    edit: "Edit",
    stats: { scans: "Scans", crops: "Crops", years: "Years" },
    myFarm: "My Farm",
    farm: {
      size: "Farm Size",
      sizeValue: "4.2 acres",
      crops: "Main Crops",
      cropsValue: "Rice, Ragi, Tomato",
      location: "Location",
      locationValue: "Mandya, Karnataka",
    },
    preferences: "Preferences",
    support: "Support",
    rows: {
      language: "Language",
      languageHint: "English / ಕನ್ನಡ",
      notifications: "Notifications",
      notificationsHint: "On",
      saved: "Saved Tips",
      insurance: "Crop Insurance",
      help: "Help & Support",
      about: "About KrushikaDhara",
      logout: "Log Out",
    },
    version: "KrushikaDhara · v1.0.0",
  },

  ins: {
    title: "Crop Insurance",
    subtitle: "Pradhan Mantri Fasal Bima Yojana",
    checkEligibility: "Check Eligibility",
    applyNow: "Apply Now",
    myPolicy: "My Policy",
    makeClaim: "Make a Claim",
    trackClaim: "Track Claim",
    documents: "Insurance Documents",
    importantDates: "Important Dates",
    dashboard: "Insurance Dashboard",
    help: "Help with Insurance",
    noPolicies: "No active crop insurance policy",
    noApplications: "No applications yet",
    noClaims: "No insurance claims yet",
    noDocs: "No insurance documents",
    startApp: "Start Application",
    reportLoss: "Report Crop Loss",
    viewPolicy: "View Policy",
    demoNote: "DEMO DATA — shown for demonstration. Real policy details will reflect actual enrollment.",
    eligible: "Eligible",
    notEligible: "Not Eligible",
    needsInfo: "Needs More Information",
    continuedApp: "Continue Application",
    submitApp: "Submit Application",
    submitClaim: "Submit Loss Report",
    trackApp: "Track Application",
    viewClaim: "View Claim",
    lossTypes: {
      drought: "Drought",
      flood: "Flood",
      hailstorm: "Hailstorm",
      pest: "Pest / Disease",
      storm: "Storm",
      other: "Other",
    },
    steps: {
      farmer: "Farmer Details",
      land: "Land Details",
      crop: "Crop Details",
      documents: "Documents",
      review: "Review & Submit",
    },
  },

  onboarding: {
    slides: [
      {
        title: "AI-Powered Plant Doctor",
        body: "Snap a photo of your crop. Our advanced AI detects pests, diseases, and nutritional deficiencies with 92% accuracy.",
      },
      {
        title: "Real-Time Mandi Prices",
        body: "Know the daily market prices of your crops before selling. Track price trends across Karnataka APMCs to maximize your profit.",
      },
      {
        title: "Govt Schemes Made Easy",
        body: "Discover PM-KISAN, PMFBY, Kisan Credit Card and more. Check your eligibility and apply in just a few taps.",
      },
    ],
    skip: "Skip",
    next: "Next",
    getStarted: "Get Started",
  },
}

const kn: typeof en = {
  x: extraKn,
  greeting: "ನಮಸ್ಕಾರ",
  userName: "ನವೀನ್ ಕುಮಾರ್",
  userNameKn: "ನವೀನ್ ಕುಮಾರ್",
  langLabel: "ಕನ್ನಡ / EN",
  location: "ಮಂಡ್ಯ, ಕರ್ನಾಟಕ",

  weather: {
    place: "ಮಂಡ್ಯ",
    refresh: "ನವೀಕರಿಸಿ",
    condition: "ಬಿಸಿಲು",
    humidity: "ಆರ್ದ್ರತೆ: 62%",
  },

  quickActions: {
    title: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    pest: "ಕೀಟ ಪತ್ತೆ",
    market: "ಮಾರುಕಟ್ಟೆ ದರ",
    calendar: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
    equipment: "ಯಂತ್ರ ಬಾಡಿಗೆ",
    insurance: "ಬೆಳೆ ವಿಮೆ",
    schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆ",
  },

  tips: {
    title: "ಇಂದಿನ ಸಲಹೆಗಳು",
    viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    items: [
      {
        title: "ನೀರಾವರಿ ಜ್ಞಾಪನೆ",
        body: "ನೀರು ಹಾಯಿಸುವ ಮುನ್ನ ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ. ಅತಿಯಾದ ನೀರು ಬೇರುಗಳಿಗೆ ಹಾನಿ ಮಾಡುತ್ತದೆ.",
      },
      {
        title: "ಹವಾಮಾನ",
        body: "ಮುಂದಿನ 3 ದಿನ ಸ್ಪಷ್ಟ ಆಕಾಶ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ — ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಸಮಯ.",
      },
      {
        title: "ಕೀಟ ಎಚ್ಚರಿಕೆ",
        body: "ನಿಮ್ಮ ಭಾಗದಲ್ಲಿ ಹಳದಿ ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟ ಕಂಡುಬಂದಿದೆ. ಭತ್ತದ ಗದ್ದೆಗಳನ್ನು ಗಮನಿಸಿ.",
      },
    ],
  },

  market: {
    title: "ಮಾರುಕಟ್ಟೆ ದರ",
    perKg: "/ಕೆಜಿ",
    crops: { tomato: "ಟೊಮೆಟೊ", ragi: "ರಾಗಿ", onion: "ಈರುಳ್ಳಿ" },
  },

  nav: { home: "ಮುಖಪುಟ", scan: "ಸ್ಕ್ಯಾನ್", insights: "ಒಳನೋಟ", schemes: "ಯೋಜನೆಗಳು", profile: "ಪ್ರೊಫೈಲ್" },

  scan: {
    title: "ಬೆಳೆ ಸ್ಕ್ಯಾನ್",
    subtitle: "ಕೀಟ, ರೋಗ ಮತ್ತು ಬೆಳೆಯ ಆರೋಗ್ಯ ಪತ್ತೆಹಚ್ಚಲು ಕ್ಯಾಮೆರಾವನ್ನು ಸಸ್ಯದತ್ತ ಹಿಡಿಯಿರಿ.",
    modes: { pest: "ಕೀಟ ಮತ್ತು ರೋಗ", crop: "ಬೆಳೆ ಗುರುತಿಸಿ", leaf: "ಎಲೆ ಆರೋಗ್ಯ" },
    hint: "ಚೌಕಟ್ಟಿನೊಳಗೆ ಸಸ್ಯವನ್ನು ಇರಿಸಿ",
    scanNow: "ಈಗ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    gallery: "ಗ್ಯಾಲರಿ",
    recent: "ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು",
    results: [
      { crop: "ಟೊಮೆಟೊ ಎಲೆ", result: "ಆರಂಭಿಕ ರೋಗ (Early Blight) ಪತ್ತೆಯಾಗಿದೆ" },
      { crop: "ಭತ್ತದ ಸಸ್ಯ", result: "ಆರೋಗ್ಯವಾಗಿದೆ — ಯಾವುದೇ ಸಮಸ್ಯೆಯಿಲ್ಲ" },
      { crop: "ಮೆಣಸಿನಕಾಯಿ ಎಲೆ", result: "ಎಲೆ ಮುದುಡು ರೋಗ" },
    ],
  },

  insights: {
    title: "ಒಳನೋಟ",
    subtitle: "ನಿಮ್ಮ ಕೃಷಿಯ ಸಂಪೂರ್ಣ ಚಿತ್ರಣ.",
    stats: {
      yield: "ಒಟ್ಟು ಇಳುವರಿ",
      revenue: "ಆದಾಯ",
      crops: "ಬೆಳೆಗಳು",
      water: "ಉಳಿಸಿದ ನೀರು",
      ready: "2 ಸಿದ್ಧ",
      vsYr: "ಹಿಂದಿನ ವರ್ಷಕ್ಕೆ ಹೋಲಿಸಿದರೆ",
    },
    yieldTrend: "ಇಳುವರಿ ಪ್ರವೃತ್ತಿ",
    yieldUp: "ಈ ಋತುವಿನಲ್ಲಿ 18% ಹೆಚ್ಚಳ",
    cropDist: "ಬೆಳೆ ವಿತರಣೆ",
    cropNames: { rice: "ಭತ್ತ", ragi: "ರಾಗಿ", tomato: "ಟೊಮೆಟೊ", others: "ಇತರ" },
    money: "ಆದಾಯ vs ವೆಚ್ಚ",
    moneyUnit: "₹ ಸಾವಿರಗಳಲ್ಲಿ",
    income: "ಆದಾಯ",
    expense: "ವೆಚ್ಚ",
    soil: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    soilRows: {
      n: "ಸಾರಜನಕ (N)",
      p: "ರಂಜಕ (P)",
      k: "ಪೊಟ್ಯಾಶ್ (K)",
      moisture: "ತೇವಾಂಶ",
    },
  },

  profile: {
    title: "ಪ್ರೊಫೈಲ್",
    edit: "ಬದಲಾಯಿಸಿ",
    stats: { scans: "ಸ್ಕ್ಯಾನ್‌ಗಳು", crops: "ಬೆಳೆಗಳು", years: "ವರ್ಷಗಳು" },
    myFarm: "ನನ್ನ ಹೊಲ",
    farm: {
      size: "ಹೊಲದ ವಿಸ್ತೀರ್ಣ",
      sizeValue: "4.2 ಎಕರೆ",
      crops: "ಮುಖ್ಯ ಬೆಳೆಗಳು",
      cropsValue: "ಭತ್ತ, ರಾಗಿ, ಟೊಮೆಟೊ",
      location: "ಸ್ಥಳ",
      locationValue: "ಮಂಡ್ಯ, ಕರ್ನಾಟಕ",
    },
    preferences: "ಆದ್ಯತೆಗಳು",
    support: "ಬೆಂಬಲ",
    rows: {
      language: "ಭಾಷೆ",
      languageHint: "ಕನ್ನಡ / English",
      notifications: "ಸೂಚನೆಗಳು",
      notificationsHint: "ಆನ್ ಆಗಿದೆ",
      saved: "ಉಳಿಸಿದ ಸಲಹೆಗಳು",
      insurance: "ಬೆಳೆ ವಿಮೆ",
      help: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
      about: "ಕೃಷಿಕಧಾರಾ ಬಗ್ಗೆ",
      logout: "ಲಾಗ್ ಔಟ್",
    },
    version: "ಕೃಷಿಕಧಾರಾ · v1.0.0",
  },

  onboarding: {
    slides: [
      {
        title: "AI ಬೆಳೆ ವೈದ್ಯ",
        body: "ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ. ನಮ್ಮ AI 92% ನಿಖರತೆಯಿಂದ ಕೀಟ, ರೋಗ ಮತ್ತು ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಪತ್ತೆ ಮಾಡುತ್ತದೆ.",
      },
      {
        title: "ನೇರ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
        body: "ನಿಮ್ಮ ಬೆಳೆಗಳ ನೈಜ-ಸಮಯ ಮಂಡಿ ದರ ತಿಳಿದು ಮಾರಾಟದ ಉತ್ತಮ ಸಮಯ ಆಯ್ಕೆ ಮಾಡಿ.",
      },
      {
        title: "ಸರ್ಕಾರಿ ಯೋಜನೆ ಸುಲಭ",
        body: "PM-KISAN, PMFBY, ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮತ್ತು ಇನ್ನಷ್ಟು ಕಂಡುಹಿಡಿಯಿರಿ — ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
      },
    ],
    skip: "ಬಿಟ್ಟುಬಿಡಿ",
    next: "ಮುಂದೆ",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
  },

  ins: {
    title: "ಬೆಳೆ ವಿಮೆ",
    subtitle: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
    checkEligibility: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    applyNow: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    myPolicy: "ನನ್ನ ಪಾಲಿಸಿ",
    makeClaim: "ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಿ",
    trackClaim: "ಕ್ಲೇಮ್ ಸ್ಥಿತಿ",
    documents: "ವಿಮೆ ದಾಖಲೆಗಳು",
    importantDates: "ಪ್ರಮುಖ ದಿನಾಂಕಗಳು",
    dashboard: "ವಿಮೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    help: "ವಿಮೆ ಸಹಾಯ",
    noPolicies: "ಯಾವುದೇ ಸಕ್ರಿಯ ಬೆಳೆ ವಿಮೆ ಇಲ್ಲ",
    noApplications: "ಇನ್ನೂ ಅರ್ಜಿ ಇಲ್ಲ",
    noClaims: "ಇನ್ನೂ ವಿಮೆ ಕ್ಲೇಮ್ ಇಲ್ಲ",
    noDocs: "ಯಾವುದೇ ವಿಮೆ ದಾಖಲೆ ಇಲ್ಲ",
    startApp: "ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ",
    reportLoss: "ಬೆಳೆ ನಷ್ಟ ವರದಿ",
    viewPolicy: "ಪಾಲಿಸಿ ನೋಡಿ",
    demoNote: "ಡೆಮೊ ಡೇಟಾ — ಪ್ರಾತ್ಯಕ್ಷಿಕೆಗಾಗಿ ತೋರಿಸಲಾಗಿದೆ. ನೈಜ ಪಾಲಿಸಿ ವಿವರ ನಿಜವಾದ ನೋಂದಣಿ ಆಧಾರದ ಮೇಲಿರುತ್ತದೆ.",
    eligible: "ಅರ್ಹ",
    notEligible: "ಅನರ್ಹ",
    needsInfo: "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಬೇಕು",
    continuedApp: "ಅರ್ಜಿ ಮುಂದುವರಿಸಿ",
    submitApp: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    submitClaim: "ನಷ್ಟ ವರದಿ ಸಲ್ಲಿಸಿ",
    trackApp: "ಅರ್ಜಿ ಟ್ರ್ಯಾಕ್",
    viewClaim: "ಕ್ಲೇಮ್ ನೋಡಿ",
    lossTypes: {
      drought: "ಬರ",
      flood: "ಪ್ರವಾಹ",
      hailstorm: "ಆಲಿಕಲ್ಲು ಮಳೆ",
      pest: "ಕೀಟ / ರೋಗ",
      storm: "ಚಂಡಮಾರುತ",
      other: "ಇತರೆ",
    },
    steps: {
      farmer: "ರೈತರ ವಿವರ",
      land: "ಭೂಮಿ ವಿವರ",
      crop: "ಬೆಳೆ ವಿವರ",
      documents: "ದಾಖಲೆಗಳು",
      review: "ಪರಿಶೀಲನೆ ಮತ್ತು ಸಲ್ಲಿಕೆ",
    },
  },
}

const dictionaries = { en, kn }

type LangContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: typeof en
}

let memoryLang: Lang = "kn"

export function fmt(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(memoryLang)
  const setLang = useCallback((l: Lang) => {
    memoryLang = l
    setLangState(l)
  }, [])
  const toggle = useCallback(() => {
    setLangState((l) => {
      const next = l === "en" ? "kn" : "en"
      memoryLang = next
      return next
    })
  }, [])

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t: dictionaries[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within LangProvider")
  return ctx
}

