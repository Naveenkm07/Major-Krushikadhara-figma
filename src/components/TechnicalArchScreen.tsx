import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Layers } from "lucide-react-native"

export default function TechnicalArchScreen() {
  const { lang, t } = useLang()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={t.x.coreA.settings.techArch}
      subtitle="React Native (Expo) + Node/Express + Neon PostgreSQL + AI"
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Layers size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>
          {isKn ? "ಸಂಪೂರ್ಣ ತಂತ್ರಜ್ಞಾನ ವಿನ್ಯಾಸ" : "End-to-End System Topology"}
        </Text>
        <Text style={styles.desc}>
          {isKn
            ? "React Native (Expo) ಮೊಬೈಲ್ ಆ್ಯಪ್, Node.js/Express ಬ್ಯಾಕ್‌ಎಂಡ್, Neon PostgreSQL ಡೇಟಾಬೇಸ್, YOLO11s TFLite ಕೀಟ ಪತ್ತೆ ಮತ್ತು ಸರ್ವಂ + Gemini AI ಸೇವೆಗಳ ಏಕೀಕರಣ."
            : "Built with React Native (Expo SDK 58), Node.js/Express API backend, Neon Cloud PostgreSQL (Prisma ORM), persistent YOLO11s TFLite worker, and Kannada-first Sarvam AI + Gemini streaming."}
        </Text>
      </View>

      <View style={styles.layersList}>
        <View style={styles.layerCard}>
          <Text style={styles.layerTag}>
            {isKn ? "ಕ್ಲೈಂಟ್ ಪದರ" : "Mobile Client Layer"}
          </Text>
          <Text style={styles.layerTitle}>React Native + Expo SDK 58</Text>
          <Text style={styles.layerDesc}>
            {isKn
              ? "ದ್ವಿಭಾಷಾ (ಕನ್ನಡ/English) UI, ಸ್ಥಳೀಯ ಕ್ಯಾಮೆರಾ, GPS ಸ್ಥಳ ಮತ್ತು Expo Audio ರೆಕಾರ್ಡಿಂಗ್"
              : "Bilingual EN/KN UI, camera/gallery picker, GPS coordinates, and audio recording"}
          </Text>
        </View>

        <View style={styles.layerCard}>
          <Text style={styles.layerTag}>
            {isKn ? "AI ಮತ್ತು ಧ್ವನಿ ಪದರ" : "AI & Vision Layer"}
          </Text>
          <Text style={styles.layerTitle}>YOLO11s TFLite + Sarvam STT + Gemini</Text>
          <Text style={styles.layerDesc}>
            {isKn
              ? "102 ಕೀಟ ವರ್ಗಗಳ TFLite ಮಾದರಿ, ಕನ್ನಡ ಧ್ವನಿ ಪಠ್ಯ ಪರಿವರ್ತನೆ ಮತ್ತು ಕೃಷಿ ಚಿಕಿತ್ಸಾ ಸಲಹೆ"
              : "Persistent Python TFLite worker, Cloudinary image backup, Sarvam STT, and SSE streaming"}
          </Text>
        </View>

        <View style={styles.layerCard}>
          <Text style={styles.layerTag}>
            {isKn ? "ಡೇಟಾಬೇಸ್ ಮತ್ತು ಸರ್ಕಾರಿ API" : "Database & Live Feeds Layer"}
          </Text>
          <Text style={styles.layerTitle}>Neon PostgreSQL + AGMARKNET + Open-Meteo</Text>
          <Text style={styles.layerDesc}>
            {isKn
              ? "ರೈತ ಪ್ರೊಫೈಲ್, ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ, ಸರ್ಕಾರಿ ಯೋಜನೆ ಟ್ರ್ಯಾಕರ್, APMC ಮಂಡಿ ದರ ಮತ್ತು ಹವಾಮಾನ"
              : "Neon Prisma persistence, APMC live prices (data.gov.in), WeatherAPI/Open-Meteo, & 10 govt schemes"}
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
  layersList: {
    gap: 12,
    marginBottom: 30,
  },
  layerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  layerTag: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#256428",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  layerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  layerDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 18,
  },
})
