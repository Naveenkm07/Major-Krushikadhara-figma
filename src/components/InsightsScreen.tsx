import { useCallback, useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang, fmt } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import { getCurrentLocation } from "../utils/location"
import { AnimatedBarColumn, AnimatedProgressFill, FadeSlideIn, ScalePressable } from "./Motion"
import {
  fetchFarmerInsights,
  type InsightsRange,
  type InsightsResponse,
} from "../api/insights"
import {
  getScanHistory,
  subscribeScanHistory,
  type ScanHistoryItem,
} from "../storage/scanHistory"
import {
  BarChart3,
  Sprout,
  IndianRupee,
  Droplets,
  Leaf,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Pencil,
  CloudSun,
  X,
  Check,
} from "lucide-react-native"

const CROP_COLORS = ["#256428", "#7cc142", "#f59e0b", "#14b8a6", "#6366f1"]
const RANGES: InsightsRange[] = ["6M", "1Y", "All"]

export default function InsightsScreen() {
  const { t, lang } = useLang()
  const { profile, scansCount, saveProfile } = useProfile()
  const { open } = useNav()
  const insets = useSafeAreaInsets()
  const isKn = lang === "kn"

  const [range, setRange] = useState<InsightsRange>("6M")
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [localScans, setLocalScans] = useState<ScanHistoryItem[]>(() => getScanHistory())

  // Soil Health Card Editor Modal
  const [soilModalOpen, setSoilModalOpen] = useState(false)
  const [soilN, setSoilN] = useState(String(profile.soilN ?? 64))
  const [soilP, setSoilP] = useState(String(profile.soilP ?? 52))
  const [soilK, setSoilK] = useState(String(profile.soilK ?? 72))
  const [soilPh, setSoilPh] = useState(String(profile.soilPh ?? 6.8))
  const [savingSoil, setSavingSoil] = useState(false)

  useEffect(() => {
    setLocalScans(getScanHistory())
    return subscribeScanHistory(setLocalScans)
  }, [])

  const loadInsights = useCallback(
    async (selectedRange: InsightsRange, isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      try {
        const loc = await getCurrentLocation(6000)
        const lat = loc.ok ? loc.lat : undefined
        const lng = loc.ok ? loc.lng : undefined
        const res = await fetchFarmerInsights({
          mobile: profile.mobile,
          range: selectedRange,
          lat,
          lng,
        })
        if (res) {
          setInsights(res)
          setSoilN(String(res.soilAndClimate.n))
          setSoilP(String(res.soilAndClimate.p))
          setSoilK(String(res.soilAndClimate.k))
          setSoilPh(String(res.soilAndClimate.ph))
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [profile.mobile]
  )

  const cropsKey = profile.crops.join(",")

  useEffect(() => {
    loadInsights(range)
  }, [
    loadInsights,
    range,
    profile.farmSize,
    profile.district,
    profile.irrigationType,
    profile.soilN,
    profile.soilP,
    profile.soilK,
    profile.soilPh,
    cropsKey,
    localScans.length,
  ])

  async function handleSaveSoilCard() {
    const nVal = Math.max(0, Math.min(100, parseInt(soilN, 10) || 0))
    const pVal = Math.max(0, Math.min(100, parseInt(soilP, 10) || 0))
    const kVal = Math.max(0, Math.min(100, parseInt(soilK, 10) || 0))
    const phVal = Math.max(3.5, Math.min(9.5, parseFloat(soilPh) || 6.8))

    setSavingSoil(true)
    const ok = await saveProfile({
      soilN: nVal,
      soilP: pVal,
      soilK: kVal,
      soilPh: Math.round(phVal * 10) / 10,
    })
    setSavingSoil(false)
    setSoilModalOpen(false)
    if (!ok) {
      Alert.alert(
        isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್" : "Soil Health Card",
        isKn
          ? "ಸ್ಥಳೀಯವಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (ಸರ್ವರ್ ಆಫ್‌ಲೈನ್)"
          : "Updated locally (server offline)"
      )
    }
    loadInsights(range, true)
  }

  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const monthsMap = (t.x.coreA.months as Record<string, string>) || {}

  // Derive safe fallback metrics from actual profile + local scans ONLY when backend is unreachable
  const localHealthyCount = localScans.filter((s) => s.status === "healthy").length
  const totalScanCount = insights?.summary.totalScans ?? Math.max(localScans.length, scansCount)
  const healthyScanCount = insights?.summary.healthyScans ?? localHealthyCount
  const healthyPct =
    insights?.summary.healthyRatePct ??
    (totalScanCount > 0 ? Math.round((healthyScanCount / totalScanCount) * 100) : 100)

  const acres = insights?.summary.totalAcres ?? Math.max(0.5, parseFloat(profile.farmSize) || 4.2)
  const yieldKg = insights?.summary.estimatedYieldKg ?? Math.round(acres * 2250 * (range === "1Y" ? 1.85 : range === "All" ? 3 : 1))
  const revenueInr = insights?.summary.estimatedRevenueInr ?? Math.round(yieldKg * 29)
  const irrSavingPct = insights?.summary.irrigationEfficiencyPct ?? (/drip/i.test(profile.irrigationType) ? 24 : 14)

  const cropDelta =
    totalScanCount > 0
      ? isKn
        ? `${healthyScanCount}/${totalScanCount} ಆರೋಗ್ಯ`
        : `${healthyScanCount}/${totalScanCount} healthy`
      : t.insights.stats.ready

  const stats = [
    {
      key: "yield" as const,
      value: `${yieldKg.toLocaleString("en-IN")} ${isKn ? "ಕೆ.ಜಿ" : "kg"}`,
      icon: Sprout,
      tint: "#dcfce7",
      color: "#16a34a",
      delta: isKn
        ? `ಹಂತ ${insights?.summary.avgMaturityPct ?? 35}%`
        : `${insights?.summary.avgMaturityPct ?? 35}% stage`,
    },
    {
      key: "revenue" as const,
      value: `₹${revenueInr.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      tint: "#fef3c7",
      color: "#d97706",
      delta: isKn ? "ನೇರ ಮಂಡಿ ದರ" : "Live Mandi",
    },
    {
      key: "crops" as const,
      value: String(insights?.summary.activeCropsCount ?? profile.crops.length),
      icon: Leaf,
      tint: "#ccfbf1",
      color: "#0d9488",
      delta: cropDelta,
    },
    {
      key: "water" as const,
      value: `${irrSavingPct}%`,
      icon: Droplets,
      tint: "#dbeafe",
      color: "#2563eb",
      delta: /drip/i.test(profile.irrigationType)
        ? isKn
          ? "ಹನಿ ನೀರಾವರಿ"
          : "Drip Irrig."
        : isKn
        ? "ನೀರಿನ ಉಳಿತಾಯ"
        : "Water Saved",
    },
  ]

  const trendBars = insights?.trendBars || []
  const cropBreakdown = insights?.cropBreakdown || []
  const soil = insights?.soilAndClimate
  const weather = insights?.weatherSnapshot

  const soilMetrics = [
    { key: "n" as const, value: soil?.n ?? profile.soilN ?? 64, color: "#16a34a" },
    { key: "p" as const, value: soil?.p ?? profile.soilP ?? 52, color: "#f59e0b" },
    { key: "k" as const, value: soil?.k ?? profile.soilK ?? 72, color: "#0d9488" },
    { key: "moisture" as const, value: soil?.moisturePct ?? 54, color: "#2563eb" },
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadInsights(range, true)}
            colors={["#256428"]}
          />
        }
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
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerTitleRow}>
                <BarChart3 size={24} color="#ffffff" />
                <Text style={styles.headerTitle}>{t.insights.title}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {t.insights.subtitle} · {profile.district} (
                {fmt(t.x.coreA.common.acresValue, { size: profile.farmSize })})
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => loadInsights(range, true)}
              style={styles.refreshBtn}
            >
              {loading || refreshing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <RefreshCw size={16} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>

          {weather ? (
            <View style={styles.weatherStrip}>
              <CloudSun size={15} color="#bbf7d0" />
              <Text style={styles.weatherStripText}>
                {weather.tempC}°C · {isKn ? weather.conditionKn : weather.conditionEn} ·{" "}
                {isKn ? `ತೇವಾಂಶ ${weather.humidity}%` : `${weather.humidity}% RH`} ·{" "}
                {isKn
                  ? `ಮಳೆ ಸಂಭವ ${weather.chanceOfRain}%`
                  : `${weather.chanceOfRain}% rain`}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 4 Live KPI Cards */}
        <FadeSlideIn delay={40}>
          <View style={styles.statsGrid}>
            {stats.map(({ key, value, icon: Icon, tint, color, delta }) => (
              <View key={key} style={styles.statCard}>
                <View style={styles.statCardTop}>
                  <View style={[styles.statIconBox, { backgroundColor: tint }]}>
                    <Icon size={18} color={color} />
                  </View>
                  <Text style={styles.statDelta} numberOfLines={1}>
                    {delta}
                  </Text>
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{t.insights.stats[key]}</Text>
              </View>
            ))}
          </View>
        </FadeSlideIn>

        {/* Crop Health & Scan Activity Trend */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.cardTitle}>
                {isKn ? "ಬೆಳೆ ಆರೋಗ್ಯ ಮತ್ತು ಸ್ಕ್ಯಾನ್ ಪ್ರವೃತ್ತಿ" : "Crop Health & Scan Activity"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {totalScanCount > 0
                  ? isKn
                    ? `${totalScanCount} ಸ್ಕ್ಯಾನ್‌ಗಳಲ್ಲಿ ${healthyPct}% ಆರೋಗ್ಯಕರ`
                    : `${healthyPct}% healthy across ${totalScanCount} recorded scans`
                  : isKn
                  ? "ಹಂತದ ಪ್ರಗತಿ ಆಧಾರಿತ (ನೈಜ ಸಮಯ)"
                  : "Live crop growth index · Scan leaves for history"}
              </Text>
            </View>
            <View style={styles.rangePicker}>
              {RANGES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  style={[styles.rangePill, range === r && styles.rangePillActive]}
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
            {trendBars.length === 0 ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {loading ? (
                  <ActivityIndicator size="small" color="#256428" />
                ) : (
                  <Text style={styles.emptyNote}>
                    {isKn ? "ಪ್ರವೃತ್ತಿ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ" : "Activity trend unavailable offline"}
                  </Text>
                )}
              </View>
            ) : (
              trendBars.map((item, barIdx) => (
                <View key={item.label} style={styles.barCol}>
                  <Text style={styles.barCountText}>
                    {item.scanCount > 0 ? `${item.scanCount}` : "·"}
                  </Text>
                  <View style={styles.barTrack}>
                    <AnimatedBarColumn
                      pct={item.scorePct}
                      delay={barIdx * 55}
                      color={item.issueCount > item.healthyCount ? "#f59e0b" : "#256428"}
                    />
                  </View>
                  <Text style={styles.barLabel}>
                    {monthsMap[item.label] || item.label}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Real Scan Pathology Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.cardTitle}>
              {isKn ? "AI ರೋಗನಿರ್ಣಯ ವಿಶ್ಲೇಷಣೆ" : "Scan Diagnostics Summary"}
            </Text>
            <TouchableOpacity onPress={() => open("scanHistory")}>
              <Text style={styles.actionLink}>
                {isKn ? "ಇತಿಹಾಸ ನೋಡಿ →" : "History →"}
              </Text>
            </TouchableOpacity>
          </View>

          {insights && insights.scanAnalytics.totalScans > 0 ? (
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={styles.scanMetricRow}>
                <View style={[styles.scanBadgeBox, { backgroundColor: "#dcfce7" }]}>
                  <ShieldCheck size={16} color="#15803d" />
                  <Text style={[styles.scanBadgeNum, { color: "#15803d" }]}>
                    {insights.scanAnalytics.healthyScans}
                  </Text>
                  <Text style={styles.scanBadgeLbl}>
                    {isKn ? "ಆರೋಗ್ಯ" : "Healthy"}
                  </Text>
                </View>
                <View style={[styles.scanBadgeBox, { backgroundColor: "#fee2e2" }]}>
                  <AlertTriangle size={16} color="#b91c1c" />
                  <Text style={[styles.scanBadgeNum, { color: "#b91c1c" }]}>
                    {insights.scanAnalytics.issueScans}
                  </Text>
                  <Text style={styles.scanBadgeLbl}>
                    {isKn ? "ಸಮಸ್ಯೆಗಳು" : "Issues"}
                  </Text>
                </View>
                <View style={[styles.scanBadgeBox, { backgroundColor: "#f3f4f6" }]}>
                  <Sparkles size={16} color="#374151" />
                  <Text style={[styles.scanBadgeNum, { color: "#111827" }]}>
                    {insights.scanAnalytics.avgConfidence}%
                  </Text>
                  <Text style={styles.scanBadgeLbl}>
                    {isKn ? "ಸರಾಸರಿ ನಿಖರತೆ" : "Avg Conf."}
                  </Text>
                </View>
              </View>

              {insights.scanAnalytics.topIssues.length > 0 ? (
                <View style={styles.issuesWrap}>
                  {insights.scanAnalytics.topIssues.map((iss) => (
                    <View key={iss.name} style={styles.issuePill}>
                      <Text style={styles.issuePillText}>
                        {iss.name} ({iss.count}) · {iss.latestSeverity}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.emptyNote}>
              {isKn
                ? "ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ. ನಿಮ್ಮ ಜಮೀನಿನ ಆರೋಗ್ಯ ವರದಿ ನೋಡಲು AI ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಬಳಸಿ."
                : "No field scans uploaded yet. Scan a crop leaf to track pest incidence & confidence here."}
            </Text>
          )}
        </View>

        {/* Live Crop Distribution & Market Valuation */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.cardTitle}>{t.insights.cropDist}</Text>
            <TouchableOpacity onPress={() => open("myFarm")}>
              <Text style={styles.actionLink}>
                {isKn ? "ಹೊಲ ಸಂಪಾದಿಸಿ →" : "Edit Plots →"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cropSplitList}>
            {(cropBreakdown.length > 0
              ? cropBreakdown
              : (profile.crops || ["Rice", "Ragi"]).map((crop, i) => ({
                  id: `fb-${i}`,
                  cropName: crop,
                  variety: "High-Yield",
                  acres: Math.round((acres / Math.max(profile.crops.length, 1)) * 10) / 10,
                  sharePct: Math.round(100 / Math.max(profile.crops.length, 1)),
                  season: "Kharif",
                  daysSinceSowing: 35,
                  stageNameEn: "Vegetative",
                  stageNameKn: "ಬೆಳವಣಿಗೆ",
                  healthStatus: "HEALTHY",
                  estYieldKg: 0,
                  modalPriceKg: 0,
                  priceSource: "",
                  marketName: profile.district,
                  estRevenueInr: 0,
                }))
            ).map((crop, idx) => {
              const color = CROP_COLORS[idx % CROP_COLORS.length]
              const displayName = cropMap[crop.cropName] || crop.cropName
              return (
                <View key={crop.id} style={styles.cropRow}>
                  <View style={styles.cropInfo}>
                    <View style={[styles.cropDot, { backgroundColor: color }]} />
                    <Text style={styles.cropName}>
                      {displayName} ({crop.acres} {isKn ? "ಎಕರೆ" : "ac"})
                    </Text>
                    <Text style={styles.cropValue}>{crop.sharePct}%</Text>
                  </View>
                  <View style={styles.cropBarTrack}>
                    <AnimatedProgressFill pct={crop.sharePct} color={color} />
                  </View>
                  {crop.modalPriceKg > 0 ? (
                    <Text style={styles.cropSubMeta}>
                      {isKn ? crop.stageNameKn : crop.stageNameEn} · ₹{crop.modalPriceKg}/kg (
                      {crop.marketName} · {crop.priceSource})
                    </Text>
                  ) : null}
                </View>
              )
            })}
          </View>
        </View>

        {/* Soil Health & Live Climate Moisture */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.insights.soil}</Text>
              <Text style={styles.soilSourceNote}>
                {soil?.source === "soil_health_card"
                  ? isKn
                    ? `ನಿಮ್ಮ ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ · pH ${soil.ph} · ${soil.soilType}`
                    : `Saved Soil Health Card · pH ${soil.ph} · ${soil.soilType}`
                  : isKn
                  ? `${profile.district} ಜಿಲ್ಲಾ ಸರಾಸರಿ (ಸಂಪಾದಿಸಲು ಒತ್ತಿ) · pH ${soil?.ph ?? 6.8}`
                  : `${profile.district} District Baseline · pH ${soil?.ph ?? 6.8}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSoilModalOpen(true)}
              style={styles.editSoilBtn}
            >
              <Pencil size={13} color="#256428" />
              <Text style={styles.editSoilBtnText}>
                {isKn ? "NPK ಬದಲಿಸಿ" : "Edit NPK"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.soilGrid}>
            {soilMetrics.map((s) => (
              <View key={s.key} style={styles.soilCard}>
                <View style={styles.soilTopRow}>
                  <Text style={styles.soilName}>{t.insights.soilRows[s.key]}</Text>
                  <Text style={styles.soilValue}>{s.value}%</Text>
                </View>
                <View style={styles.soilBarTrack}>
                  <AnimatedProgressFill pct={s.value} color={s.color} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Actionable Telemetry Insights */}
        {insights?.recommendations && insights.recommendations.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.cardTitle}>
              {isKn ? "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಶಿಫಾರಸುಗಳು" : "Live Agronomic Recommendations"}
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {insights.recommendations.map((rec) => {
                const bg =
                  rec.tone === "warn"
                    ? "#fffbeb"
                    : rec.tone === "good"
                    ? "#f0fdf4"
                    : "#eff6ff"
                const border =
                  rec.tone === "warn"
                    ? "#f59e0b"
                    : rec.tone === "good"
                    ? "#16a34a"
                    : "#2563eb"
                return (
                  <View
                    key={rec.id}
                    style={[
                      styles.recCard,
                      { backgroundColor: bg, borderLeftColor: border },
                    ]}
                  >
                    <Text style={styles.recTitle}>
                      {isKn ? rec.titleKn : rec.titleEn}
                    </Text>
                    <Text style={styles.recBody}>
                      {isKn ? rec.bodyKn : rec.bodyEn}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Soil Health Card Modal */}
      <Modal
        visible={soilModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSoilModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ (NPK & pH)" : "Update Soil Health Card"}
                </Text>
                <TouchableOpacity onPress={() => setSoilModalOpen(false)}>
                  <X size={20} color="#4b5563" />
                </TouchableOpacity>
              </View>

              <View style={[styles.modalGrid, { marginTop: 14 }]}>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>
                    {isKn ? "ನೈಟ್ರೋಜನ್ N (0-100%)" : "Nitrogen N (0-100%)"}
                  </Text>
                  <TextInput
                    value={soilN}
                    onChangeText={(v) => setSoilN(v.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.modalInput}
                  />
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>
                    {isKn ? "ಫಾಸ್ಫರಸ್ P (0-100%)" : "Phosphorus P (0-100%)"}
                  </Text>
                  <TextInput
                    value={soilP}
                    onChangeText={(v) => setSoilP(v.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.modalInput}
                  />
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>
                    {isKn ? "ಪೊಟ್ಯಾಷಿಯಂ K (0-100%)" : "Potassium K (0-100%)"}
                  </Text>
                  <TextInput
                    value={soilK}
                    onChangeText={(v) => setSoilK(v.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.modalInput}
                  />
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>
                    {isKn ? "ಮಣ್ಣಿನ pH (4.0 - 9.0)" : "Soil pH (4.0 - 9.0)"}
                  </Text>
                  <TextInput
                    value={soilPh}
                    onChangeText={setSoilPh}
                    keyboardType="decimal-pad"
                    maxLength={4}
                    style={styles.modalInput}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveSoilCard}
                disabled={savingSoil}
                style={[styles.modalSaveBtn, { marginTop: 16 }]}
              >
                {savingSoil ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Check size={18} color="#ffffff" />
                )}
                <Text style={styles.modalSaveText}>
                  {isKn ? "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಉಳಿಸಿ" : "Save to Farm Record"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  weatherStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.16)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  weatherStripText: {
    fontSize: 11,
    color: "#ecfdf5",
    fontWeight: "600",
    flex: 1,
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
    gap: 4,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statDelta: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#16a34a",
    flexShrink: 1,
    textAlign: "right",
  },
  statValue: {
    fontSize: 19,
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
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#256428",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
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
    height: 150,
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: 98,
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
  scanMetricRow: {
    flexDirection: "row",
    gap: 10,
  },
  scanBadgeBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  scanBadgeNum: {
    fontSize: 16,
    fontWeight: "bold",
  },
  scanBadgeLbl: {
    fontSize: 10,
    color: "#4b5563",
    fontWeight: "600",
  },
  issuesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  issuePill: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  issuePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#991b1b",
  },
  emptyNote: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    lineHeight: 18,
  },
  cropSplitList: {
    marginTop: 14,
    gap: 14,
  },
  cropRow: {
    gap: 5,
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
  cropSubMeta: {
    fontSize: 11,
    color: "#6b7280",
  },
  soilSourceNote: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  editSoilBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editSoilBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#256428",
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
  recCard: {
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  recBody: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 3,
    lineHeight: 17,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modalField: {
    width: "48%",
    gap: 6,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "600",
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  modalSaveBtn: {
    backgroundColor: "#256428",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
