# KrushikaDhara — Google Play Store & Standalone APK Release Guide

This workspace has been configured and verified (`npx expo-doctor`: 20/20 passed) for standalone Android **APK** distribution and **Google Play Store App Bundle (`.aab`)** release.

---

## 1. Before Building the Production `.aab` (Critical!)

1. **Deploy the Backend to a Public HTTPS URL**  
   - Android release builds disable cleartext `http://10.x.x.x` LAN traffic by default, and Play Store users outside your Wi-Fi cannot reach a local IP.
   - Deploy `backend/` (Express + Prisma + YOLO11s/Gemini/Sarvam integrations) behind **HTTPS** (e.g., Cloud Run, Railway, Render, Fly.io, or VPS with Nginx + Let's Encrypt).
   - Configure the EAS production environment variable in Expo / `eas.json` (`build.production.env.EXPO_PUBLIC_API_URL`) or run:
     ```powershell
     npx eas-cli env:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-production-domain.com/api" --environment production
     ```

2. **Link the Project to Your EAS Account** (verified logged in as `naveenkm07`):
   ```powershell
   npx eas-cli init
   ```
   This writes `extra.eas.projectId` to `app.json` once confirmed interactively.

---

## 2. Build Standalone APK (Internal Testing) & Play Store `.aab`

### Standalone Sideload APK (`preview` profile)
```powershell
npx eas-cli build -p android --profile preview
```
- Produces a single installable `.apk` download link + QR code (works completely standalone without Expo Go).

### Google Play Store Production App Bundle (`.aab`)
```powershell
npx eas-cli build -p android --profile production
```
- Uses `package: "com.krushikadhara.app"`, `versionCode: 1` (with `autoIncrement: true`), scoped runtime permissions only (`CAMERA`, `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `INTERNET`), adaptive icon layers, and `expo-splash-screen`.

### Submit to Play Store Internal Testing Track
After placing your Google Play Service Account JSON key (configured in `eas.json` or via `eas credentials`):
```powershell
npx eas-cli submit -p android --profile production
```

---

## 3. Google Play Console Compliance Checklist

1. **In-App Account & Data Deletion (Implemented)**  
   - Available inside **Settings -> Privacy Policy**, **About -> Privacy Policy**, and **Profile -> Support -> Privacy Policy**.
   - Also previewable pre-login directly from **AuthScreen** (`Terms of Service` / `Privacy Policy`).
   - Triggers `DELETE /api/profile?mobile=<number>` to erase the farmer's profile, crop fields, OTP tokens, scan history, saved tips, equipment listings/bookings/notifications, scheme progress, and insurance records, plus clears local storage and returns to login.
   - **Action needed in Play Console**: Host the Privacy Policy URL (matching the in-app copy in `src/components/LegalScreen.tsx`) and enter the same URL in **App content -> Privacy policy** and **Data deletion**.

2. **App Permissions Declaration**  
   - `CAMERA` & Gallery Picker: Crop leaf / pest photo scanning.
   - `RECORD_AUDIO`: Optional Sarvam AI Kannada/English voice assistant (no background recording or foreground service).
   - `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`: When-in-use only for APMC Mandis within 50 km, local weather, and nearby rental machinery (`isAndroidBackgroundLocationEnabled: false`).

3. **Data Safety Form**  
   - Collected data: Name, phone number (OTP login), district/village & farm details, crop leaf photos (diagnosis), optional voice audio queries, optional Soil Health Card NPK values.
   - Advertising / Ad ID: **None** (no ad SDKs included).

4. **Store Listing Assets**  
   - App Icon: `./assets/icon.png` (`1024x1024`)
   - Feature Graphic (`1024x500`) & 4–8 phone screenshots covering Splash/Onboarding, Home Advisory Dashboard, Crop Scan AI, Kannada Voice AI, Weather/Mandi, Equipment Rental Marketplace, and Crop Insurance.

