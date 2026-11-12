import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import { Animated, Easing, View, Text, TouchableOpacity, StyleSheet } from "react-native"
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
  subscribeLogoutRequest,
  type StartupStage,
} from "./src/startup"
import { clearAuthToken } from "./src/auth"

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

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(err: any) {
    console.error("[KrushikaDhara ErrorBoundary]:", err?.message || err)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🌾</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorTitleKn}>ತಾಂತ್ರಿಕ ದೋಷ ಕಂಡುಬಂದಿದೆ</Text>
        <Text style={styles.errorSub}>
          Tap below to safely reload your KrushikaDhara workspace.
        </Text>
        <TouchableOpacity
          onPress={() => this.setState({ hasError: false })}
          style={styles.errorBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.errorBtnText}>Reload App · ಮತ್ತೆ ತೆರೆಯಿರಿ</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

function MainApp() {
  const { lang } = useLang()
  const [stage, setStage] = useState<Stage>("splash")
  const [tab, setTab] = useState<Tab>("home")
  const [onboardingStep, setOnboardingStep] = useState(0)

  const { current, reset } = useNav()
  const stageFade = useRef(new Animated.Value(1)).current
  const tabFade = useRef(new Animated.Value(1)).current

  useEffect(() => {
    stageFade.setValue(0.82)
    Animated.timing(stageFade, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [stage])

  useEffect(() => {
    tabFade.setValue(0.88)
    Animated.timing(tabFade, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [tab])

  useEffect(() => {
    return subscribeLogoutRequest(() => {
      reset()
      setTab("home")
      setStage("auth")
    })
  }, [reset])

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
      <Animated.View style={[styles.stageWrap, { opacity: stageFade }]}>
        <LanguageSelectScreen
          onDone={() => {
            markLanguageChosen()
            setStage("onboarding")
          }}
        />
      </Animated.View>
    )
  }

  if (stage === "onboarding") {
    return (
      <Animated.View style={[styles.stageWrap, { opacity: stageFade }]}>
        <OnboardingScreen
          initialIndex={onboardingStep}
          onStep={saveOnboardingStep}
          onDone={() => {
            completeOnboarding()
            setStage("auth")
          }}
        />
      </Animated.View>
    )
  }

  if (stage === "auth") {
    return (
      <Animated.View style={[styles.stageWrap, { opacity: stageFade }]}>
        <AuthScreen
          onDone={() => {
            startSession()
            setStage("app")
          }}
        />
      </Animated.View>
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
    clearAuthToken()
    endSession()
    setStage("auth")
  }

  return (
    <Animated.View style={[styles.container, { opacity: stageFade }]}>
      <StatusBar style="light" />

      {/* Main Tab Screens */}
      <Animated.View
        key={lang}
        style={[styles.tabContent, { opacity: tabFade }]}
      >
        {tab === "home" && <HomeScreen onNavigate={changeTab} />}
        {tab === "scan" && <ScanScreen />}
        {tab === "insights" && <InsightsScreen />}
        {tab === "schemes" && <GovtSchemesScreen />}
        {tab === "profile" && <ProfileScreen onLogout={logout} />}
      </Animated.View>

      {/* Floating/Persistent Bottom Tab Bar */}
      <BottomNav active={tab} onChange={changeTab} />

      {/* Overlay Stack Route Screen */}
      {RouteScreen && <RouteScreen key={routeKey} />}
    </Animated.View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
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
      </AppErrorBoundary>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  stageWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  tabContent: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#f7f8ec",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  errorTitleKn: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#256428",
    marginTop: 4,
  },
  errorSub: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 22,
  },
  errorBtn: {
    backgroundColor: "#256428",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  errorBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
})
