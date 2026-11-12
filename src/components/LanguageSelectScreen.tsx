import { useRef, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Check, Globe, Languages, Sprout } from "lucide-react-native"
import { useLang, type Lang } from "../i18n"
import { FadeSlideIn, ScalePressable } from "./Motion"

const options: {
  id: Lang
  label: string
  action: string
  kannada: boolean
}[] = [
  { id: "kn", label: "ಕನ್ನಡ", action: "ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ", kannada: true },
  { id: "en", label: "English", action: "Continue in English", kannada: false },
]

export default function LanguageSelectScreen({ onDone }: { onDone: () => void }) {
  const { lang, setLang } = useLang()
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<Lang>(lang)
  const isChoosing = useRef(false)

  function choose(id: Lang) {
    if (isChoosing.current) return
    isChoosing.current = true
    setSelected(id)
    setLang(id)
    setTimeout(onDone, 300)
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 20, 50),
          paddingBottom: Math.max(insets.bottom + 20, 40),
        },
      ]}
    >
      <View style={styles.centerContent}>
        {/* Sprout Icon */}
        <FadeSlideIn delay={40}>
          <View style={styles.iconCircle}>
            <Sprout size={40} color="#ffffff" />
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={110}>
          <Text style={styles.kannadaHeading}>ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ</Text>
          <Text style={styles.englishHeading}>Choose Your Language</Text>

          <Text style={styles.subtext}>ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.</Text>
          <Text style={styles.subtextEn}>Select your preferred language to continue.</Text>
        </FadeSlideIn>

        {/* Language Options */}
        <View style={styles.optionsList}>
          {options.map((o, idx) => {
            const active = selected === o.id
            return (
              <FadeSlideIn key={o.id} delay={190 + idx * 80}>
                <ScalePressable
                  onPress={() => choose(o.id)}
                  scaleTo={0.97}
                  style={[
                    styles.optionCard,
                    active && styles.optionCardActive,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIconContainer,
                      active && styles.optionIconActive,
                    ]}
                  >
                    {o.id === "kn" ? (
                      <Languages size={24} color={active ? "#ffffff" : "#256428"} />
                    ) : (
                      <Globe size={24} color={active ? "#ffffff" : "#256428"} />
                    )}
                  </View>

                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{o.label}</Text>
                    <Text style={styles.optionAction}>{o.action}</Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      active && styles.radioCircleActive,
                    ]}
                  >
                    {active && <Check size={16} color="#ffffff" />}
                  </View>
                </ScalePressable>
              </FadeSlideIn>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "#256428",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  kannadaHeading: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: "bold",
    color: "#256428",
    textAlign: "center",
  },
  englishHeading: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "600",
    color: "#256428",
    textAlign: "center",
  },
  subtext: {
    marginTop: 14,
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
  subtextEn: {
    marginTop: 3,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  optionsList: {
    marginTop: 32,
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  optionCardActive: {
    borderColor: "#256428",
    backgroundColor: "#f0fdf4",
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconActive: {
    backgroundColor: "#256428",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  optionAction: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 3,
  },
  radioCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: "#256428",
    backgroundColor: "#256428",
  },
})

