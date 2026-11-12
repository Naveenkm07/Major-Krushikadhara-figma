import { useEffect, useState, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import DetailShell from "./DetailShell"
import {
  Cloud,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Thermometer,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ChevronDown,
  X,
  Gauge,
  Sunrise,
  Sunset,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from "lucide-react-native"
import { fetchLiveWeather, type LiveWeatherData } from "../api/weather"
import { getCurrentLocation } from "../utils/location"
import { FadeSlideIn, SkeletonBox } from "./Motion"

// Preset fallback verified farming hubs for manual selection
const MANUAL_LOCATION_HUBS = [
  { label: "Mandya (ಮಂಡ್ಯ)", lat: 12.5244, lng: 76.8958, district: "Mandya" },
  { label: "Ramanagara (ರಾಮನಗರ)", lat: 12.721, lng: 77.281, district: "Ramanagara" },
  { label: "Mysuru (ಮೈಸೂರು)", lat: 12.277, lng: 76.669, district: "Mysuru" },
  { label: "Bengaluru (ಬೆಂಗಳೂರು)", lat: 12.9716, lng: 77.5946, district: "Bengaluru" },
  { label: "Kolar (ಕೋಲಾರ)", lat: 13.1367, lng: 78.1292, district: "Kolar" },
  { label: "Tumakuru (ತುಮಕೂರು)", lat: 13.3409, lng: 77.101, district: "Tumakuru" },
  { label: "Hassan (ಹಾಸನ)", lat: 13.0033, lng: 76.1004, district: "Hassan" },
  { label: "Shivamogga (ಶಿವಮೊಗ್ಗ)", lat: 13.9299, lng: 75.5681, district: "Shivamogga" },
  { label: "Davanagere (ದಾವಣಗೆರೆ)", lat: 14.4644, lng: 75.9218, district: "Davanagere" },
  { label: "Hubballi (ಹುಬ್ಬಳ್ಳಿ)", lat: 15.3647, lng: 75.124, district: "Dharwad" },
]

const DISTRICT_HUB_ALIAS: Record<string, string> = {
  mysore: "Mysuru",
  bangalore: "Bengaluru",
  "bengaluru rural": "Bengaluru",
  "bengaluru urban": "Bengaluru",
  tumkur: "Tumakuru",
  shimoga: "Shivamogga",
  hubli: "Dharwad",
}

function resolveProfileHub(district?: string) {
  const raw = (district || "Mandya").trim().toLowerCase()
  const mapped = (DISTRICT_HUB_ALIAS[raw] || raw).toLowerCase()
  return (
    MANUAL_LOCATION_HUBS.find(
      (h) =>
        h.district.toLowerCase() === mapped ||
        h.label.toLowerCase().includes(mapped)
    ) || MANUAL_LOCATION_HUBS[0]
  )
}

function getWeatherIcon(conditionEn: string) {
  const c = (conditionEn || "").toLowerCase()
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower") || c.includes("thunder")) {
    return { icon: CloudRain, color: "#38bdf8" }
  }
  if (c.includes("cloud") || c.includes("overcast")) {
    return { icon: Cloud, color: "#cbd5e1" }
  }
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
    return { icon: Cloud, color: "#e2e8f0" }
  }
  return { icon: Sun, color: "#fef08a" }
}

function getAqiLabel(aqi: number | null, isKn: boolean): string {
  if (!aqi) return isKn ? "ಲಭ್ಯವಿಲ್ಲ" : "N/A"
  if (aqi <= 1) return isKn ? "ಉತ್ತಮ (Good)" : "Good (1)"
  if (aqi <= 2) return isKn ? "ಸಾಧಾರಣ (Mod)" : "Moderate (2)"
  if (aqi <= 3) return isKn ? "ಸೂಕ್ಷ್ಮ (Sens)" : "Fair (3)"
  return isKn ? `ಕಳಪೆ (${aqi})` : `Poor (${aqi})`
}

