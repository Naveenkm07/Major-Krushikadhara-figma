import { useEffect, useState } from "react"
import SplashScreen from "@/krushika/components/SplashScreen"
import LanguageSelectScreen from "@/krushika/components/LanguageSelectScreen"
import OnboardingScreen from "@/krushika/components/OnboardingScreen"
import AuthScreen from "@/krushika/components/AuthScreen"
import HomeScreen from "@/krushika/components/HomeScreen"
import ScanScreen from "@/krushika/components/ScanScreen"
import InsightsScreen from "@/krushika/components/InsightsScreen"
import GovtSchemesScreen from "@/krushika/components/GovtSchemesScreen"
import ProfileScreen from "@/krushika/components/ProfileScreen"
import BottomNav, { type Tab } from "@/krushika/components/BottomNav"
// Feature screens
import NotificationsScreen from "@/krushika/components/NotificationsScreen"
import MarketPricesScreen from "@/krushika/components/MarketPricesScreen"
import CropCalendarScreen from "@/krushika/components/CropCalendarScreen"
import CropInsuranceScreen from "@/krushika/components/CropInsuranceScreen"
import EquipmentRentalScreen from "@/krushika/components/EquipmentRentalScreen"
import EquipmentDetailsScreen from "@/krushika/components/EquipmentDetailsScreen"
import RequestRentalScreen from "@/krushika/components/RequestRentalScreen"
import RequestSentScreen from "@/krushika/components/RequestSentScreen"
import MyRentalsScreen from "@/krushika/components/MyRentalsScreen"
import RentalDetailsScreen from "@/krushika/components/RentalDetailsScreen"
import ListEquipmentScreen from "@/krushika/components/ListEquipmentScreen"
import ListingPreviewScreen from "@/krushika/components/ListingPreviewScreen"
import MyEquipmentScreen from "@/krushika/components/MyEquipmentScreen"
import OwnerRequestsScreen from "@/krushika/components/OwnerRequestsScreen"
import OwnerDashboardScreen from "@/krushika/components/OwnerDashboardScreen"
import RentalHistoryScreen from "@/krushika/components/RentalHistoryScreen"
import RentalNotificationsScreen from "@/krushika/components/RentalNotificationsScreen"
import HelpSupportScreen from "@/krushika/components/HelpSupportScreen"
import AboutScreen from "@/krushika/components/AboutScreen"
import SavedTipsScreen from "@/krushika/components/SavedTipsScreen"
import LanguageScreen from "@/krushika/components/LanguageScreen"
import EditProfileScreen from "@/krushika/components/EditProfileScreen"
// AI scan workflow
import ScanProcessingScreen from "@/krushika/components/ScanProcessingScreen"
import AIAnalysisScreen from "@/krushika/components/AIAnalysisScreen"
import ScanResultScreen from "@/krushika/components/ScanResultScreen"
import DiagnosisResultScreen from "@/krushika/components/DiagnosisResultScreen"
import LowConfidenceScreen from "@/krushika/components/LowConfidenceScreen"
import AiPredictionsScreen from "@/krushika/components/AiPredictionsScreen"
import ScanHistoryScreen from "@/krushika/components/ScanHistoryScreen"
// New feature screens
import SchemeDetailScreen from "@/krushika/components/SchemeDetailScreen"
import WeatherScreen from "@/krushika/components/WeatherScreen"
import MyFarmScreen from "@/krushika/components/MyFarmScreen"
import VoiceAssistantScreen from "@/krushika/components/VoiceAssistantScreen"
// Informational screens
import OfflineModeScreen from "@/krushika/components/OfflineModeScreen"
import HowAiWorksScreen from "@/krushika/components/HowAiWorksScreen"
import TechnicalArchScreen from "@/krushika/components/TechnicalArchScreen"
import SettingsScreen from "@/krushika/components/SettingsScreen"
// Crop insurance workflow
import EligibilityScreen from "@/krushika/components/insurance/EligibilityScreen"
import InsurancePlanScreen from "@/krushika/components/insurance/InsurancePlanScreen"
import InsuranceApplicationScreen from "@/krushika/components/insurance/InsuranceApplicationScreen"
import ApplicationStatusScreen from "@/krushika/components/insurance/ApplicationStatusScreen"
import PolicyScreen from "@/krushika/components/insurance/PolicyScreen"
import ClaimHomeScreen from "@/krushika/components/insurance/ClaimHomeScreen"
import ReportCropLossScreen from "@/krushika/components/insurance/ReportCropLossScreen"
import ClaimTrackingScreen from "@/krushika/components/insurance/ClaimTrackingScreen"
import ClaimDetailsScreen from "@/krushika/components/insurance/ClaimDetailsScreen"
import InsuranceDocumentsScreen from "@/krushika/components/insurance/InsuranceDocumentsScreen"
import ImportantDatesScreen from "@/krushika/components/insurance/ImportantDatesScreen"
import InsuranceHelpScreen from "@/krushika/components/insurance/InsuranceHelpScreen"
import InsuranceDashboardScreen from "@/krushika/components/insurance/InsuranceDashboardScreen"
import { useLang } from "@/krushika/i18n"
import { useNav, type Route } from "@/krushika/nav"
import {
  completeOnboarding,
  endSession,
  markLanguageChosen,
  resolveStartup,
  saveOnboardingStep,
  startSession,
  type StartupStage,
} from "@/krushika/startup"

