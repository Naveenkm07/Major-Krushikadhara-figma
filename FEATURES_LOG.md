# KrushikaDhara - Features & Implementation Log

This document tracks all features, screens, and components implemented in the **KrushikaDhara** project (React Native Mobile App + Node.js/Express + Prisma + PostgreSQL Backend).

---

## Project Overview
- **Mobile Frontend:** React Native (Expo SDK 58 / React Native 0.88)
- **Backend Architecture:** Node.js + Express (TypeScript)
- **Database & Cloud:** Neon Cloud PostgreSQL with Prisma ORM
- **Key Integrations:**
  - **Auth/OTP:** Twilio SMS API
  - **Media Storage:** Cloudinary (for crop leaf scans & machinery photos)
  - **Voice & Speech-to-Text:** Sarvam AI STT (Kannada & Indian languages)
  - **On-Device Plant Doctor:** Custom `.tflite` model for offline leaf diagnostics
  - **Live Weather & Mandi:** OpenWeather API & APMC wholesale market feeds

---

## Log of Features and Implementation

### Phase 0: Setup & Repository Inspection (Completed)
- Audited the reference Figma repository (`Major-Krushikadhara-figma`).
- Extracted color tokens, 5 core tabs, 44 navigation routes, and bilingual dictionaries.

### Phase 1: Foundation, Locales & State Architecture (Completed)
- Built typed stack navigation manager (`useNav`) with Android hardware `BackHandler`.
- Implemented Kannada (`kn`) and English (`en`) dictionary sets across 10 modules.
- Established client state stores (`startup.ts`, `auth.ts`, `profile.tsx`, `equipment.tsx`, `insurance.tsx`).

### Phase 2: Complete Mobile Screen Implementation (Completed)
- **Startup:** `SplashScreen`, `LanguageSelectScreen`, `OnboardingScreen`, `AuthScreen`.
- **Root Tabs:** `HomeScreen`, `ScanScreen`, `InsightsScreen`, `GovtSchemesScreen`, `ProfileScreen`, `BottomNav`.
- **Workflow & Subflow Screens:** All 44 routes registered and verified with zero TypeScript compilation errors.

### Phase 3: PostgreSQL Database & Backend Core (`backend/`) (Completed)
- **1. Neon Cloud PostgreSQL Setup:**
  - Configured `backend/.env` with placeholders for `DATABASE_URL` (Neon), `TWILIO`, `CLOUDINARY`, and `SARVAM_API_KEY`.
