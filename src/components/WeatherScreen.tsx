import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import {
  Cloud,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Thermometer,
  Leaf,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ChevronDown,
  X,
  Gauge,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react-native"
import { fetchLiveWeather, type LiveWeatherData } from "../api/weather"
import { getCurrentLocation } from "../utils/location"

// Preset fallback verified farming hubs for manual selection
const MANUAL_LOCATION_HUBS = [
  { label: "Mandya (ಮಂಡ್ಯ)", lat: 12.5244, lng: 76.8958, district: "Mandya" },
  { label: "Ramanagara (ರಾಮನಗರ)", lat: 12.7210, lng: 77.2810, district: "Ramanagara" },
  { label: "Mysuru (ಮೈಸೂರು)", lat: 12.2770, lng: 76.6690, district: "Mysuru" },
  { label: "Bengaluru (ಬೆಂಗಳೂರು)", lat: 12.9716, lng: 77.5946, district: "Bengaluru" },
  { label: "Kolar (ಕೋಲಾರ)", lat: 13.1367, lng: 78.1292, district: "Kolar" },
  { label: "Tumakuru (ತುಮಕೂರು)", lat: 13.3409, lng: 77.1010, district: "Tumakuru" },
  { label: "Hassan (ಹಾಸನ)", lat: 13.0033, lng: 76.1004, district: "Hassan" },
  { label: "Shivamogga (ಶಿವಮೊಗ್ಗ)", lat: 13.9299, lng: 75.5681, district: "Shivamogga" },
  { label: "Davanagere (ದಾವಣಗೆರೆ)", lat: 14.4644, lng: 75.9218, district: "Davanagere" },
  { label: "Hubballi (ಹುಬ್ಬಳ್ಳಿ)", lat: 15.3647, lng: 75.1240, district: "Dharwad" },
]

function getWeatherIcon(conditionEn: string) {
  const c = (conditionEn || "").toLowerCase()
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) {
    return { icon: CloudRain, color: "#38bdf8" }
  }
  if (c.includes("cloud") || c.includes("overcast")) {
    return { icon: Cloud, color: "#94a3b8" }
  }
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
    return { icon: Cloud, color: "#cbd5e1" }
  }
  return { icon: Sun, color: "#fef08a" }
}

