import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import DetailShell from "./DetailShell"
import {
  MapPin,
  Clock,
  RotateCw,
  Landmark,
  Navigation,
  ShieldCheck,
  AlertCircle,
  Search,
  X,
  Compass,
  Sliders,
  ChevronDown,
  CheckCircle2,
  Sparkles,
} from "lucide-react-native"
import {
  fetchNearbyMandis,
  type NearbyMandiItem,
} from "../api/mandi"
import { getCurrentLocation } from "../utils/location"
import { FadeSlideIn, SkeletonBox } from "./Motion"

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

const MARKET_CROP_KN: Record<string, string> = {
  Tomato: "ಟೊಮ್ಯಾಟೊ",
  Rice: "ಭತ್ತ / ಅಕ್ಕಿ",
  "Rice (Paddy)": "ಭತ್ತ",
  Paddy: "ಭತ್ತ",
  "Paddy(Common)": "ಭತ್ತ (ಸಾಮಾನ್ಯ)",
  Ragi: "ರಾಗಿ",
  "Ragi(Finger Millet)": "ರಾಗಿ",
  Onion: "ಈರುಳ್ಳಿ",
  Potato: "ಆಲೂಗಡ್ಡೆ",
  "Green Chilli": "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
  Chilli: "ಮೆಣಸಿನಕಾಯಿ",
  Capsicum: "ದೊಡ್ಡ ಮೆಣಸಿನಕಾಯಿ",
  Cauliflower: "ಹೂಕೋಸು",
  Beans: "ಹುರುಳಿಕಾಯಿ",
  Cabbage: "ಎಲೆಕೋಸು",
  Brinjal: "ಬದನೆಕಾಯಿ",
  Radish: "ಮೂಲಂಗಿ",
  Maize: "ಮೆಕ್ಕೆಜೋಳ",
  Wheat: "ಗೋಧಿ",
  Cotton: "ಹತ್ತಿ",
  Sugarcane: "ಕಬ್ಬು",
  Banana: "ಬಾಳೆಹಣ್ಣು",
  Coconut: "ತೆಂಗಿನಕಾಯಿ",
  Arecanut: "ಅಡಿಕೆ",
  Groundnut: "ಶೇಂಗಾ",
  Jowar: "ಜೋಳ",
  Bajra: "ಸಜ್ಜೆ",
  Soybean: "ಸೋಯಾಬೀನ್",
  Ginger: "ಶುಂಠಿ",
  Garlic: "ಬೆಳ್ಳುಳ್ಳಿ",
}