- **2. Prisma ORM Schema (`backend/prisma/schema.prisma`):**
  - **`Farmer`**: Unique mobile auth, location coordinates (latitude/longitude), farm acreage, crops, experience, language choice.
  - **`OtpToken`**: Twilio SMS verification code storage with expiry and verification states.
  - **`CropField` & `StageAdvisory` (Core Application Differentiator):**
    - Tracks farmer's active crops and their **exact current growth stage** (Sowing, Vegetative, Tillering, Panicle Initiation, Flowering, Ripening, Harvest).
    - Generates and stores **tailored daily agronomy suggestions** based on that present stage.
    - Records real-time health status (`HEALTHY`, `PEST_SUSPECTED`, `DISEASED`, `WATER_STRESSED`).
  - **`FarmerInteraction`**:
    - Stores farmer voice inputs (transcribed via **Sarvam STT** in Kannada/English) or text queries.
    - Captures agronomist AI responses linked to their active crop stage context.
  - **`Equipment` & `RentalBooking`**:
    - Community marketplace enabling farmers to list their machinery and book neighboring tractors/machinery.
    - Status lifecycle (`PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
  - **`CropScan`**:
    - Designed to pair with the on-device `.tflite` model and backup scan images to **Cloudinary**.
  - **`MandiPrice`**:
    - Modeled for location-based nearest APMC market prices and historical price trends.
- **3. Verification:**
  - Generated Prisma Client v5.22.0 (`backend/node_modules/@prisma/client`).
  - Verified backend TypeScript compilation (`npm run build` exits with code 0).

---

### Phase 4: Live Government Mandi Price API (data.gov.in / AGMARKNET) (Completed)
- **Zero Mock / Zero Pre-Pushed Data:** Removed static pre-seeded database prices. Mandi rates are queried **live on-demand directly from the Government of India open data platform (data.gov.in / AGMARKNET)** whenever the farmer requests them.
- **Official API Integration:**
  - **Endpoint:** `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
  - **API Key:** Configured in `backend/.env` with user-provided testing key `579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b`.
  - **Dynamic Filters:**
    - `filters[state.keyword]=Karnataka`
    - `filters[commodity]=<CropName>` (Tomato, Ragi, Onion, Paddy(Dhan)(Common), Green Chilli, Maize, Banana)
    - `filters[district]=<District>` (Mandya, Mysuru, Ramanagara, Kolar, etc.)
    - `limit=10`, `format=json`
- **Nearest APMC Calculation:**
  - Integrated Haversine geographical formula mapping Karnataka APMC yards (Mandya, Maddur, Pandavapura, Malavalli, Mysuru Bandipalya, Ramanagara, Kolar, Yeshwanthpur, etc.) against farmer GPS coordinates.
  - Dynamically sorts returned live government arrivals so the **nearest market to the farmer appears first**.
  - Converts ruling prices into both ₹/Quintal and ₹/kg.
- **Frontend Live Feed (`MarketPricesScreen.tsx` & `HomeScreen.tsx`):**
  - **Zero Hardcoded Crops:** Crops are dynamically populated from the active farmer's profile (`profile.crops`) and district (`profile.district`).
  - **Dynamic Crop Search:** Integrated a live search input allowing farmers to search for ANY agricultural produce (e.g. Cotton, Ginger, Arecanut, Maize, Sugarcane) on demand.
  - **Live Auto-Discovery:** Any crop returned in the live `data.gov.in` feed is automatically added as a selectable filter chip.
  - Displays official `🏛️ data.gov.in (Official AGMARKNET, Govt of India)` verified live badge.
  - Shows APMC yard name, exact distance (e.g. `Mandya APMC • Nearest`, `Maddur APMC • 18.4 km`), variety, grade (FAQ), ruling wholesale rate (₹/kg & ₹/Q), arrival date, and price range.
  - Integrated live market rate summary cards on `HomeScreen` targeting the active farmer's registered crops.

---

### Phase 5: Crop Growth Stage Tracking & Sarvam AI Voice Advisory (Completed)
- **Core Product Differentiator:** The app tracks the farmer's active crop and **exact present growth stage** (Sowing/Nursery -> Vegetative/Tillering -> Panicle Initiation -> Flowering -> Ripening -> Harvest) to deliver tailored daily guidance.
- **Stage Advisory Knowledge Engine (`stageAdvisory.service.ts`):**
  - Defines sequential growth stages and timelines for key crops (Rice, Ragi, Tomato, Onion, Chilli, Maize).
  - Automatically calculates `daysSinceSowing` and determines the present growth stage.
  - Generates stage-specific daily checklists across 4 critical agronomic categories:
    - 💧 **Irrigation:** Precise water depth and schedule.
    - 🧪 **Fertilizer:** Top-dressing dosages (Urea, Potash, Micronutrients).
    - 🛡️ **Pest & Disease Prevention:** Stage-specific vulnerabilities (Stem Borer, Blast, Leaf Curl, Blight).
    - ☀️ **Weather Precautions:** Rain/heat vulnerability alerts.
- **Sarvam AI Speech-to-Text Integration (`sarvam.service.ts`):**
  - Integrated with Sarvam AI's **Saaras:v4** model via `https://api.sarvam.ai/speech-to-text`.
  - Transcribes farmer voice observations in Kannada (`kn-IN`) and English.
  - Evaluates voice observations against the active crop's present growth stage.
  - Persists farmer queries and stage-tailored responses to **Neon Cloud PostgreSQL (`FarmerInteraction` & `CropField`)**.
- **Frontend Voice Assistant & Growth Stage Widget:**
  - **`VoiceAssistantScreen.tsx`:** Upgraded to show active crop stage badge, dynamic stage-specific questions, microphone toggle for Sarvam STT, and bilingual Kannada/English answers.
  - **`HomeScreen.tsx`:** Added prominent **Active Crop Growth Stage Card** right below weather, featuring visual stage progress track, today's top action, and a 1-tap voice advisory shortcut.

---

### Phase 6: GPS-Based Nearest Mandi Discovery & Official AGMARKNET Prices (Completed)
- **1. PostgreSQL Verified Mandi Directory (`mandis` table):**
  - Added `Mandi` model in `backend/prisma/schema.prisma` mapped to `mandis` with `id (BigInt)`, `name`, `state`, `district`, `latitude`, `longitude`, `location_source`, and `is_verified`.
  - Pushed schema to Neon Cloud PostgreSQL (`npx prisma db push`).
  - Seeded 30 verified official APMC market yards across Karnataka (Mandya, Ramanagara, Mysuru Bandipalya, Maddur, Pandavapura, Kolar, Yeshwanthpur, Tumakuru, etc.) with verified KSAMB / AGMARKNET coordinates.
  - Zero fake / fabricated coordinates; explicit `locationSource` attribution.
- **2. Nearest Mandi Calculation (`geo.ts` & `mandi.service.ts`):**
  - Haversine mathematical calculation measuring distance in km from farmer's dynamic GPS coordinates.
  - Configurable search radius (default 50 km, expandable to 100 km, 150 km, 200 km).
  - Pre-filtered using geographical bounding box indexes before exact circle calculation.
  - Returns top 5 nearest mandis sorted in ascending order of distance.
- **3. Government AGMARKNET Integration & Market Matching:**
  - Real-time proxy to official Government of India dataset `9ef84268-d588-465a-a308-a864a43d0070` with API Key configured in `MANDI_API_KEY` / `DATA_GOV_IN_API_KEY`.
  - Verified crop mapping utility (`cropMapping.ts`) matching local names to AGMARKNET commodity filters.
  - Normalized matching strategy comparing market names, districts, and states.
  - If a nearby mandi has no trade arrival reported today for that crop, accurately marks `hasPrice: false` with `modalPrice: null` rather than showing zero or fabricated prices.
  - In-memory 5-minute caching to eliminate duplicate API requests and prevent HTTP 429 rate limits.
- **4. Backend REST Endpoints (`mandi.routes.ts` & `mandi.controller.ts`):**
  - `GET /api/mandi/nearby?lat=...&lng=...&crop=...&radius=50&limit=5`: Full discovery & price matching.
  - Strict input validation rejecting coordinates outside legal geographical ranges (lat -90..90, lng -180..180).
  - Handles HTTP 429 upstream rate limit with localized informative messages.
- **5. Frontend React Native / Web Interface (`MarketPricesScreen.tsx`):**
  - Dynamic farmer GPS detection using Geolocation API with status indication ("Detecting GPS...", "GPS Detected: lat, lng").
  - Permission denial & timeout handling with manual farming hub selection fallback (Mandya, Ramanagara, Mysuru, Bengaluru, etc.).
  - Search radius toggle pills (30km, 50km default, 100km, 150km).
  - Responsive empty state offering a 1-tap "Expand Radius to 100 km" button when no mandis are within 50 km.
  - Mandi cards displaying verified badge, distance, ruling modal rate (₹/kg & ₹/Quintal), price range, arrival date, and AGMARKNET attribution.
  - Bilingual interface (English & Kannada) matching the KrushikaDhara design system.



