import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useProfile } from "../profile"
import { useLang, fmt } from "../i18n"
import { useNav } from "../nav"
import {
  fetchActiveCropStage,
  type ActiveCropStageResponse,
} from "../api/cropStage"
import DetailShell from "./DetailShell"
import {
  Ruler,
  Sprout,
  MapPin,
  Droplets,
  Layers,
  Calendar,
  TrendingUp,
  ScanLine,
  ChevronRight,
} from "lucide-react-native"

export default function MyFarmScreen() {
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const { open } = useNav()
  const isKn = lang === "kn"
  const x = t.x.coreA
  const cropMap = (x.crops as Record<string, string>) || {}

  const [stageData, setStageData] = useState<ActiveCropStageResponse | null>(null)

  useEffect(() => {
    fetchActiveCropStage(profile.mobile)
      .then(setStageData)
      .catch(() => {})
  }, [profile.mobile])

  const parsedTotal = parseFloat(profile.farmSize) || 4.2
  const perCropAcres = (parsedTotal / Math.max(profile.crops.length, 1)).toFixed(1)
  const farmerDisplay =
    isKn && profile.nameKn ? profile.nameKn : profile.name
  const locationText = [profile.village, profile.taluk, profile.district]
    .filter(Boolean)
    .join(", ")

  const activeStageLabel = stageData
    ? isKn
      ? stageData.cropField.currentStageNameKn
      : stageData.cropField.currentStageNameEn
    : isKn
    ? "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಬೆಳವಣಿಗೆ"
    : "Tillering & Vegetative"

  return (
    <DetailShell
      title={t.profile.myFarm}
      subtitle={`${farmerDisplay} · ${locationText || profile.state}`}
    >
      {/* Farm Overview Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={styles.locWrap}>
            <MapPin size={15} color="#256428" />
            <Text style={styles.landTitle}>
              {isKn ? "ಹೊಲ #1 (ಮುಖ್ಯ ಜಮೀನು)" : "Field #1 (Main Plot)"}
            </Text>
          </View>
          <View style={styles.rtcBadge}>
            <Text style={styles.rtcText}>
              {isKn ? "RTC ದೃಢೀಕೃತ" : "RTC Verified"}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ruler size={18} color="#256428" />
            <Text style={styles.metricVal}>
              {fmt(x.common.acresValue, { size: profile.farmSize })}
            </Text>
            <Text style={styles.metricLabel}>{t.profile.farm.size}</Text>
          </View>
          <View style={styles.metricItem}>
            <Layers size={18} color="#d97706" />
            <Text style={styles.metricVal}>{x.myFarm.redLoam}</Text>
            <Text style={styles.metricLabel}>
              {isKn ? "ಮಣ್ಣಿನ ವಿಧ" : "Soil Type"}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Droplets size={18} color="#2563eb" />
            <Text style={styles.metricVal}>
              {isKn ? "ಬೋರ್‌ವೆಲ್ + ಹನಿ" : "Borewell + Drip"}
            </Text>
            <Text style={styles.metricLabel}>
              {isKn ? "ನೀರಾವರಿ" : "Irrigation"}
            </Text>
          </View>
        </View>
      </View>

      {/* Active Crops in Field */}
      <Text style={styles.sectionHeader}>{x.myFarm.myCrops}</Text>
      <View style={styles.cropsList}>
        {profile.crops.map((crop, idx) => (
          <View key={`${crop}_${idx}`} style={styles.cropCard}>
            <View style={styles.cropIconBox}>
              <Sprout size={22} color="#16a34a" />
            </View>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{cropMap[crop] || crop}</Text>
              <Text style={styles.cropDetails}>
                {idx === 0 && stageData
                  ? `${activeStageLabel} · ${isKn ? "ದಿನ" : "Day"} ${stageData.cropField.daysSinceSowing}`
                  : isKn
                  ? "ಮುಂಗಾರು ಹಂಗಾಮು · ಆರೋಗ್ಯಕರ"
                  : "Kharif Season · Healthy"}
              </Text>
            </View>
            <Text style={styles.cropAcres}>
              {fmt(x.common.acAbbr, { size: perCropAcres })}
            </Text>
          </View>
        ))}
      </View>

      {/* Farm Tools */}
      <Text style={styles.sectionHeader}>{x.myFarm.tools}</Text>
      <View style={styles.toolsCard}>
        <TouchableOpacity
          onPress={() => open("calendar")}
          style={styles.toolRow}
        >
          <View style={styles.toolLeft}>
            <Calendar size={18} color="#256428" />
            <Text style={styles.toolLabel}>{x.myFarm.cropCalendar}</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open("market")}
          style={[styles.toolRow, styles.toolBorder]}
        >
          <View style={styles.toolLeft}>
            <TrendingUp size={18} color="#d97706" />
            <Text style={styles.toolLabel}>{x.myFarm.marketPrices}</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open("scanHistory")}
          style={[styles.toolRow, styles.toolBorder]}
        >
          <View style={styles.toolLeft}>
            <ScanLine size={18} color="#16a34a" />
            <Text style={styles.toolLabel}>{x.myFarm.scanHistory}</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>
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
  locWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  landTitle: {
    fontSize: 15,
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
    gap: 10,
  },
  metricItem: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 6,
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  cropsList: {
    gap: 10,
    marginBottom: 22,
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
  toolsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  toolBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  toolLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
})
