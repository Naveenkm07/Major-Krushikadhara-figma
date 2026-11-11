import type { ComponentType } from "react"
import type { Route } from "../nav"

// Standalone Screens
import NotificationsScreen from "./NotificationsScreen"
import MarketPricesScreen from "./MarketPricesScreen"
import CropCalendarScreen from "./CropCalendarScreen"
import CropInsuranceScreen from "./CropInsuranceScreen"
import GovtSchemesScreen from "./GovtSchemesScreen"
import HelpSupportScreen from "./HelpSupportScreen"
import AboutScreen from "./AboutScreen"
import SavedTipsScreen from "./SavedTipsScreen"
import LanguageScreen from "./LanguageScreen"
import EditProfileScreen from "./EditProfileScreen"
import WeatherScreen from "./WeatherScreen"
import MyFarmScreen from "./MyFarmScreen"
import VoiceAssistantScreen from "./VoiceAssistantScreen"
import OfflineModeScreen from "./OfflineModeScreen"
import HowAiWorksScreen from "./HowAiWorksScreen"
import TechnicalArchScreen from "./TechnicalArchScreen"
import SettingsScreen from "./SettingsScreen"
import SchemeDetailScreen from "./SchemeDetailScreen"
import ScanProcessingScreen from "./ScanProcessingScreen"
import ScanResultScreen from "./ScanResultScreen"
import ScanHistoryScreen from "./ScanHistoryScreen"
import EquipmentRentalScreen from "./EquipmentRentalScreen"

// Subflow Screen Bundles
import {
  EquipmentDetailsScreen,
  RequestRentalScreen,
  RequestSentScreen,
  MyRentalsScreen,
  RentalDetailsScreen,
  ListEquipmentScreen,
  ListingPreviewScreen,
  MyEquipmentScreen,
  OwnerRequestsScreen,
  OwnerDashboardScreen,
  RentalHistoryScreen,
  RentalNotificationsScreen,
} from "./EquipmentSubflows"

import {
  EligibilityScreen,
  InsurancePlanScreen,
  InsuranceApplicationScreen,
  ApplicationStatusScreen,
  PolicyScreen,
  ClaimHomeScreen,
  ReportCropLossScreen,
  ClaimTrackingScreen,
  ClaimDetailsScreen,
  InsuranceDocumentsScreen,
  ImportantDatesScreen,
  InsuranceHelpScreen,
  InsuranceDashboardScreen,
} from "./InsuranceSubflows"

import {
  AIAnalysisScreen,
  DiagnosisResultScreen,
  LowConfidenceScreen,
  AiPredictionsScreen,
} from "./ScanSubflows"

export const routeScreens: Record<Route, ComponentType> = {
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
  weather: WeatherScreen,
  myFarm: MyFarmScreen,
  voiceAssistant: VoiceAssistantScreen,
  offlineMode: OfflineModeScreen,
  howAiWorks: HowAiWorksScreen,
  technicalArch: TechnicalArchScreen,
  settings: SettingsScreen,
  schemeDetail: SchemeDetailScreen,
  scanProcessing: ScanProcessingScreen,
  scanResult: ScanResultScreen,
  scanHistory: ScanHistoryScreen,

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

  // AI scan subflows
  aiAnalysis: AIAnalysisScreen,
  diseaseResult: DiagnosisResultScreen,
  lowConfidence: LowConfidenceScreen,
  aiPredictions: AiPredictionsScreen,
}

