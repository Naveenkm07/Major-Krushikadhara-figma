import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { extraEn, extraKn } from "@/krushika/locales"

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

  auth: {
    welcome: "Welcome, Farmer!",
    signIn: "Sign In",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter phone number",
    continue: "Continue",
    or: "OR",
    google: "Continue with Google",
    terms: "By continuing you agree to our Terms of Service and Privacy Policy.",
    signingIn: "Signing in…",
  },

  pages: {
    back: "Back",
    notifications: {
      title: "Notifications",
      subtitle: "Stay updated on your farm",
      markAll: "Mark all read",
      groups: { today: "Today", earlier: "Earlier" },
    },
    market: {
      title: "Market Prices",
      subtitle: "Live mandi rates near you",
      updated: "Updated",
      perKg: "/kg",
      mandi: "Mandya APMC",
      trendTitle: "Tomato · 7-day trend",
    },
    calendar: {
      title: "Crop Calendar",
      subtitle: "Your seasonal crop schedule",
      stages: { sowing: "Sowing", growing: "Growing", irrigation: "Irrigation", fertilizer: "Fertilizer", harvest: "Harvest" },
      current: "Current stage",
    },
    insurance: {
      title: "Crop Insurance",
      subtitle: "Pradhan Mantri Fasal Bima Yojana",
      active: "Active",
      covered: "Crops Covered",
      coverage: "Coverage Amount",
      premium: "Premium Paid",
      season: "Season",
      dates: "Important Dates",
      enrol: "Enrolment ends",
      claimWindow: "Claim window",
      claim: "Claim Information",
      claimBody: "Report crop loss within 72 hours of the event via the toll-free helpline or your nearest CSC.",
      learn: "Learn More",
      apply: "Apply Now",
    },
    schemes: {
      title: "Govt Schemes",
      subtitle: "Benefits you may qualify for",
      eligibility: "Eligibility",
      benefit: "Benefit",
      deadline: "Deadline",
      view: "View Details",
    },
    equipment: {
      title: "Equipment Rental",
      subtitle: "Rent machinery near Mandya",
      perDay: "/day",
      available: "Available",
      booked: "Booked",
      rent: "Rent Now",
      notify: "Notify Me",
    },
    help: {
      title: "Help & Support",
      subtitle: "We're here to help you",
      call: "Call Support",
      callHint: "1800-180-1551 · Toll free",
      chat: "Chat Support",
      chatHint: "Typical reply in 5 min",
      report: "Report a Problem",
      reportHint: "Tell us what went wrong",
      faq: "Frequently Asked Questions",
      faqs: [
        { q: "How accurate is crop scanning?", a: "Our AI model identifies common pests and diseases with about 92% accuracy. Always confirm with a local expert for treatment." },
        { q: "Is KrushikaDhara free to use?", a: "Yes. All core features including scanning, market prices and schemes are free for farmers." },
        { q: "How do I change the app language?", a: "Go to Profile → Preferences → Language, or tap the language toggle on the Home header." },
        { q: "Where does market price data come from?", a: "Prices are sourced daily from your nearest APMC mandi and government AGMARKNET feeds." },
      ],
    },
    about: {
      title: "About KrushikaDhara",
      subtitle: "Smart Farming Companion",
      body: "KrushikaDhara helps farmers make confident decisions with AI crop scanning, live market prices, weather guidance and easy access to government schemes — all in your language.",
      mission: "Our Mission",
      missionBody: "To put modern agricultural intelligence in the hands of every farmer, simply and in Kannada.",
      version: "Version 1.0.0",
      madeWith: "Made with 🌱 for Indian farmers",
    },
    saved: {
      title: "Saved Tips",
      subtitle: "Your bookmarked advice",
      empty: "No saved tips yet.",
    },
    language: {
      title: "Language",
      subtitle: "Choose your preferred language",
      english: "English",
      englishSub: "English",
      kannada: "ಕನ್ನಡ",
      kannadaSub: "Kannada",
      note: "Interface labels update instantly across the app.",
    },
    scanResult: {
      title: "Scan Result",
      confidence: "Confidence",
      status: "Status",
      about: "About this condition",
      aboutBody: "Early blight is a fungal disease causing dark concentric spots on older leaves. It spreads in warm, humid weather and can reduce yield if untreated.",
      actions: "Recommended Actions",
      actionItems: [
        "Remove and destroy affected leaves immediately.",
        "Apply a copper-based or mancozeb fungicide as directed.",
        "Avoid overhead watering to keep foliage dry.",
      ],
      prevention: "Prevention",
      preventionItems: [
        "Rotate crops every season to break the disease cycle.",
        "Space plants for good air circulation.",
        "Use certified disease-free seed.",
      ],
      again: "Scan Again",
      save: "Save Result",
      saved: "Saved ✓",
    },
    weather: {
      title: "Weather",
      subtitle: "Mandya District · Today",
      feelsLike: "Feels like",
      humidity: "Humidity",
      wind: "Wind",
      rainfall: "Rainfall",
      uvIndex: "UV Index",
      visibility: "Visibility",
      forecast: "5-Day Forecast",
      farmAdvice: "Farm Advisory",
      advisoryNote: "Advisory based on local forecast — confirm with your agricultural officer before acting.",
    },
    scanHistory: {
      title: "Scan History",
      subtitle: "All your past crop scans",
      empty: "No scans yet. Use the Scan tab to analyse your crops.",
      filter: "Filter",
      all: "All",
      healthy: "Healthy",
      issues: "Issues Found",
    },
    myFarm: {
      title: "My Farm",
      subtitle: "Farm profile and crop details",
      totalArea: "Total Area",
      activeCrops: "Active Crops",
      soilType: "Soil Type",
      lastRain: "Last Rainfall",
      addCrop: "Add Crop",
      removeCrop: "Remove",
      cropHealth: "Crop Health",
      healthy: "Healthy",
      warning: "Needs Attention",
      irrigationSchedule: "Irrigation Schedule",
      nextIrrigation: "Next Irrigation",
    },
    voice: {
      title: "Voice Assistant",
      subtitle: "Ask questions in Kannada or English",
      tapToSpeak: "Tap to speak",
      listening: "Listening…",
      processing: "Processing…",
      suggestions: "Try asking:",
      demo: "Voice assistant is a demonstration feature. Responses are pre-scripted.",
    },
    offline: {
      title: "Offline Mode",
      subtitle: "Data cached for offline use",
      status: "Connection Status",
      online: "Online",
      offline: "Offline",
      cached: "Cached Data",
      lastSync: "Last synced",
      syncNow: "Sync Now",
      cachedScans: "Saved Scans",
      cachedPrices: "Market Prices",
      cachedSchemes: "Scheme Info",
      cachedWeather: "Weather Data",
      demoNote: "Offline sync is a demo feature in this prototype.",
    },
    settings: {
      title: "Settings",
      subtitle: "App preferences",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      language: "Language",
      notifications: "Notifications",
      pushAlerts: "Push Alerts",
      marketAlerts: "Market Price Alerts",
      weatherAlerts: "Weather Warnings",
      schemeDeadlines: "Scheme Deadlines",
      privacy: "Privacy & Data",
      dataUsage: "Data Usage",
      deleteData: "Delete My Data",
      advanced: "Advanced",
      offlineMode: "Offline Mode",
      aiModel: "AI Model Info",
      appVersion: "App Version",
    },
    onboarding: {
      slides: [
        {
          title: "AI Crop Scanner",
          body: "Point your phone at any crop — our AI instantly identifies pests, diseases, and health issues with 92% accuracy.",
        },
        {
          title: "Live Market Prices",
          body: "Get real-time mandi rates for your crops and plan the best time to sell — right from your field.",
        },
        {
          title: "Govt Schemes Made Easy",
          body: "Discover PM-KISAN, PMFBY, Kisan Credit Card and more — check eligibility and apply in minutes.",
        },
      ],
      skip: "Skip",
      next: "Next",
      getStarted: "Get Started",
    },
  },
}

