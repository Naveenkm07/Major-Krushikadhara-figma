import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang, fmt } from "../i18n"
import {
  BarChart3,
  Sprout,
  IndianRupee,
  Droplets,
  Leaf,
  TrendingUp,
} from "lucide-react-native"

const yieldTrend = [
  { month: "Apr", yield: 320, pct: 44 },
  { month: "May", yield: 410, pct: 56 },
  { month: "Jun", yield: 380, pct: 52 },
  { month: "Jul", yield: 520, pct: 72 },
  { month: "Aug", yield: 610, pct: 84 },
  { month: "Sep", yield: 720, pct: 100 },
]

const cropSplit: { key: "rice" | "ragi" | "tomato" | "others"; value: number; color: string }[] = [
  { key: "rice", value: 45, color: "#256428" },
  { key: "ragi", value: 25, color: "#7cc142" },
  { key: "tomato", value: 20, color: "#f59e0b" },
  { key: "others", value: 10, color: "#14b8a6" },
]

const moneyFlow = [
  { month: "Jun", income: 42, expense: 28 },
  { month: "Jul", income: 55, expense: 31 },
  { month: "Aug", income: 61, expense: 34 },
  { month: "Sep", income: 74, expense: 38 },
]

const soil = [
  { key: "n", label: "Nitrogen (N)", value: 78, color: "#16a34a" },
  { key: "p", label: "Phosphorus (P)", value: 54, color: "#f59e0b" },
  { key: "k", label: "Potassium (K)", value: 66, color: "#0d9488" },
  { key: "moisture", label: "Moisture", value: 42, color: "#2563eb" },
]

const ranges = ["6M", "1Y", "All"]

export default function InsightsScreen() {
  const { t } = useLang()
  const insets = useSafeAreaInsets()
  const [range, setRange] = useState("6M")

  const stats = [
    { key: "yield", value: "2,960 kg", icon: Sprout, tint: "#dcfce7", color: "#16a34a", delta: "+12%" },
    { key: "revenue", value: "₹74,200", icon: IndianRupee, tint: "#fef3c7", color: "#d97706", delta: "+8%" },
    { key: "crops", value: "4", icon: Leaf, tint: "#ccfbf1", color: "#0d9488", delta: "2 ready" },
    { key: "water", value: "18%", icon: Droplets, tint: "#dbeafe", color: "#2563eb", delta: "vs last yr" },
  ] as const

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + 10, 44),
            },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <BarChart3 size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>{t.insights.title}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{t.insights.subtitle}</Text>
        </View>

        {/* 4 Stat Cards */}
        <View style={styles.statsGrid}>
          {stats.map(({ key, value, icon: Icon, tint, color, delta }) => (
            <View key={key} style={styles.statCard}>
              <View style={styles.statCardTop}>
                <View style={[styles.statIconBox, { backgroundColor: tint }]}>
                  <Icon size={18} color={color} />
                </View>
                <Text style={styles.statDelta}>{delta}</Text>
              </View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{t.insights.stats[key]}</Text>
            </View>
          ))}
        </View>

        {/* Yield Trend Bar Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>{t.insights.yieldTrend}</Text>
              <Text style={styles.cardSubtitle}>{t.insights.yieldUp}</Text>
            </View>
            <View style={styles.rangePicker}>
              {ranges.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  style={[
                    styles.rangePill,
                    range === r && styles.rangePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeText,
                      range === r && styles.rangeTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Native Bar Visualization */}
          <View style={styles.barsContainer}>
            {yieldTrend.map((item) => (
              <View key={item.month} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${item.pct}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Crop Distribution */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>{t.insights.cropDist}</Text>
          <View style={styles.cropSplitList}>
            {cropSplit.map((crop) => (
              <View key={crop.key} style={styles.cropRow}>
                <View style={styles.cropInfo}>
                  <View style={[styles.cropDot, { backgroundColor: crop.color }]} />
                  <Text style={styles.cropName}>
                    {t.insights.cropNames[crop.key] || crop.key}
                  </Text>
                </View>
                <Text style={styles.cropValue}>{crop.value}%</Text>
                <View style={styles.cropBarTrack}>
                  <View
                    style={[
                      styles.cropBarFill,
                      { width: `${crop.value}%`, backgroundColor: crop.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Soil Health */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>{t.insights.soil}</Text>
          <View style={styles.soilGrid}>
            {soil.map((s) => (
              <View key={s.key} style={styles.soilCard}>
                <Text style={styles.soilName}>{s.label}</Text>
                <Text style={styles.soilValue}>{s.value}%</Text>
                <View style={styles.soilBarTrack}>
                  <View
                    style={[
                      styles.soilBarFill,
                      { width: `${s.value}%`, backgroundColor: s.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  scrollContent: {
    paddingBottom: 36,
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statDelta: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#16a34a",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 12,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
    marginTop: 2,
  },
  rangePicker: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 3,
  },
  rangePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rangePillActive: {
    backgroundColor: "#ffffff",
  },
  rangeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  rangeTextActive: {
    color: "#256428",
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barTrack: {
    width: 22,
    height: 100,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#256428",
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 6,
  },
  cropSplitList: {
    marginTop: 14,
    gap: 12,
  },
  cropRow: {
    gap: 6,
  },
  cropInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cropDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cropName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  cropValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  cropBarTrack: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
  },
  cropBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  soilGrid: {
    marginTop: 14,
    gap: 12,
  },
  soilCard: {
    gap: 6,
  },
  soilName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  soilValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6b7280",
  },
  soilBarTrack: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
  },
  soilBarFill: {
    height: "100%",
    borderRadius: 3,
  },
})

