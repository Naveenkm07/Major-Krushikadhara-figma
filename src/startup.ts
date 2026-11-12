const memoryStore: Record<string, string> = {
  // Can be preloaded or persistent
}

const KEYS = {
  langChosen: "krushikadhara.langChosen",
  onboarded: "krushikadhara.onboarded",
  step: "krushikadhara.onboardingStep",
  session: "krushikadhara.session",
} as const

export type StartupStage = "language" | "onboarding" | "auth" | "app"

function read(key: string): string | null {
  return memoryStore[key] ?? null
}

function write(key: string, value: string | null) {
  if (value === null) {
    delete memoryStore[key]
  } else {
    memoryStore[key] = value
  }
}

export function resolveStartup(): { stage: StartupStage; onboardingStep: number } {
  const step = Number.parseInt(read(KEYS.step) ?? "0", 10)
  const onboardingStep = Number.isFinite(step) && step > 0 ? step : 0
  const onboarded = read(KEYS.onboarded) === "1"
  if (!onboarded && read(KEYS.langChosen) !== "1") return { stage: "language", onboardingStep: 0 }
  if (!onboarded) return { stage: "onboarding", onboardingStep }
  if (read(KEYS.session) !== "1") return { stage: "auth", onboardingStep: 0 }
  return { stage: "app", onboardingStep: 0 }
}

export const markLanguageChosen = () => write(KEYS.langChosen, "1")

export const saveOnboardingStep = (i: number) => write(KEYS.step, String(i))

export function completeOnboarding() {
  write(KEYS.onboarded, "1")
  write(KEYS.step, null)
}

export const startSession = () => write(KEYS.session, "1")
export const endSession = () => write(KEYS.session, null)

const logoutListeners = new Set<() => void>()

export function subscribeLogoutRequest(cb: () => void): () => void {
  logoutListeners.add(cb)
  return () => {
    logoutListeners.delete(cb)
  }
}

export function triggerAppLogout() {
  endSession()
  logoutListeners.forEach((cb) => cb())
}