const kn: typeof en = {
  x: extraKn,
  greeting: "ನಮಸ್ಕಾರ",
  userName: "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ",
  userNameKn: "Naveen Kumar",
  langLabel: "ಕನ್ನಡ / EN",
  location: "ಮಂಡ್ಯ, ಕರ್ನಾಟಕ",

  weather: {
    place: "ಮಂಡ್ಯ",
    refresh: "ರಿಫ್ರೆಶ್",
    condition: "ಬಿಸಿಲು",
    humidity: "ಆರ್ದ್ರತೆ: 62%",
  },

  quickActions: {
    title: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    pest: "ಕೀಟ ಪತ್ತೆ",
    market: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    calendar: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
    equipment: "ಉಪಕರಣ ಬಾಡಿಗೆ",
    insurance: "ಬೆಳೆ ವಿಮೆ",
    schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆ",
  },

  tips: {
    title: "ಇಂದಿನ ಸಲಹೆಗಳು",
    viewAll: "ಎಲ್ಲಾ ನೋಡಿ",
    items: [
      {
        title: "ನೀರಾವರಿ ಜ್ಞಾಪನೆ",
        body: "ನೀರಾವರಿ ಮೊದಲು ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ. ಹೆಚ್ಚು ನೀರು ಬೇರುಗಳಿಗೆ ಹಾನಿ.",
      },
      {
        title: "ಹವಾಮಾನ",
        body: "3 ದಿನ ಸ್ವಚ್ಛ ಆಕಾಶ ನಿರೀಕ್ಷೆ — ಸಿಂಪಡಣೆಗೆ ಉತ್ತಮ ಸಮಯ.",
      },
      {
        title: "ಕೀಟ ಎಚ್ಚರಿಕೆ",
        body: "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಹಳದಿ ಕಾಂಡ ಕೊರಕ ಕಂಡುಬಂದಿದೆ. ಭತ್ತದ ಗದ್ದೆ ಗಮನಿಸಿ.",
      },
    ],
  },

  market: {
    title: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    perKg: "/ಕೆ.ಜಿ",
    crops: { tomato: "ಟೊಮೇಟೊ", ragi: "ರಾಗಿ", onion: "ಈರುಳ್ಳಿ" },
  },

  nav: { home: "ಮುಖಪುಟ", scan: "ಸ್ಕ್ಯಾನ್", insights: "ಒಳನೋಟ", schemes: "ಯೋಜನೆ", profile: "ಪ್ರೊಫೈಲ್" },

  scan: {
    title: "ಬೆಳೆ ಸ್ಕ್ಯಾನ್",
    subtitle: "ಕೀಟ, ರೋಗ ಮತ್ತು ಬೆಳೆ ಆರೋಗ್ಯ ಪತ್ತೆಗೆ ಸಸ್ಯದ ಕಡೆ ಕ್ಯಾಮೆರಾ ಇರಿಸಿ.",
    modes: { pest: "ಕೀಟ ಮತ್ತು ರೋಗ", crop: "ಬೆಳೆ ಗುರುತಿಸಿ", leaf: "ಎಲೆ ಆರೋಗ್ಯ" },
    hint: "ಸಸ್ಯವನ್ನು ಚೌಕಟ್ಟಿನೊಳಗೆ ಇರಿಸಿ",
    scanNow: "ಈಗ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    gallery: "ಗ್ಯಾಲರಿ",
    recent: "ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್",
    results: [
      { crop: "ಟೊಮೇಟೊ ಎಲೆ", result: "ಆರಂಭಿಕ ಅಂಗಮಾರಿ ಪತ್ತೆ" },
      { crop: "ಭತ್ತದ ಸಸ್ಯ", result: "ಆರೋಗ್ಯಕರ — ಸಮಸ್ಯೆ ಇಲ್ಲ" },
      { crop: "ಮೆಣಸಿನ ಎಲೆ", result: "ಎಲೆ ಮುದುಡುವ ವೈರಸ್" },
    ],
  },

  insights: {
    title: "ಒಳನೋಟ",
    subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಸಾಧನೆ ಒಂದೇ ನೋಟದಲ್ಲಿ.",
    stats: {
      yield: "ಒಟ್ಟು ಇಳುವರಿ",
      revenue: "ಆದಾಯ",
      crops: "ಸಕ್ರಿಯ ಬೆಳೆ",
      water: "ನೀರು ಉಳಿತಾಯ",
      ready: "2 ಸಿದ್ಧ",
      vsYr: "ಕಳೆದ ವರ್ಷಕ್ಕೆ",
    },
    yieldTrend: "ಇಳುವರಿ ಪ್ರವೃತ್ತಿ",
    yieldUp: "ಈ ಋತುವಿನಲ್ಲಿ 18% ಏರಿಕೆ",
    cropDist: "ಬೆಳೆ ಹಂಚಿಕೆ",
    cropNames: { rice: "ಭತ್ತ", ragi: "ರಾಗಿ", tomato: "ಟೊಮೇಟೊ", others: "ಇತರೆ" },
    money: "ಆದಾಯ vs ಖರ್ಚು",
    moneyUnit: "₹ ಸಾವಿರದಲ್ಲಿ",
    income: "ಆದಾಯ",
    expense: "ಖರ್ಚು",
    soil: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    soilRows: {
      n: "ಸಾರಜನಕ (N)",
      p: "ರಂಜಕ (P)",
      k: "ಪೊಟ್ಯಾಸಿಯಂ (K)",
      moisture: "ತೇವಾಂಶ",
    },
  },

  profile: {
    title: "ಪ್ರೊಫೈಲ್",
    edit: "ಸಂಪಾದಿಸಿ",
    stats: { scans: "ಸ್ಕ್ಯಾನ್", crops: "ಬೆಳೆ", years: "ವರ್ಷ" },
    myFarm: "ನನ್ನ ಜಮೀನು",
    farm: {
      size: "ಜಮೀನಿನ ಗಾತ್ರ",
      sizeValue: "4.2 ಎಕರೆ",
      crops: "ಮುಖ್ಯ ಬೆಳೆಗಳು",
      cropsValue: "ಭತ್ತ, ರಾಗಿ, ಟೊಮೇಟೊ",
      location: "ಸ್ಥಳ",
      locationValue: "ಮಂಡ್ಯ, ಕರ್ನಾಟಕ",
    },
    preferences: "ಆದ್ಯತೆಗಳು",
    support: "ಸಹಾಯ",
    rows: {
      language: "ಭಾಷೆ",
      languageHint: "English / ಕನ್ನಡ",
      notifications: "ಅಧಿಸೂಚನೆ",
      notificationsHint: "ಆನ್",
      saved: "ಉಳಿಸಿದ ಸಲಹೆ",
      insurance: "ಬೆಳೆ ವಿಮೆ",
      help: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
      about: "ಕೃಷಿಕಧಾರಾ ಬಗ್ಗೆ",
      logout: "ಲಾಗ್ ಔಟ್",
    },
    version: "ಕೃಷಿಕಧಾರಾ · v1.0.0",
  },

  auth: {
    welcome: "ಸ್ವಾಗತ, ರೈತರೇ!",
    signIn: "ಸೈನ್ ಇನ್",
    phoneLabel: "ಫೋನ್ ಸಂಖ್ಯೆ",
    phonePlaceholder: "ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    continue: "ಮುಂದುವರಿಸಿ",
    or: "ಅಥವಾ",
    google: "Google ನೊಂದಿಗೆ ಮುಂದುವರಿಸಿ",
    terms: "ಮುಂದುವರಿಯುವ ಮೂಲಕ ನೀವು ನಮ್ಮ ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತಾ ನೀತಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.",
    signingIn: "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ…",
  },

  pages: {
    back: "ಹಿಂದೆ",
    notifications: {
      title: "ಅಧಿಸೂಚನೆಗಳು",
      subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಬಗ್ಗೆ ಮಾಹಿತಿ",
      markAll: "ಎಲ್ಲಾ ಓದಲಾಗಿದೆ",
      groups: { today: "ಇಂದು", earlier: "ಹಿಂದಿನವು" },
    },
    market: {
      title: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
      subtitle: "ನಿಮ್ಮ ಸಮೀಪದ ಮಂಡಿ ದರಗಳು",
      updated: "ನವೀಕರಿಸಲಾಗಿದೆ",
      perKg: "/ಕೆ.ಜಿ",
      mandi: "ಮಂಡ್ಯ ಎಪಿಎಂಸಿ",
      trendTitle: "ಟೊಮೇಟೊ · 7-ದಿನ ಪ್ರವೃತ್ತಿ",
    },
    calendar: {
      title: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
      subtitle: "ನಿಮ್ಮ ಋತುಮಾನ ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ",
      stages: { sowing: "ಬಿತ್ತನೆ", growing: "ಬೆಳವಣಿಗೆ", irrigation: "ನೀರಾವರಿ", fertilizer: "ಗೊಬ್ಬರ", harvest: "ಕೊಯ್ಲು" },
      current: "ಪ್ರಸ್ತುತ ಹಂತ",
    },
    insurance: {
      title: "ಬೆಳೆ ವಿಮೆ",
      subtitle: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
      active: "ಸಕ್ರಿಯ",
      covered: "ಒಳಗೊಂಡ ಬೆಳೆಗಳು",
      coverage: "ವಿಮಾ ಮೊತ್ತ",
      premium: "ಪಾವತಿಸಿದ ಪ್ರೀಮಿಯಂ",
      season: "ಋತು",
      dates: "ಪ್ರಮುಖ ದಿನಾಂಕಗಳು",
      enrol: "ನೋಂದಣಿ ಮುಗಿಯುತ್ತದೆ",
      claimWindow: "ಕ್ಲೈಮ್ ಅವಧಿ",
      claim: "ಕ್ಲೈಮ್ ಮಾಹಿತಿ",
      claimBody: "ಘಟನೆಯ 72 ಗಂಟೆಗಳೊಳಗೆ ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿ ಅಥವಾ ಸಮೀಪದ ಸಿಎಸ್‌ಸಿ ಮೂಲಕ ಬೆಳೆ ನಷ್ಟ ವರದಿ ಮಾಡಿ.",
      learn: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
      apply: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    },
    schemes: {
      title: "ಸರ್ಕಾರಿ ಯೋಜನೆ",
      subtitle: "ನಿಮಗೆ ಸಿಗಬಹುದಾದ ಸೌಲಭ್ಯಗಳು",
      eligibility: "ಅರ್ಹತೆ",
      benefit: "ಪ್ರಯೋಜನ",
      deadline: "ಕೊನೆಯ ದಿನಾಂಕ",
      view: "ವಿವರ ನೋಡಿ",
    },
    equipment: {
      title: "ಉಪಕರಣ ಬಾಡಿಗೆ",
      subtitle: "ಮಂಡ್ಯದ ಸಮೀಪ ಯಂತ್ರೋಪಕರಣ ಬಾಡಿಗೆ",
      perDay: "/ದಿನ",
      available: "ಲಭ್ಯ",
      booked: "ಬುಕ್ ಆಗಿದೆ",
      rent: "ಈಗ ಬಾಡಿಗೆ ಪಡೆಯಿರಿ",
      notify: "ತಿಳಿಸಿ",
    },
    help: {
      title: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
      subtitle: "ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇದ್ದೇವೆ",
      call: "ಕರೆ ಬೆಂಬಲ",
      callHint: "1800-180-1551 · ಉಚಿತ",
      chat: "ಚಾಟ್ ಬೆಂಬಲ",
      chatHint: "ಸಾಮಾನ್ಯವಾಗಿ 5 ನಿಮಿಷದಲ್ಲಿ ಉತ್ತರ",
      report: "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
      reportHint: "ಏನು ತಪ್ಪಾಗಿದೆ ತಿಳಿಸಿ",
      faq: "ಪದೇಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು",
      faqs: [
        { q: "ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಎಷ್ಟು ನಿಖರ?", a: "ನಮ್ಮ AI ಸಾಮಾನ್ಯ ಕೀಟ ಮತ್ತು ರೋಗಗಳನ್ನು ಸುಮಾರು 92% ನಿಖರತೆಯಿಂದ ಗುರುತಿಸುತ್ತದೆ. ಚಿಕಿತ್ಸೆಗೆ ಸ್ಥಳೀಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ." },
        { q: "ಕೃಷಿಕಧಾರಾ ಬಳಕೆ ಉಚಿತವೇ?", a: "ಹೌದು. ಸ್ಕ್ಯಾನ್, ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮತ್ತು ಯೋಜನೆ ಸೇರಿ ಎಲ್ಲಾ ಮುಖ್ಯ ವೈಶಿಷ್ಟ್ಯ ರೈತರಿಗೆ ಉಚಿತ." },
        { q: "ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ ಬದಲಾಯಿಸುವುದು ಹೇಗೆ?", a: "ಪ್ರೊಫೈಲ್ → ಆದ್ಯತೆಗಳು → ಭಾಷೆ ಗೆ ಹೋಗಿ, ಅಥವಾ ಮುಖಪುಟದ ಭಾಷಾ ಟಾಗಲ್ ಒತ್ತಿ." },
        { q: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಲ್ಲಿಂದ ಬರುತ್ತದೆ?", a: "ಬೆಲೆಗಳನ್ನು ಪ್ರತಿದಿನ ನಿಮ್ಮ ಸಮೀಪದ ಎಪಿಎಂಸಿ ಮಂಡಿ ಮತ್ತು AGMARKNET ನಿಂದ ಪಡೆಯಲಾಗುತ್ತದೆ." },
      ],
    },
    about: {
      title: "ಕೃಷಿಕಧಾರಾ ಬಗ್ಗೆ",
      subtitle: "ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮಿಂಗ್ ಸಂಗಾತಿ",
      body: "ಕೃಷಿಕಧಾರಾ AI ಬೆಳೆ ಸ್ಕ್ಯಾನ್, ನೇರ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ, ಹವಾಮಾನ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಸುಲಭ ಪ್ರವೇಶದೊಂದಿಗೆ ರೈತರಿಗೆ ಆತ್ಮವಿಶ್ವಾಸದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      mission: "ನಮ್ಮ ಧ್ಯೇಯ",
      missionBody: "ಪ್ರತಿ ರೈತನ ಕೈಗೆ ಆಧುನಿಕ ಕೃಷಿ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ಸರಳವಾಗಿ, ಕನ್ನಡದಲ್ಲಿ ತಲುಪಿಸುವುದು.",
      version: "ಆವೃತ್ತಿ 1.0.0",
      madeWith: "ಭಾರತೀಯ ರೈತರಿಗಾಗಿ 🌱 ದಿಂದ ತಯಾರಿಸಲಾಗಿದೆ",
    },
    saved: {
      title: "ಉಳಿಸಿದ ಸಲಹೆ",
      subtitle: "ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್ ಸಲಹೆಗಳು",
      empty: "ಇನ್ನೂ ಉಳಿಸಿದ ಸಲಹೆ ಇಲ್ಲ.",
    },
    language: {
      title: "ಭಾಷೆ",
      subtitle: "ನಿಮ್ಮ ಇಷ್ಟದ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      english: "English",
      englishSub: "ಇಂಗ್ಲಿಷ್",
      kannada: "ಕನ್ನಡ",
      kannadaSub: "ಕನ್ನಡ",
      note: "ಇಂಟರ್‌ಫೇಸ್ ಲೇಬಲ್‌ಗಳು ತಕ್ಷಣ ಬದಲಾಗುತ್ತವೆ.",
    },
    scanResult: {
      title: "ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶ",
      confidence: "ವಿಶ್ವಾಸ",
      status: "ಸ್ಥಿತಿ",
      about: "ಈ ಸ್ಥಿತಿ ಬಗ್ಗೆ",
      aboutBody: "ಆರಂಭಿಕ ಅಂಗಮಾರಿ ಒಂದು ಶಿಲೀಂಧ್ರ ರೋಗ, ಹಳೆಯ ಎಲೆಗಳ ಮೇಲೆ ಗಾಢ ವೃತ್ತಾಕಾರದ ಚುಕ್ಕೆ ಉಂಟುಮಾಡುತ್ತದೆ. ಬೆಚ್ಚಗಿನ, ಆರ್ದ್ರ ಹವಾಮಾನದಲ್ಲಿ ಹರಡುತ್ತದೆ.",
      actions: "ಶಿಫಾರಸು ಕ್ರಮಗಳು",
      actionItems: [
        "ಬಾಧಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದು ನಾಶಪಡಿಸಿ.",
        "ತಾಮ್ರ-ಆಧಾರಿತ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.",
        "ಎಲೆ ಒಣಗಿಸಲು ಮೇಲಿನಿಂದ ನೀರುಣಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.",
      ],
      prevention: "ತಡೆಗಟ್ಟುವಿಕೆ",
      preventionItems: [
        "ರೋಗ ಚಕ್ರ ಮುರಿಯಲು ಪ್ರತಿ ಋತುವಿನಲ್ಲಿ ಬೆಳೆ ಬದಲಿಸಿ.",
        "ಉತ್ತಮ ಗಾಳಿ ಸಂಚಾರಕ್ಕೆ ಸಸ್ಯಗಳ ನಡುವೆ ಅಂತರ ಇರಿಸಿ.",
        "ಪ್ರಮಾಣೀಕೃತ ರೋಗಮುಕ್ತ ಬೀಜ ಬಳಸಿ.",
      ],
      again: "ಮತ್ತೆ ಸ್ಕ್ಯಾನ್",
      save: "ಫಲಿತಾಂಶ ಉಳಿಸಿ",
      saved: "ಉಳಿಸಲಾಗಿದೆ ✓",
    },
    weather: {
      title: "ಹವಾಮಾನ",
      subtitle: "ಮಂಡ್ಯ ಜಿಲ್ಲೆ · ಇಂದು",
      feelsLike: "ಅನಿಸಿಕೆ",
      humidity: "ಆರ್ದ್ರತೆ",
      wind: "ಗಾಳಿ",
      rainfall: "ಮಳೆ",
      uvIndex: "UV ಸೂಚ್ಯಂಕ",
      visibility: "ಗೋಚರತೆ",
      forecast: "5-ದಿನ ಮುನ್ಸೂಚನೆ",
      farmAdvice: "ಕೃಷಿ ಸಲಹೆ",
      advisoryNote: "ಸ್ಥಳೀಯ ಮುನ್ಸೂಚನೆ ಆಧಾರದ ಸಲಹೆ — ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ಕೃಷಿ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ದೃಢೀಕರಿಸಿ.",
    },
    scanHistory: {
      title: "ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ",
      subtitle: "ನಿಮ್ಮ ಎಲ್ಲಾ ಹಿಂದಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು",
      empty: "ಇನ್ನೂ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ. ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಲು ಸ್ಕ್ಯಾನ್ ಟ್ಯಾಬ್ ಬಳಸಿ.",
      filter: "ಫಿಲ್ಟರ್",
      all: "ಎಲ್ಲಾ",
      healthy: "ಆರೋಗ್ಯಕರ",
      issues: "ಸಮಸ್ಯೆ ಕಂಡುಬಂದಿದೆ",
    },
    myFarm: {
      title: "ನನ್ನ ಜಮೀನು",
      subtitle: "ಜಮೀನಿನ ಮಾಹಿತಿ ಮತ್ತು ಬೆಳೆ ವಿವರ",
      totalArea: "ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ",
      activeCrops: "ಸಕ್ರಿಯ ಬೆಳೆ",
      soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
      lastRain: "ಕೊನೆಯ ಮಳೆ",
      addCrop: "ಬೆಳೆ ಸೇರಿಸಿ",
      removeCrop: "ತೆಗೆಯಿರಿ",
      cropHealth: "ಬೆಳೆ ಆರೋಗ್ಯ",
      healthy: "ಆರೋಗ್ಯಕರ",
      warning: "ಗಮನ ಬೇಕು",
      irrigationSchedule: "ನೀರಾವರಿ ಸಮಯಪಟ್ಟಿ",
      nextIrrigation: "ಮುಂದಿನ ನೀರಾವರಿ",
    },
    voice: {
      title: "ಧ್ವನಿ ಸಹಾಯಕ",
      subtitle: "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ",
      tapToSpeak: "ಮಾತನಾಡಲು ಒತ್ತಿ",
      listening: "ಕೇಳುತ್ತಿದೆ…",
      processing: "ಪ್ರಕ್ರಿಯೆ ಆಗುತ್ತಿದೆ…",
      suggestions: "ಹೀಗೆ ಕೇಳಿ:",
      demo: "ಧ್ವನಿ ಸಹಾಯಕ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ವೈಶಿಷ್ಟ್ಯ. ಉತ್ತರಗಳು ಪೂರ್ವ-ನಿರ್ಧಾರಿತ.",
    },
    offline: {
      title: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
      subtitle: "ಆಫ್‌ಲೈನ್ ಬಳಕೆಗೆ ಕ್ಯಾಶ್ ಡೇಟಾ",
      status: "ಸಂಪರ್ಕ ಸ್ಥಿತಿ",
      online: "ಆನ್‌ಲೈನ್",
      offline: "ಆಫ್‌ಲೈನ್",
      cached: "ಕ್ಯಾಶ್ ಡೇಟಾ",
      lastSync: "ಕೊನೆಯ ಸಿಂಕ್",
      syncNow: "ಈಗ ಸಿಂಕ್",
      cachedScans: "ಉಳಿಸಿದ ಸ್ಕ್ಯಾನ್",
      cachedPrices: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
      cachedSchemes: "ಯೋಜನೆ ಮಾಹಿತಿ",
      cachedWeather: "ಹವಾಮಾನ ಡೇಟಾ",
      demoNote: "ಆಫ್‌ಲೈನ್ ಸಿಂಕ್ ಈ ಪ್ರೋಟೋಟೈಪ್‌ನಲ್ಲಿ ಡೆಮೊ ವೈಶಿಷ್ಟ್ಯ.",
    },
    settings: {
      title: "ಸೆಟ್ಟಿಂಗ್ಸ್",
      subtitle: "ಅಪ್ಲಿಕೇಶನ್ ಆದ್ಯತೆಗಳು",
      appearance: "ನೋಟ",
      darkMode: "ಡಾರ್ಕ್ ಮೋಡ್",
      language: "ಭಾಷೆ",
      notifications: "ಅಧಿಸೂಚನೆ",
      pushAlerts: "ಪುಶ್ ಎಚ್ಚರಿಕೆ",
      marketAlerts: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಚ್ಚರಿಕೆ",
      weatherAlerts: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ",
      schemeDeadlines: "ಯೋಜನೆ ಗಡುವು",
      privacy: "ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ",
      dataUsage: "ಡೇಟಾ ಬಳಕೆ",
      deleteData: "ನನ್ನ ಡೇಟಾ ಅಳಿಸಿ",
      advanced: "ಸುಧಾರಿತ",
      offlineMode: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
      aiModel: "AI ಮಾದರಿ ಮಾಹಿತಿ",
      appVersion: "ಅಪ್ ಆವೃತ್ತಿ",
    },
    onboarding: {
      slides: [
        {
          title: "AI ಬೆಳೆ ಸ್ಕ್ಯಾನರ್",
          body: "ಯಾವುದೇ ಬೆಳೆಯ ಕಡೆ ಫೋನ್ ಇರಿಸಿ — ನಮ್ಮ AI 92% ನಿಖರತೆಯಿಂದ ಕೀಟ, ರೋಗ ಮತ್ತು ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಪತ್ತೆ ಮಾಡುತ್ತದೆ.",
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

const STORAGE_KEY = "krushikadhara.lang"

function readStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "kn" ? "kn" : "en"
  } catch {
    return "en"
  }
}

export function fmt(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)
  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggle = useCallback(() => setLangState((l) => (l === "en" ? "kn" : "en")), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = lang
    document.documentElement.classList.toggle("lang-kn", lang === "kn")
  }, [lang])

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
