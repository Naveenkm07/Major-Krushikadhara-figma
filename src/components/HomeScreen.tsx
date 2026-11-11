import type { Tab } from "./BottomNav"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native"
import { useState, useEffect } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useNav, type Route } from "../nav"
import { fetchLiveGovtMandiRates } from "../api/mandi"
import { fetchActiveCropStage, type ActiveCropStageResponse } from "../api/cropStage"
import { fetchLiveWeather, type LiveWeatherData } from "../api/weather"
import {
  Languages,
  Bell,
  Sun,
  Droplets,
  RefreshCw,
  Tractor,
  ShieldCheck,
  Landmark,
  Bug,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Mic,
  Settings,
  Cloud,
  MapPin,
  BarChart3,
  Scan,
  Sprout,
} from "lucide-react-native"

const QUICK_ACTIONS = [
  { label: "scanCrop", icon: Scan, bg: "#16a34a", target: "scan" as Tab },
  { label: "govSchemes", icon: Landmark, bg: "#9333ea", target: "schemes" as Tab },
  { label: "farmInsights", icon: BarChart3, bg: "#2563eb", target: "insights" as Tab },
  { label: "market", icon: TrendingUp, bg: "#ea580c", route: "market" as Route },
] as const

const SECONDARY_ACTIONS = [
  { label: "insurance", icon: ShieldCheck, bg: "#ccfbf1", iconColor: "#0d9488", route: "insurance" as Route },
  { label: "weather", icon: Cloud, bg: "#e0f2fe", iconColor: "#0284c7", route: "weather" as Route },
  { label: "equipment", icon: Tractor, bg: "#fef3c7", iconColor: "#d97706", route: "equipment" as Route },
  { label: "voiceAi", icon: Mic, bg: "#fce7f3", iconColor: "#db2777", route: "voiceAssistant" as Route },
] as const

const RECENT_SCANS = [
  { crop: "Wheat", disease: "leafBlight", confidence: 78, status: "disease" as const, day: 25, month: "Sep" },
  { crop: "Rice", disease: "healthy", confidence: 91, status: "healthy" as const, day: 24, month: "Sep" },
  { crop: "Tomato", disease: "earlyBlight", confidence: 85, status: "disease" as const, day: 23, month: "Sep" },
] as const

const marketPrices = [
  { key: "tomato", price: 28, change: 4 },
  { key: "ragi", price: 42, change: 2 },
  { key: "onion", price: 19, change: -1 },
]