export default function WeatherScreen() {
  const { lang } = useLang()
  const { profile } = useProfile()
  const isKn = lang === "kn"

  const profileFallbackHub = useMemo(
    () => resolveProfileHub(profile.district),
    [profile.district]
  )

  // GPS Location State (language-independent so toggling EN/KN never resets GPS)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<"detecting" | "success" | "denied" | "manual">("detecting")
  const [gpsErrorReason, setGpsErrorReason] = useState<"denied" | "timeout" | null>(null)
  const [showManualPicker, setShowManualPicker] = useState<boolean>(false)
  const [selectedHubName, setSelectedHubName] = useState<string>("")

  // Live Weather Data State
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null)
  const [forecastDaysView, setForecastDaysView] = useState<3 | 7>(3)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasError, setHasError] = useState(false)

  // 1. Detect dynamic GPS coordinates
  const detectGps = useCallback(async () => {
    setGpsStatus("detecting")
    setGpsErrorReason(null)

    const loc = await getCurrentLocation(9000)
    if (loc.ok) {
      setCoords({ lat: loc.lat, lng: loc.lng })
      setGpsStatus("success")
      setSelectedHubName(`${loc.lat.toFixed(3)}°N, ${loc.lng.toFixed(3)}°E`)
    } else if (loc.reason === "unavailable") {
      setCoords({ lat: profileFallbackHub.lat, lng: profileFallbackHub.lng })
      setGpsStatus("manual")
      setSelectedHubName(profileFallbackHub.label)
    } else {
      setGpsStatus("denied")
      setGpsErrorReason(loc.reason === "denied" ? "denied" : "timeout")
      setCoords({ lat: profileFallbackHub.lat, lng: profileFallbackHub.lng })
      setSelectedHubName(profileFallbackHub.label)
    }
  }, [profileFallbackHub])

  useEffect(() => {
    detectGps()
  }, [detectGps])

  // 2. Fetch live 7-day + hourly weather when coordinates change
  const loadWeather = useCallback(async (isSilentRefresh = false) => {
    if (!coords) return
    if (!isSilentRefresh) setLoading(true)
    setHasError(false)
    try {
      const data = await fetchLiveWeather(coords.lat, coords.lng, 7)
      setWeatherData(data)
    } catch (err: any) {
      console.error("[WeatherScreen] Fetch error:", err)
      setHasError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [coords])

  useEffect(() => {
    if (coords) {
      loadWeather(false)
    }
  }, [coords, loadWeather])

  const handleRefresh = () => {
    setRefreshing(true)
    loadWeather(Boolean(weatherData))
  }

  const selectManualHub = (hub: (typeof MANUAL_LOCATION_HUBS)[0]) => {
    setCoords({ lat: hub.lat, lng: hub.lng })
    setSelectedHubName(hub.label)
    setGpsStatus("manual")
    setGpsErrorReason(null)
    setShowManualPicker(false)
  }

  const currentIcon = weatherData
    ? getWeatherIcon(weatherData.current.conditionTextEn)
    : { icon: Sun, color: "#fef08a" }
  const HeroIcon = currentIcon.icon

  const visibleForecast = weatherData
    ? weatherData.forecast.slice(0, forecastDaysView)
    : []

  return (
    <DetailShell
      title={isKn ? "ಲೈವ್ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ" : "Live Weather Forecast"}
      subtitle={
        isKn
          ? `ಕೃಷಿ ಸಲಹೆ, ಗಂಟೆವಾರು ಮತ್ತು ${forecastDaysView}-ದಿನಗಳ ಮುನ್ಸೂಚನೆ`
          : `Agri Advisory, Hourly & ${forecastDaysView}-Day Forecast`
      }
    >
      <View style={styles.container}>
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
                  : selectedHubName || (isKn ? "ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ..." : "Detecting GPS...")}
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
              {isKn ? "ಜಿಪಿಎಸ್" : "Use GPS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* GPS Error Message (reactive to language switch) */}
        {gpsErrorReason && (
          <View style={styles.gpsErrorBanner}>
            <AlertTriangle size={15} color="#b45309" />
            <Text style={styles.gpsErrorText}>
              {gpsErrorReason === "denied"
                ? isKn
                  ? "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಕೆಳಗಿನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                  : "Location permission denied. Showing nearby farming hub."
                : isKn
                ? "ಜಿಪಿಎಸ್ ಸಿಗ್ನಲ್ ಸಿಗುತ್ತಿಲ್ಲ. ಕೆಳಗಿನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                : "GPS signal timed out. Showing nearby farming hub."}
            </Text>
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
              {MANUAL_LOCATION_HUBS.map((hub) => {
                const isSelected = selectedHubName === hub.label
                return (
                  <TouchableOpacity
                    key={hub.district}
                    style={[styles.hubItem, isSelected && styles.hubItemSelected]}
                    onPress={() => selectManualHub(hub)}
                  >
                    <MapPin size={14} color={isSelected ? "#ffffff" : "#15803d"} />
                    <Text style={[styles.hubItemText, isSelected && styles.hubItemTextSelected]}>
                      {hub.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading && !refreshing ? (
          <View style={{ gap: 12, marginTop: 6 }}>
            <SkeletonBox height={175} borderRadius={22} />
            <SkeletonBox height={86} borderRadius={18} />
            <SkeletonBox height={110} borderRadius={18} />
            <Text style={[styles.loadingText, { textAlign: "center" }]}>
              {isKn ? "ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ..." : "Fetching live satellite weather..."}
            </Text>
          </View>
        ) : hasError && !weatherData ? (
          <View style={styles.errorBox}>
            <AlertTriangle size={32} color="#dc2626" />
            <Text style={styles.errorText}>
              {isKn
                ? "ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
                : "Failed to fetch live weather data. Please try again."}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
              <RefreshCw size={16} color="#ffffff" />
              <Text style={styles.retryBtnText}>{isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Try Again"}</Text>
            </TouchableOpacity>
          </View>
        ) : weatherData ? (
          <>
            {/* Live Weather Hero Card */}
            <FadeSlideIn delay={40}>
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
            </FadeSlideIn>

            {/* Extra Agronomy Telemetry Strip: Sun Cycle, Rain mm, Pressure, AQI */}
            <View style={styles.telemetryStrip}>
              {weatherData.astro ? (
                <>
                  <View style={styles.telemetryChip}>
                    <Sunrise size={13} color="#d97706" />
                    <Text style={styles.telemetryText}>
                      {isKn ? "ಸೂರ್ಯೋದಯ" : "Rise"} {weatherData.astro.sunrise}
                    </Text>
                  </View>
                  <View style={styles.telemetryChip}>
                    <Sunset size={13} color="#ea580c" />
                    <Text style={styles.telemetryText}>
                      {isKn ? "ಸೂರ್ಯಾಸ್ತ" : "Set"} {weatherData.astro.sunset}
                    </Text>
                  </View>
                </>
              ) : null}
              <View style={styles.telemetryChip}>
                <CloudRain size={13} color="#2563eb" />
                <Text style={styles.telemetryText}>
                  {isKn ? "ಮಳೆ:" : "Rain:"} {weatherData.forecast[0]?.totalPrecipMm ?? weatherData.current.precipMm} mm
                </Text>
              </View>
              <View style={styles.telemetryChip}>
                <Gauge size={13} color="#15803d" />
                <Text style={styles.telemetryText}>
                  {weatherData.current.pressureMb} hPa • AQI {getAqiLabel(weatherData.current.airQualityIndex, isKn)}
                </Text>
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

            {/* Next Hours Spray & Rain Window Strip */}
            {Array.isArray(weatherData.hourly) && weatherData.hourly.length > 0 ? (
              <View style={styles.hourlySection}>
                <View style={styles.hourlyHeaderRow}>
                  <Clock size={15} color="#15803d" />
                  <Text style={styles.sectionTitle}>
                    {isKn ? "ಮುಂದಿನ ಗಂಟೆಗಳ ಹವಾಮಾನ (ಸಿಂಪಡಣೆ ಸಮಯ)" : "Upcoming Spray & Rain Windows"}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourlyScroll}
                >
                  {weatherData.hourly.map((hr, idx) => {
                    const hrIcon = getWeatherIcon(hr.conditionTextEn)
                    const HrIconComp = hrIcon.icon
                    const safeHour = hr.chanceOfRain < 40 && hr.windKph < 20
                    return (
                      <View key={idx} style={styles.hourlyCard}>
                        <Text style={styles.hourlyTime}>{hr.label}</Text>
                        <HrIconComp
                          size={20}
                          color={hrIcon.color === "#fef08a" ? "#f59e0b" : "#0284c7"}
                        />
                        <Text style={styles.hourlyTemp}>{hr.tempC}°C</Text>
                        <View style={styles.hourlyMetaRow}>
                          <CloudRain size={10} color="#2563eb" />
                          <Text style={styles.hourlyMetaText}>{hr.chanceOfRain}%</Text>
                        </View>
                        <Text style={styles.hourlyWind}>{hr.windKph} km/h</Text>
                        <View
                          style={[
                            styles.hourlySprayDot,
                            { backgroundColor: safeHour ? "#dcfce7" : "#fee2e2" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.hourlySprayText,
                              { color: safeHour ? "#166534" : "#991b1b" },
                            ]}
                          >
                            {safeHour ? (isKn ? "ಸುರಕ್ಷಿತ" : "OK") : isKn ? "ಬೇಡ" : "Hold"}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* 3-Day / 7-Day Agricultural Forecast Header + Toggle */}
            <View style={styles.forecastHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>
                  {isKn
                    ? `${forecastDaysView}-ದಿನಗಳ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ`
                    : `${forecastDaysView}-Day Agricultural Forecast`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {isKn ? "ದೈನಂದಿನ ಮಳೆ, ಗಾಳಿ ಮತ್ತು ತಾಪಮಾನ" : "Daily Rain, Wind & Temperature"}
                </Text>
              </View>

              {weatherData.forecast.length > 3 ? (
                <View style={styles.rangeSwitch}>
                  <TouchableOpacity
                    onPress={() => setForecastDaysView(3)}
                    style={[
                      styles.rangeBtn,
                      forecastDaysView === 3 && styles.rangeBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rangeBtnText,
                        forecastDaysView === 3 && styles.rangeBtnTextActive,
                      ]}
                    >
                      {isKn ? "3 ದಿನ" : "3D"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setForecastDaysView(7)}
                    style={[
                      styles.rangeBtn,
                      forecastDaysView === 7 && styles.rangeBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rangeBtnText,
                        forecastDaysView === 7 && styles.rangeBtnTextActive,
                      ]}
                    >
                      {isKn ? "7 ದಿನ" : "7D"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            <View style={styles.forecastList}>
              {visibleForecast.map((f, i) => {
                const dayIcon = getWeatherIcon(f.conditionTextEn)
                const DayIconComp = dayIcon.icon
                return (
                  <View key={f.date || i} style={styles.forecastCard}>
                    <View style={styles.forecastDayCol}>
                      <Text style={styles.forecastDayName}>
                        {isKn ? f.dayNameKn : f.dayNameEn}
                      </Text>
                      <Text style={styles.forecastDateText}>{f.date.slice(5)}</Text>
                    </View>

                    <View style={styles.forecastCenterCol}>
                      <View style={styles.forecastConditionRow}>
                        <DayIconComp
                          size={20}
                          color={dayIcon.color === "#fef08a" ? "#f59e0b" : "#0284c7"}
                        />
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
                        {f.totalPrecipMm > 0 ? (
                          <>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Text style={styles.rainChanceText}>{f.totalPrecipMm}mm</Text>
                          </>
                        ) : null}
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

            {/* Honest Dynamic Data Source Footnote */}
            <View style={styles.sourceBox}>
              <CheckCircle2 size={13} color="#15803d" />
              <Text style={styles.sourceText}>
                {isKn
                  ? `ನೈಜ-ಸಮಯದ ಡೇಟಾ • ${weatherData.source}`
                  : `Live Meteorological Data • ${weatherData.source}`}
              </Text>
            </View>
          </>
        ) : null}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
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
  hubItemSelected: {
    backgroundColor: "#15803d",
  },
  hubItemText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  hubItemTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
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
    marginBottom: 12,
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
  telemetryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  telemetryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  advisoryBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 18,
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
  hourlySection: {
    marginBottom: 18,
  },
  hourlyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  hourlyScroll: {
    gap: 10,
    paddingRight: 8,
  },
  hourlyCard: {
    width: 78,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  hourlyTime: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4b5563",
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  hourlyMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  hourlyMetaText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2563eb",
  },
  hourlyWind: {
    fontSize: 10,
    color: "#64748b",
  },
  hourlySprayDot: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hourlySprayText: {
    fontSize: 9,
    fontWeight: "700",
  },
  forecastHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
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
  rangeSwitch: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  rangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  rangeBtnActive: {
    backgroundColor: "#15803d",
  },
  rangeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4b5563",
  },
  rangeBtnTextActive: {
    color: "#ffffff",
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
    width: 68,
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
    flex: 1,
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
    textAlign: "center",
  },
})
