import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Sprout, Wheat, Droplets, FlaskConical, Scissors, Check } from "lucide-react-native"

const STAGES = [
  { name: "Sowing & Seed Treatment", range: "Days 1 - 15", icon: Sprout, done: true, color: "#16a34a", bg: "#dcfce7" },
  { name: "Vegetative & Tillering", range: "Days 16 - 45", icon: Wheat, current: true, color: "#0d9488", bg: "#ccfbf1" },
  { name: "Panicle Initiation & Irrigation", range: "Days 46 - 75", icon: Droplets, color: "#2563eb", bg: "#dbeafe" },
  { name: "Flowering & Nutrient Boost", range: "Days 76 - 100", icon: FlaskConical, color: "#ea580c", bg: "#ffedd5" },
  { name: "Ripening & Harvesting", range: "Days 101 - 125", icon: Scissors, color: "#9333ea", bg: "#f3e8ff" },
]

export default function CropCalendarScreen() {
  const { t } = useLang()
  return (
    <DetailShell
      title={t.quickActions?.calendar || "Crop Calendar"}
      subtitle="Kharif Paddy Lifecycle · Mandya Field #1"
    >
      {/* Current Stage Hero Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerSub}>Active Growth Stage</Text>
        <Text style={styles.bannerCrop}>Paddy (BPT 5204 - Sona Masoori)</Text>
        <Text style={styles.bannerPhase}>Vegetative Stage · Day 28 of 125</Text>
      </View>

      {/* Vertical Timeline */}
      <View style={styles.timelineList}>
        {STAGES.map((st, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.iconColumn}>
              <View
                style={[
                  styles.stageIconWrap,
                  { backgroundColor: st.bg },
                  st.current && styles.stageIconCurrent,
                ]}
              >
                <st.icon size={20} color={st.color} />
              </View>
              {i < STAGES.length - 1 && <View style={styles.timelineLine} />}
            </View>

            <View
              style={[
                styles.stageCard,
                st.current && styles.stageCardCurrent,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.stageName}>{st.name}</Text>
                {st.done && (
                  <View style={styles.donePill}>
                    <Check size={12} color="#15803d" />
                    <Text style={styles.doneText}>Completed</Text>
                  </View>
                )}
                {st.current && (
                  <View style={styles.currentPill}>
                    <Text style={styles.currentText}>In Progress</Text>
                  </View>
                )}
              </View>
              <Text style={styles.stageRange}>{st.range}</Text>
            </View>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#256428",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
  },
  bannerCrop: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  bannerPhase: {
    fontSize: 13,
    color: "#f6efd8",
    fontWeight: "600",
    marginTop: 6,
  },
  timelineList: {
    paddingBottom: 30,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 14,
    minHeight: 80,
  },
  iconColumn: {
    alignItems: "center",
  },
  stageIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stageIconCurrent: {
    borderWidth: 2,
    borderColor: "#256428",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  stageCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  stageCardCurrent: {
    borderWidth: 1.5,
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stageName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  donePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  doneText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  currentPill: {
    backgroundColor: "#256428",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  currentText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stageRange: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
})

