import { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang, fmt } from "../i18n"
import { useProfile } from "../profile"
import { getScanHistory, subscribeScanHistory } from "../storage/scanHistory"
import {
  BarChart3,
  Sprout,
  IndianRupee,
  Droplets,
  Leaf,
} from "lucide-react-native"

type RangeKey = "6M" | "1Y" | "All"

const RANGE_TREND: Record<
  RangeKey,
  {
    yieldScale: number
    revScale: number
    waterPct: string
    deltaYield: string
    deltaRev: string
    bars: Array<{ monthKey: string; pct: number }>
  }
> = {
  "6M": {
    yieldScale: 1,
    revScale: 1,
    waterPct: "18%",
    deltaYield: "+12%",
    deltaRev: "+8%",
    bars: [
      { monthKey: "Apr", pct: 44 },
      { monthKey: "May", pct: 56 },
      { monthKey: "Jun", pct: 52 },
      { monthKey: "Jul", pct: 72 },
      { monthKey: "Aug", pct: 84 },
      { monthKey: "Sep", pct: 100 },
    ],
  },
  "1Y": {
    yieldScale: 1.9,
    revScale: 1.85,
    waterPct: "22%",
    deltaYield: "+18%",
    deltaRev: "+15%",
    bars: [
      { monthKey: "Nov", pct: 48 },
      { monthKey: "Jan", pct: 62 },
      { monthKey: "Mar", pct: 55 },
      { monthKey: "May", pct: 74 },
      { monthKey: "Jul", pct: 88 },
      { monthKey: "Sep", pct: 96 },
    ],
  },
  All: {
    yieldScale: 3.4,
    revScale: 3.2,
    waterPct: "24%",
    deltaYield: "+29%",
    deltaRev: "+24%",
    bars: [
      { monthKey: "2022", pct: 52 },
      { monthKey: "2023", pct: 64 },
      { monthKey: "2024", pct: 76 },
      { monthKey: "2025", pct: 89 },
      { monthKey: "2026", pct: 100 },
    ],
  },
}

const CROP_COLORS = ["#256428", "#7cc142", "#f59e0b", "#14b8a6", "#6366f1"]

const SOIL_METRICS = [
  { key: "n" as const, value: 78, color: "#16a34a" },
  { key: "p" as const, value: 54, color: "#f59e0b" },
  { key: "k" as const, value: 66, color: "#0d9488" },
  { key: "moisture" as const, value: 42, color: "#2563eb" },
]

const RANGES: RangeKey[] = ["6M", "1Y", "All"]

export default function InsightsScreen() {
  const { t, lang } = useLang()
  const { profile, scansCount } = useProfile()
  const insets = useSafeAreaInsets()
  const isKn = lang === "kn"

  const [range, setRange] = useState<RangeKey>("6M")
  const [scans, setScans] = useState(() => getScanHistory())

  useEffect(() => {
    setScans(getScanHistory())
    return subscribeScanHistory(setScans)
  }, [])

  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const monthsMap = (t.x.coreA.months as Record<string, string>) || {}
  const rangeData = RANGE_TREND[range]

  const acres = Math.max(0.5, parseFloat(profile.farmSize) || 4.2)
  const totalYieldKg = Math.round(705 * acres * rangeData.yieldScale)
  const totalRevenueInr = Math.round(17660 * acres * rangeData.revScale)

  const cropsList =
    profile.crops && profile.crops.length > 0 ? profile.crops : ["Rice", "Ragi"]
  const baseShare = Math.floor(100 / cropsList.length)
  const remainder = 100 - baseShare * cropsList.length
  const dynamicCropSplit = cropsList.map((crop, idx) => ({
    name: cropMap[crop] || crop,
    value: baseShare + (idx === 0 ? remainder : 0),
    color: CROP_COLORS[idx % CROP_COLORS.length],
  }))

  const healthyScans = scans.filter((s) => s.status === "healthy").length
  const totalScanNum = Math.max(scans.length, scansCount)
  const cropDelta =
    totalScanNum > 0
      ? isKn
        ? `${healthyScans}/${totalScanNum} ಆರೋಗ್ಯ`
        : `${healthyScans}/${totalScanNum} ok`
      : t.insights.stats.ready

  const stats = [
    {
      key: "yield" as const,
      value: `${totalYieldKg.toLocaleString("en-IN")} ${isKn ? "ಕೆ.ಜಿ" : "kg"}`,
      icon: Sprout,
      tint: "#dcfce7",
      color: "#16a34a",
      delta: rangeData.deltaYield,
    },
    {
      key: "revenue" as const,
      value: `₹${totalRevenueInr.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      tint: "#fef3c7",
      color: "#d97706",
      delta: rangeData.deltaRev,
    },
    {
      key: "crops" as const,
      value: String(cropsList.length),
      icon: Leaf,
      tint: "#ccfbf1",
      color: "#0d9488",
      delta: cropDelta,
    },
    {
      key: "water" as const,
      value: rangeData.waterPct,
      icon: Droplets,
      tint: "#dbeafe",
      color: "#2563eb",
      delta: t.insights.stats.vsYr,
    },
  ]

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
          <Text style={styles.headerSubtitle}>
            {t.insights.subtitle} · {profile.district} ({fmt(t.x.coreA.common.acresValue, { size: profile.farmSize })})
          </Text>
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
              {RANGES.map((r) => (
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
                    {t.x.coreA.insights.ranges[r] || r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.barsContainer}>
            {rangeData.bars.map((item) => (
              <View key={item.monthKey} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${item.pct}%` }]} />
                </View>
                <Text style={styles.barLabel}>
                  {monthsMap[item.monthKey] || item.monthKey}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Crop Distribution (Dynamic from Farmer Profile) */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>{t.insights.cropDist}</Text>
          <View style={styles.cropSplitList}>
            {dynamicCropSplit.map((crop) => (
              <View key={crop.name} style={styles.cropRow}>
                <View style={styles.cropInfo}>
                  <View style={[styles.cropDot, { backgroundColor: crop.color }]} />
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropValue}>{crop.value}%</Text>
                </View>
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
            {SOIL_METRICS.map((s) => (
              <View key={s.key} style={styles.soilCard}>
                <View style={styles.soilTopRow}>
                  <Text style={styles.soilName}>{t.insights.soilRows[s.key]}</Text>
                  <Text style={styles.soilValue}>{s.value}%</Text>
                </View>
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
  soilTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
