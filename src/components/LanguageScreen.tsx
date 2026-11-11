import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useLang, type Lang } from "../i18n"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import { Check, Globe, Languages } from "lucide-react-native"

const LANGS: { id: Lang; label: string; native: string; desc: string }[] = [
  { id: "kn", label: "Kannada", native: "ಕನ್ನಡ", desc: "ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ" },
  { id: "en", label: "English", native: "English", desc: "Continue in English" },
]

export default function LanguageScreen() {
  const { lang, setLang } = useLang()
  const { back } = useNav()

  function handleSelect(id: Lang) {
    setLang(id)
    setTimeout(() => back(), 200)
  }

  return (
    <DetailShell title="Language / ಭಾಷೆ" subtitle="Choose your preferred language">
      <View style={styles.list}>
        {LANGS.map((item) => {
          const active = lang === item.id
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelect(item.id)}
              activeOpacity={0.85}
              style={[
                styles.langCard,
                active && styles.langCardActive,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  active && styles.iconWrapActive,
                ]}
              >
                {item.id === "kn" ? (
                  <Languages size={22} color={active ? "#ffffff" : "#256428"} />
                ) : (
                  <Globe size={22} color={active ? "#ffffff" : "#256428"} />
                )}
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.nativeText}>{item.native}</Text>
                <Text style={styles.descText}>{item.desc}</Text>
              </View>

              <View
                style={[
                  styles.radio,
                  active && styles.radioActive,
                ]}
              >
                {active && <Check size={16} color="#ffffff" />}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
    paddingTop: 8,
  },
  langCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  langCardActive: {
    borderColor: "#256428",
    backgroundColor: "#f0fdf4",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "#256428",
  },
  textWrap: {
    flex: 1,
  },
  nativeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  descText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#256428",
    backgroundColor: "#256428",
  },
})