export default function MarketPricesScreen() {
  const { lang, t } = useLang()
  const { profile } = useProfile()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const cropLabel = (name: string) => {
    if (!isKn) return name
    return MARKET_CROP_KN[name] || cropMap[name] || name
  }

  // GPS Location State
  const [farmerCoords, setFarmerCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<"detecting" | "success" | "denied" | "manual">("detecting")
  const [gpsErrorReason, setGpsErrorReason] = useState<"denied" | "timeout" | null>(null)
  const [showManualPicker, setShowManualPicker] = useState<boolean>(false)
  const [selectedHubName, setSelectedHubName] = useState<string>("Detecting GPS...")

  // Radius Configuration (Default 50 km as required)
  const [radiusKm, setRadiusKm] = useState<number>(50)

  // Crop Filter State
  const userRegisteredCrops = profile.crops && profile.crops.length > 0 ? profile.crops : ["Tomato", "Rice", "Ragi"]
  const [availableCrops, setAvailableCrops] = useState<string[]>([
    "Tomato",
    "Rice",
    "Ragi",
    "Onion",
    "Green Chilli",
    "Cauliflower",
    "Beans",
    "Cabbage",
    ...userRegisteredCrops.filter((c) => !["Tomato", "Rice", "Ragi"].includes(c)),
  ])
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Data Loading State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mandis, setMandis] = useState<NearbyMandiItem[]>([])
  const [nearestActiveMarket, setNearestActiveMarket] = useState<NearbyMandiItem | null>(null)
  const [activeCommoditiesToday, setActiveCommoditiesToday] = useState<string[]>([])
  const [rateLimitError, setRateLimitError] = useState<boolean>(false)

  // 1. Detect farmer's current GPS location dynamically
  const requestGpsLocation = useCallback(async () => {
    setGpsStatus("detecting")
    setGpsErrorReason(null)

    const distKey = (profile.district || "Mandya").trim().toLowerCase()
    const fallbackHub =
      MANUAL_LOCATION_HUBS.find(
        (h) =>
          h.district.toLowerCase() === distKey ||
          h.label.toLowerCase().includes(distKey)
      ) || MANUAL_LOCATION_HUBS[0]

    const loc = await getCurrentLocation(9000)
    if (loc.ok) {
      setFarmerCoords({ lat: loc.lat, lng: loc.lng })
      setGpsStatus("success")
      setSelectedHubName(`${loc.lat.toFixed(3)}°N, ${loc.lng.toFixed(3)}°E`)
    } else if (loc.reason === "unavailable") {
      setFarmerCoords({ lat: fallbackHub.lat, lng: fallbackHub.lng })
      setGpsStatus("manual")
      setSelectedHubName(fallbackHub.label)
    } else {
      setGpsStatus("denied")
      setGpsErrorReason(loc.reason === "denied" ? "denied" : "timeout")
      setFarmerCoords({ lat: fallbackHub.lat, lng: fallbackHub.lng })
      setSelectedHubName(fallbackHub.label)
    }
  }, [profile.district])

  useEffect(() => {
    requestGpsLocation()
  }, [requestGpsLocation])

  // 2. Fetch nearest verified mandis & live government rates
  const loadNearbyMandisData = useCallback(async () => {
    if (!farmerCoords) return

    setLoading(true)
    setRateLimitError(false)

    try {
      const res = await fetchNearbyMandis({
        lat: farmerCoords.lat,
        lng: farmerCoords.lng,
        crop: selectedCrop,
        radiusKm,
        limit: 5,
      })

      if (res.rateLimited) {
        setRateLimitError(true)
      }

      setMandis(res.results || [])
      setNearestActiveMarket(res.nearestActiveMarket || null)

      if (res.activeCommoditiesToday && res.activeCommoditiesToday.length > 0) {
        setActiveCommoditiesToday(res.activeCommoditiesToday)
        setAvailableCrops((prev) => {
          const set = new Set([...res.activeCommoditiesToday!, ...prev])
          return Array.from(set)
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [farmerCoords, selectedCrop, radiusKm])

  useEffect(() => {
    if (farmerCoords) {
      loadNearbyMandisData()
    }
  }, [farmerCoords, loadNearbyMandisData])

  const handleSelectCrop = (crop: string) => {
    setSelectedCrop(crop)
    setSearchQuery("")
  }

  const handleSearchSubmit = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    if (!availableCrops.includes(trimmed)) {
      setAvailableCrops((prev) => [trimmed, ...prev])
    }
    setSelectedCrop(trimmed)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSelectedCrop("Tomato")
  }

  const handleManualHubSelect = (hub: (typeof MANUAL_LOCATION_HUBS)[0]) => {
    setFarmerCoords({ lat: hub.lat, lng: hub.lng })
    setSelectedHubName(hub.label)
    setGpsStatus("manual")
    setShowManualPicker(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNearbyMandisData()
  }

  const nearestMandi = mandis[0]

  return (
    <DetailShell
      title={isKn ? "ಹತ್ತಿರದ ಎಪಿಎಂಸಿ & ಬೆಳೆ ದರಗಳು" : "Nearby Mandis & Crop Prices"}
      subtitle={
        isKn
          ? "ಜಿಪಿಎಸ್ ಆಧರಿತ 50 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮಾರುಕಟ್ಟೆಗಳು"
          : "GPS-Discovered Agricultural Markets within Radius"
      }
    >
      {/* 1. Official Government AGMARKNET Source Badge */}
      <View style={styles.govtSourceCard}>
        <View style={styles.govtBadgeLeft}>
          <View style={styles.govtIconCircle}>
            <Landmark size={18} color="#15803d" />
          </View>
          <View style={styles.govtTextWrap}>
            <View style={styles.officialTagRow}>
              <Text style={styles.govtTitleText}>
                {isKn ? "ಭಾರತ ಸರ್ಕಾರ · AGMARKNET" : "Govt of India · AGMARKNET"}
              </Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={11} color="#166534" />
                <Text style={styles.verifiedText}>
                  {isKn ? "ಪರಿಶೀಲಿತ" : "Verified"}
                </Text>
              </View>
            </View>
            <Text style={styles.govtSubText}>
              {isKn ? "ಅಧಿಕೃತ ಸಗಟು ಮಾರುಕಟ್ಟೆ ನೇರ ದರಗಳು" : "Official wholesale ruling prices from data.gov.in"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          activeOpacity={0.7}
          style={styles.refreshBtn}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#15803d" />
          ) : (
            <RotateCw size={16} color="#15803d" />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. Farmer GPS Location Status & Selector Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeaderRow}>
          <View style={styles.locationLeftRow}>
            <Compass size={18} color="#15803d" />
            <Text style={styles.locationCardTitle}>
              {isKn ? "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳ (GPS):" : "Your Current Location (GPS):"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={requestGpsLocation}
            style={styles.gpsRetryBtn}
            activeOpacity={0.7}
          >
            <RotateCw size={12} color="#166534" />
            <Text style={styles.gpsRetryBtnText}>
              {isKn ? "ಜಿಪಿಎಸ್ ರಿಫ್ರೆಶ್" : "Refresh GPS"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationInfoRow}>
          <View style={styles.coordsBadge}>
            <MapPin size={13} color="#15803d" />
            <Text style={styles.coordsText}>
              {gpsStatus === "detecting"
                ? isKn
                  ? "ಜಿಪಿಎಸ್ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ..."
                  : "Detecting GPS coordinates..."
                : selectedHubName}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowManualPicker(!showManualPicker)}
            style={styles.changeLocBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.changeLocBtnText}>
              {isKn ? "ಸ್ಥಳ ಬದಲಾಯಿಸಿ" : "Change Location"}
            </Text>
            <ChevronDown size={13} color="#15803d" />
          </TouchableOpacity>
        </View>

        {gpsErrorReason && (
          <View style={styles.gpsNoticeBox}>
            <AlertCircle size={13} color="#b45309" />
            <Text style={styles.gpsNoticeText}>
              {gpsErrorReason === "denied"
                ? isKn
                  ? "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳನ್ನು ನೋಡಲು ಕೆಳಗಿನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                  : "Location permission denied. Please select your nearest farming hub below."
                : isKn
                ? "ಜಿಪಿಎಸ್ ಸಿಗ್ನಲ್ ಸಿಗುತ್ತಿಲ್ಲ. ಕೆಳಗಿನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                : "GPS signal timed out. Please choose a nearby hub below."}
            </Text>
          </View>
        )}

        {/* Manual Hub Selection Dropdown */}
        {showManualPicker && (
          <View style={styles.manualPickerCard}>
            <Text style={styles.manualPickerHeading}>
              {isKn ? "ಹತ್ತಿರದ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ:" : "Select your farming hub:"}
            </Text>
            <View style={styles.hubGrid}>
              {MANUAL_LOCATION_HUBS.map((hub) => (
                <TouchableOpacity
                  key={hub.label}
                  onPress={() => handleManualHubSelect(hub)}
                  style={[
                    styles.hubPill,
                    selectedHubName === hub.label && styles.hubPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.hubPillText,
                      selectedHubName === hub.label && styles.hubPillTextSelected,
                    ]}
                  >
                    {hub.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 3. Search Radius Selector (Default 50 km) */}
      <View style={styles.radiusCard}>
        <View style={styles.radiusHeaderRow}>
          <View style={styles.radiusTitleWrap}>
            <Sliders size={16} color="#15803d" />
            <Text style={styles.radiusTitle}>
              {isKn ? "ಹುಡುಕಾಟದ ವ್ಯಾಪ್ತಿ (Radius):" : "Search Radius:"}
            </Text>
          </View>
          <Text style={styles.radiusActiveText}>
            {radiusKm} km {isKn ? "ವ್ಯಾಪ್ತಿ" : "Radius"}
          </Text>
        </View>

        <View style={styles.radiusPillsRow}>
          {[30, 50, 100, 150].map((r) => {
            const isSelected = radiusKm === r
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRadiusKm(r)}
                style={[
                  styles.radiusPill,
                  isSelected && styles.radiusPillSelected,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.radiusPillText,
                    isSelected && styles.radiusPillTextSelected,
                  ]}
                >
                  {r} km {r === 50 ? (isKn ? "(ಡೀಫಾಲ್ಟ್)" : "(Default)") : ""}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* 4. Crop Selection & Search Bar */}
      <View style={styles.searchCard}>
        <Search size={18} color="#15803d" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder={
            isKn
              ? "ಯಾವುದೇ ಬೆಳೆ ಹುಡುಕಿ (ಉದಾ: ಟೊಮ್ಯಾಟೊ, ಭತ್ತ, ಈರುಳ್ಳಿ...)"
              : "Search crop (e.g. Tomato, Rice, Ragi, Onion)..."
          }
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
            <X size={15} color="#6b7280" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSearchSubmit}
          activeOpacity={0.8}
          style={styles.searchActionBtn}
        >
          <Text style={styles.searchActionBtnText}>
            {isKn ? "ಹುಡುಕಿ" : "Search"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Crop Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {availableCrops.map((crop) => {
            const isSelected = selectedCrop === crop
            const isLiveToday = activeCommoditiesToday.includes(crop)

            return (
              <TouchableOpacity
                key={crop}
                onPress={() => handleSelectCrop(crop)}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                  isLiveToday && !isSelected && styles.liveTodayChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                    isLiveToday && !isSelected && styles.liveTodayChipText,
                  ]}
                >
                  {cropLabel(crop)}
                </Text>
                {isLiveToday && (
                  <View style={[styles.liveDot, isSelected && styles.liveDotSelected]} />
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* 5. Nearest Active Market with Live Wholesale Rate Today */}
      {nearestActiveMarket && nearestActiveMarket.hasPrice ? (
        <View style={styles.activeRateCard}>
          <View style={styles.nearestHeader}>
            <View style={styles.activeTagBadge}>
              <Sparkles size={13} color="#166534" />
              <Text style={styles.activeTagBadgeText}>
                {isKn ? "ಇಂದಿನ ಲೈವ್ ವಹಿವಾಟು ದರ" : "Active Live Trade Today"}
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <Navigation size={11} color="#166534" />
              <Text style={styles.distanceBadgeText}>
                {nearestActiveMarket.distanceKm} km
              </Text>
            </View>
          </View>
          <View style={styles.activeRateBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nearestMarketName}>{nearestActiveMarket.mandi}</Text>
              <Text style={styles.nearestSub}>
                {nearestActiveMarket.district}, {nearestActiveMarket.state} • {isKn ? "ಆಗಮನ" : "Arrival"}: {nearestActiveMarket.arrivalDate}
              </Text>
            </View>
            <View style={styles.priceWrap}>
              <Text style={styles.activePriceKg}>
                ₹{nearestActiveMarket.modalPriceKg}/{isKn ? "ಕೆಜಿ" : "kg"}
              </Text>
              <Text style={styles.activeQuintalPrice}>
                ₹{nearestActiveMarket.modalPrice?.toLocaleString("en-IN")}/
                {isKn ? "ಕ್ವಿಂಟಲ್" : "Quintal"}
              </Text>
            </View>
          </View>
        </View>
      ) : nearestMandi ? (
        <View style={styles.nearestCard}>
          <View style={styles.nearestHeader}>
            <View style={styles.nearestPinWrap}>
              <MapPin size={16} color="#166534" />
              <Text style={styles.nearestTitle}>
                {isKn ? "ಅತ್ಯಂತ ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆ" : "Nearest Mandi"}
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <Navigation size={11} color="#166534" />
              <Text style={styles.distanceBadgeText}>
                {nearestMandi.distanceKm} km
              </Text>
            </View>
          </View>
          <Text style={styles.nearestMarketName}>{nearestMandi.mandi}</Text>
          <Text style={styles.nearestSub}>
            {nearestMandi.district}, {nearestMandi.state} •{" "}
            {nearestMandi.hasPrice
              ? `${isKn ? "ಇಂದಿನ ಬೆಲೆ" : "Today's Rate"}: ₹${nearestMandi.modalPrice}/${
                  isKn ? "ಕ್ವಿಂಟಲ್" : "Quintal"
                }`
              : isKn
              ? "ಇಂದು ಈ ಮಾರುಕಟ್ಟೆಯಿಂದ ದರ ಪಟ್ಟಿ ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ"
              : "Today's arrival sheet not yet uploaded to AGMARKNET"}
          </Text>
        </View>
      ) : null}

      {/* Notice when selected crop has no arrivals in immediate mandis */}
      {!loading && mandis.length > 0 && mandis.every((m) => !m.hasPrice) && (
        <View style={styles.noTradeNoticeBox}>
          <AlertCircle size={15} color="#92400e" />
          <View style={{ flex: 1 }}>
            <Text style={styles.noTradeNoticeTitle}>
              {isKn
                ? `"${cropLabel(selectedCrop)}" ಬೆಳೆಗೆ ಹತ್ತಿರದ ಮಂಡಿಗಳಲ್ಲಿ ಇಂದಿನ ಆವಕ ದಾಖಲಾಗಿಲ್ಲ`
                : `No arrivals logged for "${selectedCrop}" in nearby mandis today yet.`}
            </Text>
            <Text style={styles.noTradeNoticeDesc}>
              {isKn
                ? "ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಆವಕ ದಾಖಲಾದ ತಕ್ಷಣ ಇಲ್ಲಿ ಲೈವ್ ದರಗಳು ಬರುತ್ತವೆ. ಇಂದಿನ ಲೈವ್ ದರಗಳಿಗಾಗಿ ಮೇಲಿನ ಟೊಮ್ಯಾಟೊ, ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ, ಎಲೆಕೋಸು ಅಥವಾ ಹುರುಳಿಕಾಯಿ ಆಯ್ಕೆಮಾಡಿ."
                : "Market secretaries upload daily sheets as trades conclude. Select Tomato, Green Chilli, Cabbage, or Beans above to view live wholesale rates trading today."}
            </Text>
          </View>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeaderRow}>
        <Text style={styles.resultsHeaderTitle}>
          {isKn
            ? `ಹತ್ತಿರದ 5 ಮಾರುಕಟ್ಟೆಗಳು (${cropLabel(selectedCrop)})`
            : `Nearest 5 Mandis for ${selectedCrop}`}
        </Text>
        <Text style={styles.resultsCount}>
          {mandis.length} {isKn ? "ಮಾರುಕಟ್ಟೆಗಳು" : "Mandis Found"}
        </Text>
      </View>

      {/* 6. UI States (Loading / Rate Limit / Empty / Success Results) */}
      {loading ? (
        <View style={{ gap: 12, marginTop: 4 }}>
          <SkeletonBox height={106} borderRadius={18} />
          <SkeletonBox height={116} borderRadius={18} />
          <SkeletonBox height={116} borderRadius={18} />
          <Text style={[styles.loadingText, { textAlign: "center" }]}>
            {isKn
              ? `${radiusKm} ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯ ಎಪಿಎಂಸಿ ದರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...`
              : `Discovering verified mandis within ${radiusKm}km and fetching live AGMARKNET rates...`}
          </Text>
        </View>
      ) : rateLimitError ? (
        <View style={[styles.emptyBox, { borderColor: "#fca5a5", backgroundColor: "#fff1f2" }]}>
          <AlertCircle size={36} color="#dc2626" />
          <Text style={[styles.emptyTitle, { color: "#991b1b" }]}>
            {isKn ? "ಸರ್ಕಾರಿ API ಮಿತಿ ತಲುಪಿತು" : "Govt API Rate Limit Reached"}
          </Text>
          <Text style={[styles.emptyDesc, { color: "#b91c1c" }]}>
            {isKn
              ? "ಸರ್ಕಾರಿ API ಮಿತಿ ತಲುಪಿತು. 1 ನಿಮಿಷ ಕಾದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
              : "Government API rate limit reached. Please wait a minute and tap retry."}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            activeOpacity={0.8}
            style={[styles.retryBtn, { backgroundColor: "#dc2626" }]}
          >
            <Text style={styles.retryBtnText}>
              {isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Retry Now"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : mandis.length === 0 ? (
        <View style={styles.emptyBox}>
          <AlertCircle size={36} color="#d97706" />
          <Text style={styles.emptyTitle}>
            {isKn
              ? `${radiusKm} ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಯಾವುದೇ ಮಾರುಕಟ್ಟೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ`
              : `No Verified Mandis Found within ${radiusKm} km`}
          </Text>
          <Text style={styles.emptyDesc}>
            {isKn
              ? "ನಿಮ್ಮ ಸ್ಥಳದ 50 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಯಾವುದೇ ಅಧಿಕೃತ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಹುಡುಕಾಟದ ವ್ಯಾಪ್ತಿಯನ್ನು 100 ಕಿ.ಮೀ ಗೆ ವಿಸ್ತರಿಸಿ."
              : `No official APMC market yards were found within ${radiusKm}km of your GPS location. Tap below to expand the radius to 100km.`}
          </Text>
          <TouchableOpacity
            onPress={() => setRadiusKm(100)}
            activeOpacity={0.8}
            style={styles.expandRadiusBtn}
          >
            <Text style={styles.expandRadiusBtnText}>
              {isKn ? "ವ್ಯಾಪ್ತಿಯನ್ನು 100 ಕಿ.ಮೀ ಗೆ ವಿಸ್ತರಿಸಿ" : "Expand Radius to 100 km"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.recordsList}>
          {mandis.map((m, idx) => (
            <View key={`${m.id}_${idx}`} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.marketInfo}>
                  <View style={styles.marketNameRow}>
                    <Text style={styles.marketName}>{m.mandi}</Text>
                    {m.isVerified && (
                      <View style={styles.verifiedTag}>
                        <CheckCircle2 size={11} color="#15803d" />
                        <Text style={styles.verifiedTagText}>
                          {isKn ? "ಅಧಿಕೃತ APMC" : "Verified APMC"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.districtName}>
                    {m.district}, {m.state}
                  </Text>
                </View>
                <View style={styles.distancePill}>
                  <Navigation size={11} color="#166534" />
                  <Text style={styles.distancePillText}>{m.distanceKm} km</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.commodityRow}>
                <View>
                  <Text style={styles.commodityName}>{cropLabel(selectedCrop)}</Text>
                  <Text style={styles.varietyGrade}>
                    {m.variety || (isKn ? "ಸಾಮಾನ್ಯ ತಳಿ" : "Standard Variety")} •{" "}
                    {m.grade || (isKn ? "FAQ ದರ್ಜೆ" : "FAQ Grade")}
                  </Text>
                </View>

                {m.hasPrice ? (
                  <View style={styles.priceWrap}>
                    <Text style={styles.modalPriceKg}>₹{m.modalPriceKg}/{isKn ? "ಕೆಜಿ" : "kg"}</Text>
                    <Text style={styles.quintalPrice}>
                      ₹{m.modalPrice?.toLocaleString("en-IN")}/{isKn ? "ಕ್ವಿಂಟಲ್" : "Quintal"}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noPriceWrap}>
                    <Text style={styles.noPriceBadgeText}>
                      {isKn ? "ಇಂದು ದರ ಲಭ್ಯವಿಲ್ಲ" : "No trade today"}
                    </Text>
                  </View>
                )}
              </View>

              {m.hasPrice && (
                <View style={styles.rangeRow}>
                  <Text style={styles.rangeText}>
                    {isKn ? "ಕನಿಷ್ಠ" : "Min"}: ₹{m.minPriceKg}/{isKn ? "ಕೆಜಿ" : "kg"} (₹{m.minPrice}/Q)
                  </Text>
                  <Text style={styles.rangeText}>
                    {isKn ? "ಗರಿಷ್ಠ" : "Max"}: ₹{m.maxPriceKg}/{isKn ? "ಕೆಜಿ" : "kg"} (₹{m.maxPrice}/Q)
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <View style={styles.arrivalTag}>
                  <Clock size={11} color="#6b7280" />
                  <Text style={styles.arrivalDateText}>
                    {m.arrivalDate
                      ? `${isKn ? "ದಿನಾಂಕ" : "Arrival"}: ${m.arrivalDate}`
                      : isKn
                      ? "ಇಂದು ಯಾವುದೇ ಆಗಮನವಿಲ್ಲ"
                      : "No arrival logged today"}
                  </Text>
                </View>
                <Text style={styles.sourceTag}>
                  {m.hasPrice
                    ? isKn
                      ? "data.gov.in · ಲೈವ್"
                      : "data.gov.in · Live"
                    : isKn
                    ? "ಅಧಿಕೃತ APMC"
                    : "Verified APMC"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  govtSourceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  govtBadgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  govtIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  govtTextWrap: {
    flex: 1,
  },
  officialTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  govtTitleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  govtSubText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  // Location Card
  locationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  locationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  gpsRetryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gpsRetryBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  locationInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coordsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  changeLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
  },
  changeLocBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  gpsNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fffbeb",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  gpsNoticeText: {
    fontSize: 11,
    color: "#92400e",
    flex: 1,
  },
  manualPickerCard: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  manualPickerHeading: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
  },
  hubGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  hubPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  hubPillSelected: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  hubPillText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "500",
  },
  hubPillTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Radius Card
  radiusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  radiusHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  radiusTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radiusTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  radiusActiveText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  radiusPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  radiusPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  radiusPillSelected: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  radiusPillTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Search Card
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    paddingVertical: 6,
  },
  clearBtn: {
    padding: 4,
  },
  searchActionBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Filter Chips
  filterSection: {
    marginBottom: 12,
  },
  chipsScroll: {
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipSelected: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  liveTodayChip: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  liveTodayChipText: {
    color: "#15803d",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
    marginLeft: 4,
  },
  liveDotSelected: {
    backgroundColor: "#ffffff",
  },

  // Active Rate Card (Prominent display for Mandis with live ruling rate)
  activeRateCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#86efac",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  activeTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  activeRateBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  activePriceKg: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#166534",
  },
  activeQuintalPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803d",
  },
  noTradeNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 12,
  },
  noTradeNoticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 2,
  },
  noTradeNoticeDesc: {
    fontSize: 11,
    color: "#b45309",
    lineHeight: 16,
  },

  // Nearest Card
  nearestCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  nearestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nearestPinWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  nearestTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ffffff",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  nearestMarketName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  nearestSub: {
    fontSize: 12,
    color: "#15803d",
    marginTop: 3,
  },

  // Results Header
  resultsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resultsHeaderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  resultsCount: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Loading & Empty States
  loadingBox: {
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptyBox: {
    backgroundColor: "#fffbeb",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fde68a",
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#92400e",
    marginTop: 10,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 12,
    color: "#b45309",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "#d97706",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  expandRadiusBtn: {
    marginTop: 14,
    backgroundColor: "#166534",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  expandRadiusBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Mandi Cards List
  recordsList: {
    gap: 12,
    marginBottom: 30,
  },
  recordCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  marketInfo: {
    flex: 1,
  },
  marketNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  marketName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#15803d",
  },
  districtName: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distancePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 10,
  },
  commodityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commodityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#15803d",
  },
  varietyGrade: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  priceWrap: {
    alignItems: "flex-end",
  },
  modalPriceKg: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  quintalPrice: {
    fontSize: 11,
    color: "#6b7280",
  },
  noPriceWrap: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noPriceBadgeText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f9fafb",
  },
  rangeText: {
    fontSize: 11,
    color: "#6b7280",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  arrivalTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  arrivalDateText: {
    fontSize: 10,
    color: "#6b7280",
  },
  sourceTag: {
    fontSize: 9,
    fontWeight: "600",
    color: "#9ca3af",
  },
})
