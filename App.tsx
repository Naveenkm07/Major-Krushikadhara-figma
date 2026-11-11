import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Context Providers
import { LangProvider, useLang } from "./src/i18n"
import { NavProvider, useNav } from "./src/nav"
import { ProfileProvider } from "./src/profile"
import { EquipmentProvider } from "./src/equipment"
import { InsuranceProvider } from "./src/insurance"

// Startup management
import {
  completeOnboarding,
  endSession,
  markLanguageChosen,
  resolveStartup,
  saveOnboardingStep,
  startSession,
  type StartupStage,
} from "./src/startup"

// Onboarding & Root Screens
import SplashScreen from "./src/components/SplashScreen"
import LanguageSelectScreen from "./src/components/LanguageSelectScreen"
import OnboardingScreen from "./src/components/OnboardingScreen"
import AuthScreen from "./src/components/AuthScreen"
import BottomNav, { type Tab } from "./src/components/BottomNav"

// Tab Screens
import HomeScreen from "./src/components/HomeScreen"
import ScanScreen from "./src/components/ScanScreen"
import InsightsScreen from "./src/components/InsightsScreen"
import GovtSchemesScreen from "./src/components/GovtSchemesScreen"
import ProfileScreen from "./src/components/ProfileScreen"

// Complete Route Registry for all sub-screens
import { routeScreens } from "./src/components/routeRegistry"

type Stage = "splash" | StartupStage
const MIN_SPLASH_MS = 1400

function MainApp() {
  const [stage, setStage] = useState<Stage>("splash")
  const [tab, setTab] = useState<Tab>("home")
  const [onboardingStep, setOnboardingStep] = useState(0)

  const { current, reset } = useNav()

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

  if (stage === "splash") {
    return <SplashScreen />
  }

  if (stage === "language") {
    return (
      <LanguageSelectScreen
        onDone={() => {
          markLanguageChosen()
          setStage("onboarding")
        }}
      />
    )
  }

  if (stage === "onboarding") {
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
  }

  if (stage === "auth") {
    return (
      <AuthScreen
        onDone={() => {
          startSession()
          setStage("app")
        }}
      />
    )
  }

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
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Tab Screens */}
      <View style={styles.tabContent}>
        {tab === "home" && <HomeScreen onNavigate={changeTab} />}
        {tab === "scan" && <ScanScreen />}
        {tab === "insights" && <InsightsScreen />}
        {tab === "schemes" && <GovtSchemesScreen />}
        {tab === "profile" && <ProfileScreen onLogout={logout} />}
      </View>

      {/* Floating/Persistent Bottom Tab Bar */}
      <BottomNav active={tab} onChange={changeTab} />

      {/* Overlay Stack Route Screen */}
      {RouteScreen && <RouteScreen key={routeKey} />}
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LangProvider>
        <ProfileProvider>
          <EquipmentProvider>
            <InsuranceProvider>
              <NavProvider>
                <MainApp />
              </NavProvider>
            </InsuranceProvider>
          </EquipmentProvider>
        </ProfileProvider>
      </LangProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  tabContent: {
    flex: 1,
  },
})