type Stage = "splash" | StartupStage

const MIN_SPLASH_MS = 1400

const routeScreens: Record<Route, React.ComponentType> = {
  notifications: NotificationsScreen,
  market: MarketPricesScreen,
  calendar: CropCalendarScreen,
  insurance: CropInsuranceScreen,
  schemes: GovtSchemesScreen,
  help: HelpSupportScreen,
  about: AboutScreen,
  saved: SavedTipsScreen,
  language: LanguageScreen,
  editProfile: EditProfileScreen,
  // AI scan workflow
  scanProcessing: ScanProcessingScreen,
  aiAnalysis: AIAnalysisScreen,
  scanResult: ScanResultScreen,
  diseaseResult: DiagnosisResultScreen,
  lowConfidence: LowConfidenceScreen,
  aiPredictions: AiPredictionsScreen,
  scanHistory: ScanHistoryScreen,
  // New feature screens
  schemeDetail: SchemeDetailScreen,
  weather: WeatherScreen,
  myFarm: MyFarmScreen,
  voiceAssistant: VoiceAssistantScreen,
  // Informational
  offlineMode: OfflineModeScreen,
  howAiWorks: HowAiWorksScreen,
  technicalArch: TechnicalArchScreen,
  settings: SettingsScreen,
  // Crop insurance workflow
  insuranceDashboard: InsuranceDashboardScreen,
  eligibilityCheck: EligibilityScreen,
  insurancePlan: InsurancePlanScreen,
  insuranceApplication: InsuranceApplicationScreen,
  applicationStatus: ApplicationStatusScreen,
  policyDetails: PolicyScreen,
  claimHome: ClaimHomeScreen,
  reportCropLoss: ReportCropLossScreen,
  claimTracking: ClaimTrackingScreen,
  claimDetails: ClaimDetailsScreen,
  insuranceDocuments: InsuranceDocumentsScreen,
  importantDates: ImportantDatesScreen,
  insuranceHelp: InsuranceHelpScreen,
  // Equipment rental marketplace
  equipment: EquipmentRentalScreen,
  equipmentDetails: EquipmentDetailsScreen,
  requestRental: RequestRentalScreen,
  requestSent: RequestSentScreen,
  myRentals: MyRentalsScreen,
  rentalDetails: RentalDetailsScreen,
  listEquipment: ListEquipmentScreen,
  listingPreview: ListingPreviewScreen,
  myEquipment: MyEquipmentScreen,
  ownerRequests: OwnerRequestsScreen,
  ownerDashboard: OwnerDashboardScreen,
  rentalHistory: RentalHistoryScreen,
  rentalNotifications: RentalNotificationsScreen,
}

export default function App() {
  const [stage, setStage] = useState<Stage>("splash")
  const [tab, setTab] = useState<Tab>("home")
  const { lang } = useLang()
  const { current, reset } = useNav()

  const [onboardingStep, setOnboardingStep] = useState(0)

  useEffect(() => {
    if (stage !== "splash") return
    let target: ReturnType<typeof resolveStartup>
    try {
      target = resolveStartup()
    } catch {
      target = { stage: "language", onboardingStep: 0 }
    }
    setOnboardingStep(target.onboardingStep)
    const timer = setTimeout(() => setStage(target.stage), MIN_SPLASH_MS)
    return () => clearTimeout(timer)
  }, [stage])

  if (stage === "splash") return <SplashScreen />
  if (stage === "language")
    return (
      <LanguageSelectScreen
        onDone={() => {
          markLanguageChosen()
          setStage("onboarding")
        }}
      />
    )
  if (stage === "onboarding")
    return (
      <OnboardingScreen
        initialIndex={onboardingStep}
        onStep={saveOnboardingStep}
        onDone={() => {
          completeOnboarding()
          setStage("auth")
        }}
      />
    )
  if (stage === "auth")
    return (
      <AuthScreen
        onDone={() => {
          startSession()
          setStage("app")
        }}
      />
    )

  const RouteScreen = current ? routeScreens[current.name] : null
  const routeKey = current ? current.name + JSON.stringify(current.params ?? {}) : ""

  function changeTab(next: Tab) {
    reset()
    setTab(next)
  }

  function logout() {
    reset()
    setTab("home")
    endSession()
    setStage("auth")
  }

  return (
    <div
      className={`relative mx-auto flex size-full min-h-screen max-w-md flex-col overflow-hidden bg-[#f7f8ec] ${
        lang === "kn" ? "font-kannada" : ""
      }`}
    >
      {tab === "home" && <HomeScreen onNavigate={changeTab} />}
      {tab === "scan" && <ScanScreen />}
      {tab === "insights" && <InsightsScreen />}
      {tab === "schemes" && <GovtSchemesScreen />}
      {tab === "profile" && <ProfileScreen onLogout={logout} />}
      <BottomNav active={tab} onChange={changeTab} />

      {RouteScreen && <RouteScreen key={routeKey} />}
    </div>
  )
}
