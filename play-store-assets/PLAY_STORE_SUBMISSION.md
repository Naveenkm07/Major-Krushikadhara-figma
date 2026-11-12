# KrushikaDhara — Google Play Console Launch Guide

Ready-to-paste fields and assets for releasing `com.krushikadhara.app` on Google Play Store.

---

## 1. App Identity & Backend URLs
- **App Name**: `KrushikaDhara`
- **Package Name**: `com.krushikadhara.app`
- **Default Language**: English (India) (`en-IN`) + Kannada (`kn-IN`)
- **Production Backend API**: `https://krushikadhara-api.onrender.com/api`
- **Privacy Policy URL**: `https://krushikadhara-api.onrender.com/privacy`
- **Terms of Service URL**: `https://krushikadhara-api.onrender.com/terms`
- **Account & Data Deletion URL**: `https://krushikadhara-api.onrender.com/delete-account`

---

## 2. Store Listing Copy (Ready to Copy-Paste)

### Short Description (max 80 chars — 74 chars)
`AI Crop Pest Scan, Live APMC Mandi Prices, Kannada Voice AI & Weather App`

### Full Description (concise, compliant)
KrushikaDhara is a bilingual (English & Kannada) smart farming companion built to support Indian farmers across every crop stage.

Key Features:
• AI Pest & Disease Scanner: Capture or upload crop leaf photos for instant AI identification along with organic and chemical dosage guidance.
• Live APMC Mandi Prices: Discover nearby verified APMC mandis within 50 km via GPS and compare daily commodity rates.
• Kannada & English Voice AI Agronomist: Ask farming questions by voice or text and listen to spoken Kannada/English responses.
• Hyperlocal Weather & Spray Advisories: 3-day & hourly weather forecasts with spraying suitability alerts.
• Crop Stage Tracker: Stage-by-stage advisories from sowing to harvest for Paddy, Ragi, Tomato, Sugarcane, Maize, and more.
• PMFBY Insurance & Government Schemes: Premium calculator, document checklist, claim readiness tracker, and central/state farmer scheme directory (references public information from pmfby.gov.in and myscheme.gov.in; not an official government app).
• Nearby Equipment Rental: Browse tractors, harvesters, drones, and sprayers or list your own farm machinery.

---

## 3. Store Listing Graphics Included in This Folder
- **App Icon (`512 × 512 px`)**: `play-store-assets/app-icon-512x512.png`
- **Feature Graphic (`1024 × 500 px`)**: `play-store-assets/feature-graphic-1024x500.png`
- **Phone Screenshots (minimum 2 required)**: Capture screenshots directly on your Android device after installing the `preview` `.apk`.

---

## 4. Mandatory App Content Declarations (To Pass Play Review First Try)

### App Access (CRITICAL — OTP Login)
Select **"All or some functionality in my app is restricted"** and add a test credential:
- **Instruction Name**: `Demo Farmer OTP Login`
- **Mobile Number**: `9591502209`
- **OTP Code**: `1234`
- **Note for Reviewer**: `Enter 9591502209 on the Login screen, tap Request OTP, enter 1234, and tap Verify to access all screens.`

### Ads
- Select: **No, my app does not contain ads**.

### Government Apps
- Select: **No** (KrushikaDhara is an independent agricultural decision-support app referencing public PMFBY/MyScheme/data.gov.in data, not a government entity).

### Data Safety Summary
- **Collects user data?**: **Yes** (Account phone number, optional farmer/farm profile, optional crop leaf photos, optional voice audio, approximate/precise location while in use for nearby mandis/weather).
- **Sold to third parties?**: **No**
- **Encrypted in transit?**: **Yes** (HTTPS)
- **Users can request deletion?**: **Yes** (In-app `Settings → Privacy Policy → Delete My Account & Data`, plus web link `https://krushikadhara-api.onrender.com/delete-account`)

---

## 5. Upload & Release Steps
1. Download the finished **`production` `.aab`** (`versionCode: 2`) from Expo EAS.
2. Open **Google Play Console** → **Create app** (`KrushikaDhara`, Free, App).
3. Complete all **App content** forms & **Store listing** graphics above.
4. Go to **Testing → Internal testing** (first `.aab` MUST be uploaded manually in Play Console; later updates `versionCode: 3+` can use `npx eas-cli submit -p android --profile production`).
5. **Personal Account Requirement**: New personal Play Console accounts require **Closed Testing** with **12–20 opted-in testers for 14 continuous days** before applying for Production access.

