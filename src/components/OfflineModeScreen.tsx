import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import { useAppSettings } from "../storage/appSettings"
import DetailShell from "./DetailShell"
import { WifiOff, CheckCircle2 } from "lucide-react-native"

export default function OfflineModeScreen() {
  const { lang, t } = useLang()
  const { settings } = useAppSettings()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={t.x.coreA.settings.offlineMode}
      subtitle={
        isKn
          ? "ಕಡಿಮೆ ನೆಟ್‌ವರ್ಕ್ ಇರುವ ಪ್ರದೇಶಗಳಲ್ಲೂ ಉಪಯುಕ್ತ"
          : "Graceful fallback in low-connectivity farmland areas"
      }
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <WifiOff size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>
          {isKn ? "ಆಫ್‌ಲೈನ್-ಮೊದಲ ವಿನ್ಯಾಸ" : "Resilient Offline-First Experience"}
        </Text>
        <Text style={styles.desc}>
          {isKn
            ? `ಇಂಟರ್ನೆಟ್ ಸಿಗದ ದೂರದ ಹೊಲಗಳಲ್ಲೂ ನಿಮ್ಮ ಉಳಿಸಿದ ಸಲಹೆಗಳು, ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ ಲಭ್ಯವಿರುತ್ತದೆ. (${settings.cacheSizeMb} ಕ್ಯಾಶ್ ಸಿದ್ಧ)`
            : `Even in remote farm plots with weak reception, KrushikaDhara keeps your farm records, saved remedies, and cached crop stage advice available (${settings.cacheSizeMb} cached).`}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {isKn ? "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು:" : "What works offline:"}
        </Text>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>
            {isKn
              ? "ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ ಮತ್ತು ಸಾವಯವ/ರಾಸಾಯನಿಕ ಪರಿಹಾರಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
              : "Review saved scan diagnoses and organic & chemical dosage remedies"}
          </Text>
        </View>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>
            {isKn
              ? "ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರಗಳು, ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ಬುಕ್‌ಮಾರ್ಕ್ ಸಲಹೆಗಳನ್ನು ನೋಡಿ"
              : "View your farm records, active crop calendar stage & saved tips"}
          </Text>
        </View>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>
            {isKn
              ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ದಾಖಲೆ ಪಟ್ಟಿ ಮತ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
              : "Browse government scheme checklists and helpline directory"}
          </Text>
        </View>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  desc: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  itemText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
})
