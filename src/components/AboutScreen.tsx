import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import { FadeSlideIn, ScalePressable } from "./Motion"
import { Sprout, ShieldCheck, Award, Lock, FileText, ChevronRight } from "lucide-react-native"

export default function AboutScreen() {
  const { t, lang } = useLang()
  const { open } = useNav()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={t.profile?.rows?.about || (isKn ? "ಕೃಷಿಕಧಾರಾ ಬಗ್ಗೆ" : "About KrushikaDhara")}
      subtitle={
        isKn
          ? "ರೈತರಿಗಾಗಿ AI ಆಧಾರಿತ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ"
          : "AI-Powered Agricultural Intelligence for Farmers"
      }
    >
      <FadeSlideIn delay={30}>
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Sprout size={36} color="#ffffff" />
          </View>
          <Text style={styles.appName}>KrushikaDhara</Text>
          <Text style={styles.appKannada}>ಕೃಷಿಕಧಾರಾ</Text>
          <Text style={styles.versionBadge}>
            v1.0.0 ({isKn ? "ಉತ್ಪಾದನಾ ಆವೃತ್ತಿ" : "Production Release"})
          </Text>

          <Text style={styles.desc}>
            {isKn
              ? "ಕೃಷಿಕಧಾರಾ ಕರ್ನಾಟಕ ಮತ್ತು ಭಾರತದ ರೈತರಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ನಿರ್ಮಿಸಲಾದ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸಹಾಯಕ. ಇದು YOLO11s TFLite ಕೀಟ ಪತ್ತೆ, ನೇರ APMC ಮಂಡಿ ದರ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಸರ್ವಂ AI ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯ, ಯಂತ್ರ ಬಾಡಿಗೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ನೀಡುತ್ತದೆ."
              : "KrushikaDhara is a comprehensive digital assistant built specifically for farmers in Karnataka and across India — uniting YOLO11s TFLite pest detection, live APMC Mandi rates, agricultural weather, Kannada Voice AI, equipment rentals, and government schemes."}
          </Text>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={90}>
        <View style={styles.featuresCard}>
          <View style={styles.featureItem}>
            <ShieldCheck size={20} color="#256428" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>
                {isKn ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಏಕೀಕರಣ" : "Government Portal Aligned"}
              </Text>
              <Text style={styles.featureDesc}>
                {isKn
                  ? "PM-KISAN, PMFBY ಮತ್ತು ಕರ್ನಾಟಕ ರೈತ ಸಿರಿ ಮಾರ್ಗದರ್ಶಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿದೆ"
                  : "Aligned with PM-KISAN, PMFBY & Karnataka Raitha Siri portals"}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Award size={20} color="#256428" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>
                {isKn ? "102 ಕೀಟ ವರ್ಗಗಳ AI ಪತ್ತೆ" : "102-Class Pest & Crop AI"}
              </Text>
              <Text style={styles.featureDesc}>
                {isKn
                  ? "EXIF-ಸರಿಪಡಿಸಿದ YOLO11s TFLite + Gemini AI ಚಿಕಿತ್ಸಾ ವರದಿಗಳು"
                  : "EXIF-normalized YOLO11s TFLite detection paired with Gemini remedies"}
              </Text>
            </View>
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={150}>
        <View style={styles.legalCard}>
          <ScalePressable
            onPress={() => open("privacyPolicy")}
            style={styles.legalRow}
          >
            <View style={styles.legalRowLeft}>
              <Lock size={17} color="#256428" />
              <Text style={styles.legalRowLabel}>
                {t.x.coreA.settings.privacy || (isKn ? "ಗೌಪ್ಯತಾ ನೀತಿ" : "Privacy Policy")}
              </Text>
            </View>
            <ChevronRight size={17} color="#9ca3af" />
          </ScalePressable>
          <View style={styles.legalDivider} />
          <ScalePressable
            onPress={() => open("termsOfService")}
            style={styles.legalRow}
          >
            <View style={styles.legalRowLeft}>
              <FileText size={17} color="#256428" />
              <Text style={styles.legalRowLabel}>
                {t.x.coreA.settings.terms || (isKn ? "ಸೇವಾ ನಿಯಮಗಳು" : "Terms of Service")}
              </Text>
            </View>
            <ChevronRight size={17} color="#9ca3af" />
          </ScalePressable>
        </View>
      </FadeSlideIn>

      <View style={styles.footerWrap}>
        <Text style={styles.footerHeart}>
          {isKn
            ? "ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ❤️ ದಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ"
            : "Made with ❤️ for Indian Farmers"}
        </Text>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  appKannada: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#256428",
    marginTop: 2,
  },
  versionBadge: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4b5563",
    textAlign: "center",
    marginTop: 14,
  },
  featuresCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  featureDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  footerWrap: {
    alignItems: "center",
    marginBottom: 30,
  },
  legalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  legalRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legalRowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  legalDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  footerHeart: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
})
