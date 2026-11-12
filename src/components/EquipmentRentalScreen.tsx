import { useMemo, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native"
import * as Location from "expo-location"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import { useProfile } from "../profile"
import { useEquipment, useEquipText } from "../equipment"
import DetailShell from "./DetailShell"
import { FadeSlideIn, ScalePressable } from "./Motion"
import {
  Search,
  MapPin,
  Plus,
  Star,
  ChevronRight,
  ClipboardList,
  Bell,
  Check,
  X,
  Truck,
  UserCheck,
  Store,
  Phone,
  RefreshCw,
  Navigation,
  SlidersHorizontal,
} from "lucide-react-native"

const TYPES = [
  "All",
  "Tractor",
  "Rotavator",
  "Seed Drill",
  "Sprayer",
  "Harvester",
  "Cultivator",
]

type SortMode = "nearest" | "price" | "rating"

export default function EquipmentRentalScreen() {
  const { open } = useNav()
  const { t, lang } = useLang()
  const { profile } = useProfile()
  const isKn = lang === "kn"
  const {
    equipment,
    rentals,
    stats,
    unreadCount,
    loading,
    refreshEquipment,
    toggleNotify,
  } = useEquipment()
  const tx = useEquipText()
  const eqText = t.x.equipmentA

  const [query, setQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [availOnly, setAvailOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>("nearest")
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsActive, setGpsActive] = useState(false)

  const activeRentalCount = useMemo(
    () =>
      rentals.filter(
        (r) =>
          r.status === "pending" || r.status === "approved" || r.status === "active"
      ).length,
    [rentals]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = equipment.filter((eq) => {
      if (selectedType !== "All" && eq.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false
      }
      if (availOnly && eq.availability !== "available") return false
      if (!q) return true
      return (
        eq.name.toLowerCase().includes(q) ||
        eq.type.toLowerCase().includes(q) ||
        eq.location.toLowerCase().includes(q) ||
        eq.owner.toLowerCase().includes(q) ||
        eq.crops.toLowerCase().includes(q)
      )
    })

    if (sortBy === "price") {
      return [...list].sort((a, b) => a.pricePerDay - b.pricePerDay)
    }
    if (sortBy === "rating") {
      return [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    }
    return [...list].sort((a, b) => a.distanceKm - b.distanceKm)
  }, [equipment, selectedType, availOnly, query, sortBy])

  async function handleGpsSort() {
    setGpsLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          isKn ? "ಸ್ಥಳ ಅನುಮತಿ" : "Location Permission",
          isKn
            ? "ಹತ್ತಿರದ ಯಂತ್ರಗಳ ದೂರ ಲೆಕ್ಕಿಸಲು ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ."
            : "Enable location access to sort machinery by live GPS distance."
        )
        return
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      await refreshEquipment({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      })
      setGpsActive(true)
    } catch {
      await refreshEquipment()
    } finally {
      setGpsLoading(false)
    }
  }

  function handleCallOwner(phone?: string) {
    if (!phone) return
    Linking.openURL(`tel:${phone}`).catch(() => {})
  }

  return (
    <DetailShell
      title={eqText.rental.title}
      subtitle={eqText.rental.subtitle}
      action={
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => refreshEquipment()}
            style={styles.headerBtn}
            accessibilityLabel="Refresh"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <RefreshCw size={17} color="#ffffff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => open("rentalNotifications")}
            style={styles.headerBtn}
            accessibilityLabel={eqText.rental.notifAria}
          >
            <Bell size={18} color="#ffffff" />
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      }
    >
      {/* Quick Hub Strip */}
      <FadeSlideIn delay={40}>
      <View style={styles.hubStrip}>
        <ScalePressable
          onPress={() => open("myRentals")}
          scaleTo={0.95}
          style={styles.hubCard}
        >
          <View style={[styles.hubIconWrap, { backgroundColor: "#e8f5e9" }]}>
            <ClipboardList size={17} color="#256428" />
          </View>
          <Text style={styles.hubTitle} numberOfLines={1}>
            {eqText.rental.myRentals}
          </Text>
          <Text style={styles.hubSub}>
            {activeRentalCount > 0
              ? isKn
                ? `${activeRentalCount} ಸಕ್ರಿಯ`
                : `${activeRentalCount} active`
              : isKn
              ? `${rentals.length} ಒಟ್ಟು`
              : `${rentals.length} total`}
          </Text>
        </ScalePressable>

        <ScalePressable
          onPress={() => open("ownerDashboard")}
          scaleTo={0.95}
          style={styles.hubCard}
        >
          <View style={[styles.hubIconWrap, { backgroundColor: "#fef3c7" }]}>
            <Store size={17} color="#b45309" />
          </View>
          <Text style={styles.hubTitle} numberOfLines={1}>
            {isKn ? "ಮಾಲೀಕರ ಹಬ್" : "Owner Hub"}
          </Text>
          <Text style={[styles.hubSub, stats.pendingCount > 0 && { color: "#b45309" }]}>
            {stats.pendingCount > 0
              ? isKn
                ? `${stats.pendingCount} ಬಾಕಿ ಮನವಿ`
                : `${stats.pendingCount} pending`
              : isKn
              ? `${stats.listedCount} ಯಂತ್ರಗಳು`
              : `${stats.listedCount} listed`}
          </Text>
        </ScalePressable>

        <ScalePressable
          onPress={() => open("listEquipment")}
          scaleTo={0.95}
          style={[styles.hubCard, styles.hubCardPrimary]}
        >
          <View style={[styles.hubIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Plus size={18} color="#ffffff" />
          </View>
          <Text style={[styles.hubTitle, { color: "#ffffff" }]} numberOfLines={1}>
            {isKn ? "ಯಂತ್ರ ಪಟ್ಟಿ" : "List Machine"}
          </Text>
          <Text style={[styles.hubSub, { color: "#dcfce7" }]}>
            {isKn ? "ಬಾಡಿಗೆ ಆದಾಯ" : "Earn ₹/day"}
          </Text>
        </ScalePressable>
      </View>
      </FadeSlideIn>

      {/* Search + Live GPS Near Me Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={eqText.rental.searchPlaceholder}
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <X size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={handleGpsSort}
          disabled={gpsLoading}
          style={[styles.gpsBtn, gpsActive && styles.gpsBtnActive]}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color={gpsActive ? "#ffffff" : "#256428"} />
          ) : (
            <Navigation size={16} color={gpsActive ? "#ffffff" : "#256428"} />
          )}
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScroll}
      >
        {TYPES.map((tp) => {
          const active = selectedType === tp
          const label = tp === "All" ? (isKn ? "ಎಲ್ಲಾ" : "All") : tx.type(tp)
          return (
            <TouchableOpacity
              key={tp}
              onPress={() => setSelectedType(tp)}
              style={[styles.typePill, active && styles.typePillActive]}
            >
              <Text style={[styles.typeText, active && styles.typeTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Availability Toggle + Sort Controls */}
      <View style={styles.filterControlRow}>
        <TouchableOpacity
          onPress={() => setAvailOnly((v) => !v)}
          style={[styles.availFilterChip, availOnly && styles.availFilterChipActive]}
        >
          <SlidersHorizontal size={12} color={availOnly ? "#ffffff" : "#374151"} />
          <Text
            style={[styles.availFilterText, availOnly && styles.availFilterTextActive]}
          >
            {isKn ? "ಈಗ ಲಭ್ಯ" : "Available Now"}
          </Text>
        </TouchableOpacity>

        <View style={styles.sortGroup}>
          {(
            [
              { id: "nearest", label: isKn ? "ಹತ್ತಿರದ್ದು" : "Nearest" },
              { id: "price", label: isKn ? "ಕಡಿಮೆ ₹" : "Lowest ₹" },
              { id: "rating", label: isKn ? "ರೇಟಿಂಗ್" : "Top Rated" },
            ] as const
          ).map((s) => {
            const active = sortBy === s.id
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSortBy(s.id)}
                style={[styles.sortChip, active && styles.sortChipActive]}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {eqText.rental.nearYou} ({profile.district || "Mandya"})
        </Text>
        <Text style={styles.sectionCount}>
          {isKn ? `${filtered.length} ಯಂತ್ರಗಳು` : `${filtered.length} found`}
        </Text>
      </View>

      {/* Equipment List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{eqText.rental.noMatch}</Text>
          <Text style={styles.emptySub}>
            {isKn
              ? "ಫಿಲ್ಟರ್ ಬದಲಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಯಂತ್ರವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ."
              : "Try clearing filters or list your own farm machinery."}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setQuery("")
              setSelectedType("All")
              setAvailOnly(false)
            }}
            style={styles.resetFilterBtn}
          >
            <Text style={styles.resetFilterText}>
              {isKn ? "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ" : "Reset Filters"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.equipmentList}>
          {filtered.map((item) => {
            const isAvailable = item.availability === "available"
            return (
              <View key={item.id} style={styles.equipmentCard}>
                <TouchableOpacity
                  onPress={() => open("equipmentDetails", { equipmentId: item.id })}
                  activeOpacity={0.92}
                >
                  <View style={styles.imageWrap}>
                    <Image source={{ uri: item.image }} style={styles.equipImage} />
                    <View
                      style={[
                        styles.floatingAvailBadge,
                        isAvailable ? styles.availGreen : styles.availBooked,
                      ]}
                    >
                      <Text
                        style={
                          isAvailable ? styles.availGreenText : styles.availBookedText
                        }
                      >
                        {isAvailable
                          ? isKn
                            ? "ಲಭ್ಯವಿದೆ"
                            : "Available"
                          : isKn
                          ? "ಬುಕ್ ಆಗಿದೆ"
                          : "Booked"}
                      </Text>
                    </View>
                    <View style={styles.floatingDistBadge}>
                      <MapPin size={11} color="#ffffff" />
                      <Text style={styles.floatingDistText}>
                        {item.distanceKm} {isKn ? "ಕಿ.ಮೀ" : "km"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardHeaderWrap}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.equipName}>{tx.name(item.name)}</Text>
                      <View style={styles.ratingMeta}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.ratingText}>
                          {item.rating.toFixed(1)}
                        </Text>
                        <Text style={styles.reviewCountText}>({item.reviews})</Text>
                      </View>
                    </View>

                    <Text style={styles.ownerLine}>
                      {isKn ? "ಮಾಲೀಕರು:" : "Owner:"} {item.owner} · {item.location}
                    </Text>

                    {/* Capabilities tags */}
                    <View style={styles.capabilityRow}>
                      {item.deliveryAvailable && (
                        <View style={styles.capTag}>
                          <Truck size={11} color="#256428" />
                          <Text style={styles.capTagText}>
                            {isKn
                              ? `ತಲುಪಿಸುವಿಕೆ ₹${item.deliveryFee || 0}`
                              : `Delivery ₹${item.deliveryFee || 0}`}
                          </Text>
                        </View>
                      )}
                      {item.operatorIncluded && (
                        <View style={styles.capTagBlue}>
                          <UserCheck size={11} color="#1d4ed8" />
                          <Text style={styles.capTagBlueText}>
                            {isKn ? "ಚಾಲಕ ಲಭ್ಯ" : "Operator option"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Price & Action Row */}
                <View style={styles.cardBottomRow}>
                  <View>
                    <Text style={styles.pricePerDay}>
                      ₹{item.pricePerDay.toLocaleString("en-IN")}
                      <Text style={styles.perDayUnit}>
                        {" "}
                        / {isKn ? "ದಿನ" : "day"}
                      </Text>
                    </Text>
                    <Text style={styles.specText}>
                      {item.hp} · {tx.fuel(item.fuel)}
                    </Text>
                  </View>

                  <View style={styles.cardCtaRow}>
                    {!!item.ownerPhone && (
                      <TouchableOpacity
                        onPress={() => handleCallOwner(item.ownerPhone)}
                        style={styles.callCircleBtn}
                        accessibilityLabel="Call owner"
                      >
                        <Phone size={15} color="#256428" />
                      </TouchableOpacity>
                    )}

                    {isAvailable ? (
                      <TouchableOpacity
                        onPress={() => open("requestRental", { equipmentId: item.id })}
                        activeOpacity={0.8}
                        style={styles.rentBtn}
                      >
                        <Text style={styles.rentBtnText}>
                          {isKn ? "ಬುಕ್ ಮಾಡಿ" : "Book Now"}
                        </Text>
                        <ChevronRight size={15} color="#ffffff" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => toggleNotify(item.id)}
                        activeOpacity={0.8}
                        style={[
                          styles.notifyBtn,
                          item.notifyMe && styles.notifyBtnActive,
                        ]}
                      >
                        {item.notifyMe ? (
                          <Check size={14} color="#15803d" />
                        ) : (
                          <Bell size={14} color="#4b5563" />
                        )}
                        <Text
                          style={[
                            styles.notifyBtnText,
                            item.notifyMe && styles.notifyBtnTextActive,
                          ]}
                        >
                          {item.notifyMe
                            ? isKn
                              ? "ತಿಳಿಸಲಾಗುವುದು ✓"
                              : "Notified ✓"
                            : isKn
                            ? "ಲಭ್ಯವಾದಾಗ ತಿಳಿಸಿ"
                            : "Notify Me"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#1a5632",
  },
  headerBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
  },
  hubStrip: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  hubCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 11,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  hubCardPrimary: {
    backgroundColor: "#256428",
  },
  hubIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  hubTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  hubSub: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  gpsBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  gpsBtnActive: {
    backgroundColor: "#256428",
  },
  typeScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  typePillActive: {
    backgroundColor: "#256428",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  typeTextActive: {
    color: "#ffffff",
  },
  filterControlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  availFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  availFilterChipActive: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  availFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  availFilterTextActive: {
    color: "#ffffff",
  },
  sortGroup: {
    flexDirection: "row",
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  sortChipActive: {
    backgroundColor: "#1f2937",
  },
  sortText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  sortTextActive: {
    color: "#ffffff",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#256428",
  },
  equipmentList: {
    gap: 16,
    paddingBottom: 24,
  },
  equipmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 165,
    backgroundColor: "#e5e7eb",
  },
  equipImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  floatingAvailBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  floatingDistBadge: {
    position: "absolute",
    bottom: 10,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.72)",
  },
  floatingDistText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  equipName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  availGreen: {
    backgroundColor: "#dcfce7",
  },
  availGreenText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  availBooked: {
    backgroundColor: "#fef3c7",
  },
  availBookedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  ownerLine: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  ratingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  reviewCountText: {
    fontSize: 11,
    color: "#6b7280",
  },
  capabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  capTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  capTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803d",
  },
  capTagBlue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  capTagBlueText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  pricePerDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  perDayUnit: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#6b7280",
  },
  specText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  rentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#256428",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 4,
  },
  rentBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
  notifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  notifyBtnActive: {
    backgroundColor: "#dcfce7",
  },
  notifyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  notifyBtnTextActive: {
    color: "#15803d",
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },
  resetFilterBtn: {
    marginTop: 14,
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#256428",
  },
})
