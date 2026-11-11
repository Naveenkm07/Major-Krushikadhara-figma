import { View, Text, StyleSheet, Image } from "react-native"
import { useProfile } from "../profile"
import DetailShell from "./DetailShell"
import { Ruler, Sprout, MapPin, Droplets, Layers } from "lucide-react-native"

export default function MyFarmScreen() {
  const { profile } = useProfile()

  return (
    <DetailShell
      title="My Farm"
      subtitle={`${profile.name}'s Agricultural Land Records`}
    >
      {/* Farm Overview Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.landTitle}>Field #1 (Main Plot)</Text>
          <View style={styles.rtcBadge}>
            <Text style={styles.rtcText}>RTC Verified</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ruler size={18} color="#256428" />
            <Text style={styles.metricVal}>{profile.farmSize} Acres</Text>
            <Text style={styles.metricLabel}>Total Area</Text>
          </View>
          <View style={styles.metricItem}>
            <Layers size={18} color="#d97706" />
            <Text style={styles.metricVal}>Red Sandy Loam</Text>
            <Text style={styles.metricLabel}>Soil Type</Text>
          </View>
          <View style={styles.metricItem}>
            <Droplets size={18} color="#2563eb" />
            <Text style={styles.metricVal}>Borewell + Drip</Text>
            <Text style={styles.metricLabel}>Irrigation</Text>
          </View>
        </View>
      </View>

      {/* Active Crops in Field */}
      <Text style={styles.sectionHeader}>Active Plantings</Text>
      <View style={styles.cropsList}>
        {profile.crops.map((crop, idx) => (
          <View key={idx} style={styles.cropCard}>
            <View style={styles.cropIconBox}>
              <Sprout size={22} color="#16a34a" />
            </View>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{crop}</Text>
              <Text style={styles.cropDetails}>Kharif Season · Healthy</Text>
            </View>
            <Text style={styles.cropAcres}>1.4 ac</Text>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  landTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  rtcBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rtcText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 6,
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  cropsList: {
    gap: 10,
    marginBottom: 30,
  },
  cropCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cropIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  cropDetails: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cropAcres: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#256428",
  },
})

