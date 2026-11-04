const KEYS = {
  langChosen: "krushikadhara.langChosen",
  onboarded: "krushikadhara.onboarded",
  step: "krushikadhara.onboardingStep",
  session: "krushikadhara.session",
} as const

export type StartupStage = "language" | "onboarding" | "auth" | "app"

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
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
