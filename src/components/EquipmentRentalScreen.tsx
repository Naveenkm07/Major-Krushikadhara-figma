import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import { useEquipment, useEquipText } from "../equipment"
import DetailShell from "./DetailShell"
import {
  Search,
  MapPin,
  Plus,
  Star,
  ChevronRight,
  ClipboardList,
  Bell,
  Check,
} from "lucide-react-native"

const TYPES = ["All", "Tractor", "Rotavator", "Seed Drill", "Sprayer", "Harvester"]

export default function EquipmentRentalScreen() {
  const { open } = useNav()
  const { t, lang } = useLang()
  const isKn = lang === "kn"
  const { equipment, toggleNotify } = useEquipment()
  const tx = useEquipText()
  const eqText = t.x.equipmentA
  const [query, setQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")

  const filtered = equipment.filter((eq) => {
    if (selectedType !== "All" && eq.type !== selectedType) return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      eq.name.toLowerCase().includes(q) ||
      eq.type.toLowerCase().includes(q) ||
      eq.location.toLowerCase().includes(q)
    )
  })

  return (
    <DetailShell
      title={eqText.rental.title}
      subtitle={eqText.rental.subtitle}
      action={
        <TouchableOpacity
          onPress={() => open("myRentals")}
          style={styles.headerBtn}
        >
          <ClipboardList size={18} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={18} color="#6b7280" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={eqText.rental.searchPlaceholder}
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {/* Type filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScroll}
      >
        {TYPES.map((tp) => {
          const active = selectedType === tp
          const label =
            tp === "All" ? (isKn ? "ಎಲ್ಲಾ" : "All") : tx.type(tp)
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

      {/* Equipment List */}
      <View style={styles.equipmentList}>
        {filtered.map((item) => {
          const isAvailable = item.availability === "available"
          return (
            <View key={item.id} style={styles.equipmentCard}>
              <TouchableOpacity
                onPress={() => open("equipmentDetails", { equipmentId: item.id })}
                activeOpacity={0.9}
              >
                <Image source={{ uri: item.image }} style={styles.equipImage} />
                <View style={styles.cardHeaderWrap}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.equipName}>{tx.name(item.name)}</Text>
                    <View
                      style={[
                        styles.availBadge,
                        isAvailable ? styles.availGreen : styles.availBooked,
                      ]}
                    >
                      <Text
                        style={
                          isAvailable
                            ? styles.availGreenText
                            : styles.availBookedText
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
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.locationMeta}>
                      <MapPin size={13} color="#6b7280" />
                      <Text style={styles.metaText}>
                        {item.location} · {item.distanceKm} {isKn ? "ಕಿ.ಮೀ ದೂರ" : "km away"}
                      </Text>
                    </View>
                    <View style={styles.ratingMeta}>
                      <Star size={13} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Price & Action Row */}
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.pricePerDay}>
                    ₹{item.pricePerDay}
                    <Text style={styles.perDayUnit}>
                      {" "}
                      / {isKn ? "ದಿನ" : "day"}
                    </Text>
                  </Text>
                  <Text style={styles.specText}>
                    {item.hp} · {tx.fuel(item.fuel)}
                  </Text>
                </View>

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
          )
        })}
      </View>

      {/* List My Equipment Bottom Button */}
      <TouchableOpacity
        onPress={() => open("listEquipment")}
        activeOpacity={0.85}
        style={styles.listOwnBtn}
      >
        <Plus size={18} color="#256428" />
        <Text style={styles.listOwnBtnText}>{eqText.rental.listYours}</Text>
      </TouchableOpacity>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
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
  typeScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
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
  equipmentList: {
    gap: 16,
    marginTop: 6,
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
  equipImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  cardHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  equipName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  availBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    backgroundColor: "#f3f4f6",
  },
  availBookedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  locationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  ratingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  pricePerDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#256428",
  },
  perDayUnit: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#6b7280",
  },
  specText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  rentBtn: {
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
    color: "#4b5563",
  },
  notifyBtnTextActive: {
    color: "#15803d",
  },
  listOwnBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#256428",
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  listOwnBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#256428",
  },
})
