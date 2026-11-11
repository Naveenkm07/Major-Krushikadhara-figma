import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNav } from "../nav"
import {
  ChevronLeft,
  RotateCcw,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  FlaskConical,
  ShieldCheck,
} from "lucide-react-native"
import type { PestDetectionResult } from "../api/scan"

type TabType = "treatment" | "symptoms" | "prevention"

export default function ScanResultScreen() {
  const { back, params } = useNav()
  const insets = useSafeAreaInsets()
  const [tab, setTab] = useState<TabType>("treatment")
  const [saved, setSaved] = useState(false)

  // Received diagnosis from scan processing
  const diagnosis: PestDetectionResult | undefined = params?.diagnosis
  const imageUri: string =
    diagnosis?.imageUrl ||
    params?.imageUri ||
    "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=450&fit=crop&auto=format"

  // Handle healthy crop vs detected pest
  const isHealthy = diagnosis ? (diagnosis.healthy || !diagnosis.pest_name) : false

  const pestName = diagnosis?.pest_name
    ? diagnosis.pest_name.charAt(0).toUpperCase() + diagnosis.pest_name.slice(1)
    : isHealthy
    ? "Healthy Crop (ಆರೋಗ್ಯಕರ ಬೆಳೆ)"
    : "Tomato Early Blight"

  const confidence = diagnosis ? diagnosis.confidence : 94
  const severity = diagnosis?.severity ?? (isHealthy ? "None" : "Moderate")

  const about =
    diagnosis?.about && diagnosis.about.trim()
      ? diagnosis.about
      : isHealthy
      ? "ಯಾವುದೇ ಹಾನಿಕಾರಕ ಕೀಟಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ನಿಮ್ಮ ಬೆಳೆಯು ಆರೋಗ್ಯಕರವಾಗಿದೆ ಮತ್ತು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ. (No pests detected. Your crop leaf appears clean and healthy.)"
      : "Early Blight is a common fungal leaf disease. It produces dark brown spots with characteristic concentric rings, primarily affecting older foliage first."

  const symptoms =
    diagnosis?.symptoms && diagnosis.symptoms.length > 0
      ? diagnosis.symptoms
      : isHealthy
      ? ["ಯಾವುದೇ ಕೀಟ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ (No adverse symptoms)", "ಸಾಮಾನ್ಯ ಎಲೆ ರಚನೆ ಮತ್ತು ಹಸಿರು ಬಣ್ಣ (Normal green leaf vigor)"]
      : [
          "Dark brown spots with concentric target-like rings",
          "Yellow halo surrounding leaf lesions",
          "Premature leaf drop from the lower stem",
        ]

  const chemical =
    diagnosis?.chemical && diagnosis.chemical.length > 0
      ? diagnosis.chemical
      : isHealthy
      ? ["ಯಾವುದೇ ರಾಸಾಯನಿಕ ಕೀಟನಾಶಕಗಳ ಅಗತ್ಯವಿಲ್ಲ (No chemical sprays required)"]
      : [
          "Mancozeb 75% WP @ 2.5 g/L water",
          "Chlorothalonil 75% WP @ 2 g/L water",
        ]

  const organic =
    diagnosis?.organic && diagnosis.organic.length > 0
      ? diagnosis.organic
      : isHealthy
      ? [
          "ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಬೇವಿನ ಎಣ್ಣೆ 5 ml/L ಸಿಂಪಡಿಸಿ (Neem oil 5 ml/L preventive spray)",
          "ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ಮತ್ತು ನೀರಾವರಿ ನಿರ್ವಹಣೆ (Balanced nutrition)",
        ]
      : [
          "Neem oil 5 ml/L + liquid soap spray at dusk",
          "Trichoderma viride @ 5 g/L root drench",
        ]

  const prevention =
    diagnosis?.prevention && diagnosis.prevention.length > 0
      ? diagnosis.prevention
      : [
          "ಪ್ರತಿ 3-5 ದಿನಗಳಿಗೊಮ್ಮೆ ಗದ್ದೆ ಪರಿಶೀಲನೆ (Scout field every 3-5 days)",
          "ಬೆಳೆ ಸರದಿ ಪದ್ಧತಿಯನ್ನು ಅನುಸರಿಸಿ (Practice crop rotation)",
          "ಸರಿಯಾದ ಅಂತರ ಮತ್ತು ಗಾಳಿಯಾಡುವಂತೆ ನಿರ್ವಹಿಸಿ (Maintain proper aeration)",
        ]

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + 10, 44),
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={back} style={styles.iconCircle}>
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diagnosis Report</Text>
          <TouchableOpacity
            onPress={() => setSaved(!saved)}
            style={styles.iconCircle}
          >
            <Bookmark
              size={18}
              color="#ffffff"
              fill={saved ? "#ffffff" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Crop Hero Image with Badges */}
        <View style={styles.imageCard}>
          <Image source={{ uri: imageUri }} style={styles.leafImg} />
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.confidencePill,
                { backgroundColor: isHealthy ? "rgba(22, 101, 52, 0.95)" : "rgba(185, 28, 28, 0.95)" },
              ]}
            >
              <CheckCircle2 size={13} color="#ffffff" />
              <Text style={styles.confidenceText}>{confidence}% Match</Text>
            </View>
            <View
              style={[
                styles.severityPill,
                {
                  backgroundColor:
                    severity === "High"
                      ? "rgba(220, 38, 38, 0.95)"
                      : severity === "Moderate"
                      ? "rgba(217, 119, 6, 0.95)"
                      : "rgba(22, 101, 52, 0.95)",
                },
              ]}
            >
              <Text style={styles.severityText}>
                {isHealthy ? "Status: Healthy" : `Severity: ${severity}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Pest Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.pestHeaderRow}>
            <Text style={styles.diseaseTitle}>{pestName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isHealthy ? "#dcfce7" : "#fee2e2" }]}>
              {isHealthy ? (
                <ShieldCheck size={14} color="#15803d" />
              ) : (
                <AlertTriangle size={14} color="#dc2626" />
              )}
              <Text style={[styles.statusBadgeText, { color: isHealthy ? "#15803d" : "#dc2626" }]}>
                {isHealthy ? "Healthy" : "Action Needed"}
              </Text>
            </View>
          </View>
          <Text style={styles.scientificName}>
            {isHealthy
              ? "ಕೀಟ ಮುಕ್ತ ಬೆಳೆ · Healthy Foliage Inspection"
              : `Pest Instances Detected: ${diagnosis?.total_pests_found ?? 1}`}
          </Text>
          <Text style={styles.aboutText}>{about}</Text>
        </View>

        {/* Section Tabs (Treatment, Symptoms, Prevention) */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setTab("treatment")}
            style={[styles.tabBtn, tab === "treatment" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "treatment" && styles.tabBtnTextActive,
              ]}
            >
              Treatment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("symptoms")}
            style={[styles.tabBtn, tab === "symptoms" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "symptoms" && styles.tabBtnTextActive,
              ]}
            >
              Symptoms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("prevention")}
            style={[styles.tabBtn, tab === "prevention" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "prevention" && styles.tabBtnTextActive,
              ]}
            >
              Prevention
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === "treatment" && (
          <View style={styles.sectionWrap}>
            {/* Organic Remedies */}
            <View style={styles.remedyCard}>
              <View style={styles.remedyHeader}>
                <Leaf size={18} color="#16a34a" />
                <Text style={styles.remedyTitle}>Organic / Bio Remedies</Text>
              </View>
              {organic.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>🌱</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Chemical Remedies */}
            <View style={styles.remedyCard}>
              <View style={styles.remedyHeader}>
                <FlaskConical size={18} color="#2563eb" />
                <Text style={styles.remedyTitle}>Chemical Sprays & Dosages</Text>
              </View>
              {chemical.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>🧪</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === "symptoms" && (
          <View style={styles.sectionWrap}>
            <View style={styles.remedyCard}>
              <Text style={styles.remedyTitle}>Identified Symptoms & Signs</Text>
              {symptoms.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === "prevention" && (
          <View style={styles.sectionWrap}>
            <View style={styles.remedyCard}>
              <Text style={styles.remedyTitle}>Long-term Prevention Guidelines</Text>
              {prevention.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>✓</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions: Retake Scan */}
        <TouchableOpacity
          onPress={() => back()}
          activeOpacity={0.85}
          style={styles.retakeBtn}
        >
          <RotateCcw size={18} color="#ffffff" />
          <Text style={styles.retakeText}>Scan Another Plant / ಇನ್ನೊಂದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  imageCard: {
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#e5e7eb",
    marginBottom: 16,
  },
  leafImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badgeRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confidencePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  titleCard: {
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
  pestHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  scientificName: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4b5563",
    marginTop: 10,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabBtnTextActive: {
    color: "#256428",
    fontWeight: "bold",
  },
  sectionWrap: {
    gap: 14,
    marginBottom: 24,
  },
  remedyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  remedyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  remedyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    lineHeight: 18,
  },
  listText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#374151",
    flex: 1,
  },
  retakeBtn: {
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retakeText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