export default function WeatherScreen() {
  const { lang } = useLang()
  const isKn = lang === "kn"

  // GPS Location State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<"detecting" | "success" | "denied" | "manual">("detecting")
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null)
  const [showManualPicker, setShowManualPicker] = useState<boolean>(false)
  const [selectedHubName, setSelectedHubName] = useState<string>("Detecting GPS...")

  // Live Weather Data State
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Detect dynamic GPS coordinates
  const detectGps = useCallback(async () => {
    setGpsStatus("detecting")
    setGpsErrorMsg(null)

    const loc = await getCurrentLocation(9000)
    if (loc.ok) {
      setCoords({ lat: loc.lat, lng: loc.lng })
      setGpsStatus("success")
      setSelectedHubName(`${loc.lat.toFixed(3)}°N, ${loc.lng.toFixed(3)}°E`)
    } else if (loc.reason === "unavailable") {
      const fallback = MANUAL_LOCATION_HUBS[0]
      setCoords({ lat: fallback.lat, lng: fallback.lng })
      setGpsStatus("manual")
      setSelectedHubName(fallback.label)
    } else {
      setGpsStatus("denied")
      setGpsErrorMsg(
        loc.reason === "denied"
          ? isKn
            ? "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಕೆಳಗಿನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
            : "Location permission denied. Please choose a nearby farming hub."
          : isKn
          ? "ಜಿಪಿಎಸ್ ಸಿಗ್ನಲ್ ಸಿಗುತ್ತಿಲ್ಲ. ಕೆಳಗಿನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
          : "GPS signal timed out. Please choose a nearby farming hub."
      )
      const fallback = MANUAL_LOCATION_HUBS[0]
      setCoords({ lat: fallback.lat, lng: fallback.lng })
      setSelectedHubName(fallback.label)
    }
  }, [isKn])

  useEffect(() => {
    detectGps()
  }, [detectGps])

  // 2. Fetch live weather when coordinates change
  const loadWeather = useCallback(async () => {
    if (!coords) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLiveWeather(coords.lat, coords.lng, 3)
      setWeatherData(data)
    } catch (err: any) {
      console.error("[WeatherScreen] Fetch error:", err)
      setError(
        isKn
          ? "ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
          : "Failed to fetch live weather data. Please try again."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [coords, isKn])

  useEffect(() => {
    if (coords) {
      loadWeather()
    }
  }, [coords, loadWeather])

  const handleRefresh = () => {
    setRefreshing(true)
    loadWeather()
  }

  const selectManualHub = (hub: typeof MANUAL_LOCATION_HUBS[0]) => {
    setCoords({ lat: hub.lat, lng: hub.lng })
    setSelectedHubName(hub.label)
    setGpsStatus("manual")
    setShowManualPicker(false)
  }

  const currentIcon = weatherData
    ? getWeatherIcon(weatherData.current.conditionTextEn)
    : { icon: Sun, color: "#fef08a" }
  const HeroIcon = currentIcon.icon

  return (
    <DetailShell
      title={isKn ? "ಲೈವ್ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ" : "Live Weather Forecast"}
      subtitle={isKn ? "ಕೃಷಿ ಸಲಹೆ ಮತ್ತು 3-ದಿನಗಳ ಮುನ್ಸೂಚನೆ" : "Agricultural Advisory & 3-Day Forecast"}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* GPS Location Bar */}
        <View style={styles.locationBar}>
          <TouchableOpacity
            style={styles.locationInfoRow}
            onPress={() => setShowManualPicker(!showManualPicker)}
            activeOpacity={0.7}
          >
            <MapPin size={18} color="#15803d" />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationSubtitle}>
                {gpsStatus === "detecting"
                  ? isKn ? "ಜಿಪಿಎಸ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "Detecting GPS location..."
                  : gpsStatus === "success"
                  ? isKn ? "ನಿಮ್ಮ ಜಿಪಿಎಸ್ ಸ್ಥಳ" : "GPS Live Location"
                  : isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಕೃಷಿ ಪ್ರದೇಶ" : "Selected Agricultural Hub"}
              </Text>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {weatherData?.location
                  ? `${weatherData.location.name}, ${weatherData.location.region}`
                  : selectedHubName}
              </Text>
            </View>
            <ChevronDown size={18} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reGpsBtn}
            onPress={detectGps}
            activeOpacity={0.8}
            disabled={gpsStatus === "detecting"}
          >
            {gpsStatus === "detecting" ? (
              <ActivityIndicator size="small" color="#15803d" />
            ) : (
              <Compass size={16} color="#15803d" />
            )}
            <Text style={styles.reGpsBtnText}>
              {isKn ? "ಜಿಪಿಎಸ್ ಮರುಪಡೆಯಿರಿ" : "Use GPS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* GPS Error Message */}
        {gpsErrorMsg && (
          <View style={styles.gpsErrorBanner}>
            <AlertTriangle size={15} color="#b45309" />
            <Text style={styles.gpsErrorText}>{gpsErrorMsg}</Text>
          </View>
        )}

        {/* Manual Location Hub Selector Dropdown */}
        {showManualPicker && (
          <View style={styles.manualPickerCard}>
            <View style={styles.manualPickerHeader}>
              <Text style={styles.manualPickerTitle}>
                {isKn ? "ಕೃಷಿ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ" : "Select Agricultural Hub"}
              </Text>
              <TouchableOpacity onPress={() => setShowManualPicker(false)}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.hubsList}>
              {MANUAL_LOCATION_HUBS.map((hub, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.hubItem}
                  onPress={() => selectManualHub(hub)}
                >
                  <MapPin size={14} color="#15803d" />
                  <Text style={styles.hubItemText}>{hub.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#15803d" />
            <Text style={styles.loadingText}>
              {isKn ? "ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ..." : "Fetching live satellite weather..."}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <AlertTriangle size={32} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
              <RefreshCw size={16} color="#ffffff" />
              <Text style={styles.retryBtnText}>{isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Try Again"}</Text>
            </TouchableOpacity>
          </View>
        ) : weatherData ? (
          <>
            {/* Live Weather Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeText}>
                    {weatherData.location.name}, {weatherData.location.region}
                  </Text>
                  <View style={styles.tempRow}>
                    <Text style={styles.tempNumber}>{weatherData.current.tempC}</Text>
                    <Text style={styles.tempUnit}>°C</Text>
                  </View>
                  <Text style={styles.conditionText}>
                    {isKn ? weatherData.current.conditionTextKn : weatherData.current.conditionTextEn}
                  </Text>
                  <Text style={styles.feelsLikeText}>
                    {isKn ? "ಅನುಭವವಾಗುವ ತಾಪಮಾನ: " : "Feels like: "}
                    {weatherData.current.feelsLikeC}°C
                  </Text>
                </View>

                <View style={styles.heroRight}>
                  <HeroIcon size={56} color={currentIcon.color} />
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      size={12}
                      color="#ffffff"
                      style={refreshing ? { opacity: 0.5 } : undefined}
                    />
                    <Text style={styles.refreshText}>
                      {refreshing ? (isKn ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "Updating...") : isKn ? "ನವೀಕರಿಸಿ" : "Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Weather Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Droplets size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metricVal}>{weatherData.current.humidity}%</Text>
                  <Text style={styles.metricLabel}>{isKn ? "ತೇವಾಂಶ" : "Humidity"}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Wind size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metricVal}>{weatherData.current.windKph} km/h</Text>
                  <Text style={styles.metricLabel}>
                    {isKn ? `ಗಾಳಿ (${weatherData.current.windDir})` : `Wind (${weatherData.current.windDir})`}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <CloudRain size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metricVal}>{weatherData.current.chanceOfRain}%</Text>
                  <Text style={styles.metricLabel}>{isKn ? "ಮಳೆ ಸಾಧ್ಯತೆ" : "Rain Risk"}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Thermometer size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metricVal}>UV {weatherData.current.uv}</Text>
                  <Text style={styles.metricLabel}>{isKn ? "ಯುವಿ ಸೂಚ್ಯಂಕ" : "UV Index"}</Text>
                </View>
              </View>
            </View>

            {/* Real-time Agricultural Farming Advisory Card */}
            <View
              style={[
                styles.advisoryBanner,
                weatherData.advisory.category === "RAIN_ALERT"
                  ? styles.advisoryRain
                  : weatherData.advisory.category === "WIND_ALERT"
                  ? styles.advisoryWind
                  : weatherData.advisory.category === "HEAT_ALERT"
                  ? styles.advisoryHeat
                  : styles.advisoryFavorable,
              ]}
            >
              <View
                style={[
                  styles.advisoryIconBox,
                  weatherData.advisory.sprayRecommended
                    ? { backgroundColor: "#dcfce7" }
                    : { backgroundColor: "#fee2e2" },
                ]}
              >
                {weatherData.advisory.sprayRecommended ? (
                  <ShieldCheck size={22} color="#16a34a" />
                ) : (
                  <ShieldAlert size={22} color="#dc2626" />
                )}
              </View>
              <View style={styles.advisoryTextBox}>
                <View style={styles.advisoryTitleRow}>
                  <Text style={styles.advisoryTitle}>
                    {isKn ? weatherData.advisory.titleKn : weatherData.advisory.titleEn}
                  </Text>
                </View>
                <Text style={styles.advisoryBody}>
                  {isKn ? weatherData.advisory.bodyKn : weatherData.advisory.bodyEn}
                </Text>
                <View style={styles.sprayBadge}>
                  <Text
                    style={[
                      styles.sprayBadgeText,
                      weatherData.advisory.sprayRecommended
                        ? { color: "#166534" }
                        : { color: "#991b1b" },
                    ]}
                  >
                    {weatherData.advisory.sprayRecommended
                      ? isKn
                        ? "✓ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಸುರಕ್ಷಿತ ಸಮಯ"
                        : "✓ Safe for spraying operations"
                      : isKn
                      ? "✕ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ"
                      : "✕ Spraying not advised today"}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3-Day Agricultural Forecast */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {isKn ? "3-ದಿನಗಳ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ" : "3-Day Agricultural Forecast"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isKn ? "ದೈನಂದಿನ ಮಳೆ ಮತ್ತು ತಾಪಮಾನ" : "Daily Rain & Temperature"}
              </Text>
            </View>

            <View style={styles.forecastList}>
              {weatherData.forecast.map((f, i) => {
                const dayIcon = getWeatherIcon(f.conditionTextEn)
                const DayIconComp = dayIcon.icon
                return (
                  <View key={i} style={styles.forecastCard}>
                    <View style={styles.forecastDayCol}>
                      <Text style={styles.forecastDayName}>
                        {isKn ? f.dayNameKn : f.dayNameEn}
                      </Text>
                      <Text style={styles.forecastDateText}>{f.date.slice(5)}</Text>
                    </View>

                    <View style={styles.forecastCenterCol}>
                      <View style={styles.forecastConditionRow}>
                        <DayIconComp size={20} color={dayIcon.color === "#fef08a" ? "#f59e0b" : dayIcon.color} />
                        <Text style={styles.forecastConditionText} numberOfLines={1}>
                          {isKn ? f.conditionTextKn : f.conditionTextEn}
                        </Text>
                      </View>
                      <View style={styles.forecastMetricsRow}>
                        <CloudRain size={12} color="#2563eb" />
                        <Text style={styles.rainChanceText}>{f.chanceOfRain}%</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Wind size={12} color="#64748b" />
                        <Text style={styles.windSubText}>{f.maxWindKph} km/h</Text>
                      </View>
                    </View>

                    <View style={styles.tempRangeWrap}>
                      <Text style={styles.tempHigh}>{f.maxTempC}°</Text>
                      <Text style={styles.tempLow}>{f.minTempC}°</Text>
                    </View>
                  </View>
                )
              })}
            </View>

            {/* Data Source Footnote */}
            <View style={styles.sourceBox}>
              <CheckCircle2 size={13} color="#15803d" />
              <Text style={styles.sourceText}>
                {isKn
                  ? "ನೈಜ-ಸಮಯದ ಉಪಗ್ರಹ ಡೇಟಾ • WeatherAPI.com • ಕೃಷಿ ವಲಯ"
                  : "Live Satellite & Meteorological Data • WeatherAPI.com"}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  locationBar: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 8,
  },
  locationSubtitle: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  reGpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reGpsBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  gpsErrorBanner: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#d97706",
  },
  gpsErrorText: {
    fontSize: 12,
    color: "#92400e",
    flex: 1,
  },
  manualPickerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  manualPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  manualPickerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  hubsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hubItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  hubItemText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    color: "#b91c1c",
    textAlign: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
  },
  retryBtnText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },
  heroCard: {
    backgroundColor: "#1e3a8a",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  placeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  tempNumber: {
    fontSize: 54,
    fontWeight: "200",
    color: "#ffffff",
    lineHeight: 60,
  },
  tempUnit: {
    fontSize: 22,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 2,
  },
  feelsLikeText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 4,
  },
  heroRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  refreshText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 18,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
  },
  advisoryBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  advisoryFavorable: {
    borderLeftColor: "#16a34a",
  },
  advisoryRain: {
    borderLeftColor: "#2563eb",
  },
  advisoryWind: {
    borderLeftColor: "#d97706",
  },
  advisoryHeat: {
    borderLeftColor: "#ea580c",
  },
  advisoryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  advisoryTextBox: {
    flex: 1,
  },
  advisoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  advisoryBody: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 4,
    lineHeight: 18,
  },
  sprayBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sprayBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  forecastList: {
    gap: 10,
    marginBottom: 20,
  },
  forecastCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  forecastDayCol: {
    width: 65,
  },
  forecastDayName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  forecastDateText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  forecastCenterCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  forecastConditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  forecastConditionText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  forecastMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rainChanceText: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "600",
  },
  dotSeparator: {
    fontSize: 10,
    color: "#cbd5e1",
  },
  windSubText: {
    fontSize: 11,
    color: "#64748b",
  },
  tempRangeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tempHigh: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  tempLow: {
    fontSize: 14,
    color: "#9ca3af",
  },
  sourceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  sourceText: {
    fontSize: 11,
    color: "#15803d",
    fontWeight: "500",
  },
})
