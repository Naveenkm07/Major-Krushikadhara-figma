import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Sprout, Heart, ShieldCheck, Award } from "lucide-react-native"

export default function AboutScreen() {
  const { t } = useLang()
  return (
    <DetailShell
      title={t.profile?.rows?.about || "About KrushikaDhara"}
      subtitle="AI-Powered Agricultural Intelligence for Farmers"
    >
      <View style={styles.card}>
        <View style={styles.logoCircle}>
          <Sprout size={36} color="#ffffff" />
        </View>
        <Text style={styles.appName}>KrushikaDhara</Text>
        <Text style={styles.appKannada}>ಕೃಷಿಕಧಾರಾ</Text>
        <Text style={styles.versionBadge}>v1.0.0 (Production Release)</Text>

        <Text style={styles.desc}>
          KrushikaDhara is a comprehensive digital assistant built specifically for farmers in Karnataka and throughout India. Combining deep vision AI crop diagnostics, hyper-local APMC Mandi rates, seamless agricultural machinery rentals, and simplified PMFBY crop insurance access.
        </Text>
      </View>

      <View style={styles.featuresCard}>
        <View style={styles.featureItem}>
          <ShieldCheck size={20} color="#256428" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Government Verified</Text>
            <Text style={styles.featureDesc}>Aligned with PMFBY & Karnataka Raitha Siri guidelines</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Award size={20} color="#256428" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>94% AI Accuracy</Text>
            <Text style={styles.featureDesc}>Trained on 100,000+ crop disease specimen images</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerWrap}>
        <Text style={styles.footerHeart}>Made with ❤️ for Indian Farmers</Text>
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
  footerHeart: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
})