export default function HomeScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { t, toggle } = useLang()
  const { profile } = useProfile()
  const { open } = useNav()
  const insets = useSafeAreaInsets()
  const h = t.x.coreA.home
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const cropName = (c: string) => cropMap[c] ?? c

  const [livePrices, setLivePrices] = useState<Array<{ key: string; name: string; price: number; change: number }>>(() => {
    const crops = Array.from(new Set(profile.crops || ["Rice", "Ragi"]))
    return crops.map((c) => ({
      key: c.toLowerCase(),
      name: c,
      price: 32,
      change: 0,
    }))
  })

  const [stageData, setStageData] = useState<ActiveCropStageResponse | null>(null)
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null)

  useEffect(() => {
    // Attempt dynamic GPS or fallback to Mandya coordinates (12.5244, 76.8958)
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchLiveWeather(pos.coords.latitude, pos.coords.longitude, 1)
            .then(setLiveWeather)
            .catch(() => {})
        },
        () => {
          fetchLiveWeather(12.5244, 76.8958, 1)
            .then(setLiveWeather)
            .catch(() => {})
        },
        { timeout: 8000 }
      )
    } else {
      fetchLiveWeather(12.5244, 76.8958, 1)
        .then(setLiveWeather)
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    fetchActiveCropStage(profile.mobile)
      .then((res) => setStageData(res))
      .catch(() => {})
  }, [profile.mobile])

  useEffect(() => {
    fetchLiveGovtMandiRates({
      district: profile.district,
      commodity: profile.crops && profile.crops.length > 0 ? profile.crops[0] : undefined,
      limit: 6,
    })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const seen = new Set<string>()
          const mapped: Array<{ key: string; name: string; price: number; change: number }> = []

          for (const r of res.data) {
            const k = r.commodity.toLowerCase()
            if (!seen.has(k)) {
              seen.add(k)
              mapped.push({
                key: k,
                name: r.commodity,
                price: r.modalPriceKg || 30,
                change: 2,
              })
            }
            if (mapped.length >= 3) break
          }

          if (mapped.length > 0) {
            setLivePrices(mapped)
          }
        }
      })
      .catch(() => {})
  }, [profile.crops, profile.district])

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
          <View style={styles.headerTop}>
            <View style={styles.profileInfo}>
              <Text style={styles.greetingText}>{t.greeting} 🙏</Text>
              <Text style={styles.nameText}>{profile.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locationText}>
                  {profile.district}, {profile.state}
                </Text>
              </View>
            </View>

            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={toggle}
                activeOpacity={0.8}
                style={styles.langPill}
              >
                <Languages size={14} color="#256428" />
                <Text style={styles.langPillText}>{t.langLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => open("notifications")}
                activeOpacity={0.8}
                style={styles.headerIconBtn}
              >
                <Bell size={18} color="#ffffff" />
                <View style={styles.unreadBadge} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => open("settings")}
                activeOpacity={0.8}
                style={styles.headerIconBtn}
              >
                <Settings size={18} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("profile")}
                activeOpacity={0.8}
                style={styles.avatarWrap}
              >
                <Image
                  source={{ uri: profile.photoUrl }}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Live Weather Card */}
          <TouchableOpacity
            onPress={() => open("weather")}
            activeOpacity={0.9}
            style={styles.weatherCard}
          >
            <View style={styles.weatherLeft}>
              <View style={styles.sunIconCircle}>
                <Sun size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.weatherPlace}>
                  {liveWeather?.location
                    ? `${liveWeather.location.name}, ${liveWeather.location.region}`
                    : t.weather.place}
                </Text>
                <Text style={styles.weatherCondition}>
                  {liveWeather
                    ? `${liveWeather.current.conditionTextEn} · ${liveWeather.current.tempC}°C`
                    : `${t.weather.condition} · 29°C`}
                </Text>
              </View>
            </View>

            <View style={styles.weatherRight}>
              <View style={styles.humidityRow}>
                <Droplets size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.humidityText}>
                  {liveWeather
                    ? `${liveWeather.current.humidity}%`
                    : t.weather.humidity}
                </Text>
              </View>
              <Text style={styles.weatherTapHint}>View Forecast →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Core App Feature: Active Crop Present Growth Stage Card */}
        {stageData?.cropField && (
          <View style={styles.stageSection}>
            <TouchableOpacity
              onPress={() => open("voiceAssistant")}
              activeOpacity={0.9}
              style={styles.stageCard}
            >
              <View style={styles.stageCardHeader}>
                <View style={styles.stageTitleLeft}>
                  <View style={styles.stageSproutBox}>
                    <Sprout size={18} color="#15803d" />
                  </View>
                  <View>
                    <Text style={styles.stageCropTitle}>
                      {stageData.cropField.cropName}
                    </Text>
                    <Text style={styles.stageVarietySub}>
                      {stageData.cropField.variety || "Active Field Plot"}
                    </Text>
                  </View>
                </View>

                <View style={styles.stageDayPill}>
                  <Text style={styles.stageDayPillText}>
                    Day {stageData.cropField.daysSinceSowing}
                  </Text>
                </View>
              </View>

              {/* Growth Stage Progress Indicator */}
              <View style={styles.stageProgressWrap}>
                <View style={styles.stageProgressHeader}>
                  <Text style={styles.stageCurrentLabel}>
                    Current Stage:{" "}
                    <Text style={styles.stageCurrentHighlight}>
                      {stageData.cropField.currentStageNameEn}
                    </Text>
                  </Text>
                  <Text style={styles.stageKanName}>
                    {stageData.cropField.currentStageNameKn}
                  </Text>
                </View>

                <View style={styles.stageProgressBarTrack}>
                  <View style={styles.stageProgressBarFill} />
                </View>
              </View>

              {/* Today's Tailored Stage Advisory */}
              {stageData.dailyAdvisories && stageData.dailyAdvisories[0] && (
                <View style={styles.stageAdviceBox}>
                  <Text style={styles.stageAdviceTitle}>
                    💡 Today's Action ({stageData.dailyAdvisories[0].category}):
                  </Text>
                  <Text style={styles.stageAdviceBody}>
                    {stageData.dailyAdvisories[0].bodyEn}
                  </Text>
                </View>
              )}

              {/* Voice Ask Callout */}
              <View style={styles.stageVoiceActionRow}>
                <View style={styles.stageVoiceHint}>
                  <Mic size={14} color="#166534" />
                  <Text style={styles.stageVoiceHintText}>
                    Ask Sarvam AI about this stage
                  </Text>
                </View>
                <Text style={styles.stageVoiceTap}>Speak Now →</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.quickActions.title}</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  if ("target" in item) onNavigate(item.target)
                  else open(item.route)
                }}
                activeOpacity={0.85}
                style={styles.quickCard}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: item.bg }]}>
                  <item.icon size={22} color="#ffffff" />
                </View>
                <Text style={styles.quickLabel} numberOfLines={2}>
                  {String((h as any)[item.label] || item.label)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Secondary Actions (Insurance, Equipment, Weather, Voice AI) */}
        <View style={styles.section}>
          <View style={styles.secondaryRow}>
            {SECONDARY_ACTIONS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => open(item.route)}
                activeOpacity={0.8}
                style={styles.secondaryCard}
              >
                <View style={[styles.secondaryIconCircle, { backgroundColor: item.bg }]}>
                  <item.icon size={20} color={item.iconColor} />
                </View>
                <Text style={styles.secondaryLabel} numberOfLines={1}>
                  {String((h as any)[item.label] || item.label)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Advisory Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.tips.title}</Text>
            <TouchableOpacity onPress={() => open("saved")}>
              <Text style={styles.viewAllText}>{t.tips.viewAll}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tipsList}>
            {t.tips.items.map((tip, idx) => (
              <View key={idx} style={styles.tipCard}>
                <View style={styles.tipStripe} />
                <View style={styles.tipBodyWrap}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipBody}>{tip.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.scan.recent}</Text>
            <TouchableOpacity onPress={() => open("scanHistory")}>
              <Text style={styles.viewAllText}>{t.tips.viewAll}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scansList}>
            {RECENT_SCANS.map((scan, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => open("scanResult", { crop: scan.crop })}
                activeOpacity={0.8}
                style={styles.scanItemCard}
              >
                <View style={styles.scanDateBox}>
                  <Text style={styles.scanDay}>{scan.day}</Text>
                  <Text style={styles.scanMonth}>{scan.month}</Text>
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanCrop}>{scan.crop}</Text>
                  <Text
                    style={[
                      styles.scanDisease,
                      scan.status === "healthy"
                        ? styles.scanHealthy
                        : styles.scanInfected,
                    ]}
                  >
                    {scan.status === "healthy" ? "Healthy Crop" : "Early Blight"}
                  </Text>
                </View>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{scan.confidence}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Mandi Prices */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.market.title}</Text>
            <TouchableOpacity onPress={() => open("market")}>
              <Text style={styles.viewAllText}>{t.tips.viewAll}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.marketRow}>
            {livePrices.map((item, idx) => (
              <TouchableOpacity
                key={`${item.key}_${idx}`}
                onPress={() => open("market")}
                activeOpacity={0.8}
                style={styles.marketCard}
              >
                <Text style={styles.marketCropName}>
                  {t.market.crops[item.key as keyof typeof t.market.crops] || item.name || item.key}
                </Text>
                <Text style={styles.marketPrice}>₹{item.price}{t.market.perKg}</Text>
                <View style={styles.changeRow}>
                  {item.change >= 0 ? (
                    <TrendingUp size={13} color="#16a34a" />
                  ) : (
                    <TrendingDown size={13} color="#dc2626" />
                  )}
                  <Text
                    style={[
                      styles.changeText,
                      { color: item.change >= 0 ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
                  </Text>
                </View>
              </TouchableOpacity>
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
    paddingBottom: 24,
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profileInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#256428",
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  unreadBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f97316",
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  weatherCard: {
    marginTop: 18,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sunIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  weatherPlace: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  weatherCondition: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  weatherRight: {
    alignItems: "flex-end",
  },
  humidityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  humidityText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
  },
  weatherTapHint: {
    fontSize: 11,
    color: "#f6efd8",
    fontWeight: "600",
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#256428",
  },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  secondaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
    textAlign: "center",
  },
  tipsList: {
    gap: 10,
  },
  tipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tipStripe: {
    width: 5,
    backgroundColor: "#16a34a",
  },
  tipBodyWrap: {
    padding: 14,
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
  scansList: {
    gap: 10,
  },
  scanItemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  scanDateBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  scanDay: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  scanMonth: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  scanInfo: {
    flex: 1,
  },
  scanCrop: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  scanDisease: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  scanHealthy: {
    color: "#16a34a",
  },
  scanInfected: {
    color: "#ea580c",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#15803d",
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  marketCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  marketCropName: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "500",
  },
  marketPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stageSection: {
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
  },
  stageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  stageCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stageTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stageSproutBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  stageCropTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  stageVarietySub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  stageDayPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stageDayPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  stageProgressWrap: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  stageProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  stageCurrentLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  stageCurrentHighlight: {
    color: "#166534",
    fontWeight: "700",
  },
  stageKanName: {
    fontSize: 11,
    color: "#15803d",
    fontWeight: "600",
  },
  stageProgressBarTrack: {
    height: 6,
    backgroundColor: "#dcfce7",
    borderRadius: 3,
    overflow: "hidden",
  },
  stageProgressBarFill: {
    width: "45%",
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: 3,
  },
  stageAdviceBox: {
    backgroundColor: "#fefce8",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#eab308",
  },
  stageAdviceTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#854d0e",
    marginBottom: 2,
  },
  stageAdviceBody: {
    fontSize: 12,
    color: "#713f12",
    lineHeight: 16,
  },
  stageVoiceActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  stageVoiceHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stageVoiceHintText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  stageVoiceTap: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
})
