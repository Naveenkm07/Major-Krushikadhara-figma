import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import {
  fetchActiveCropStage,
  updateCropStageStatus,
  type ActiveCropStageResponse,
} from "../api/cropStage"
import DetailShell from "./DetailShell"
import {
  Sprout,
  Wheat,
  Droplets,
  FlaskConical,
  Scissors,
  Check,
  Mic,
} from "lucide-react-native"

const STAGE_VISUALS = [
  { icon: Sprout, color: "#16a34a", bg: "#dcfce7" },
  { icon: Wheat, color: "#0d9488", bg: "#ccfbf1" },
  { icon: Droplets, color: "#2563eb", bg: "#dbeafe" },
  { icon: FlaskConical, color: "#ea580c", bg: "#ffedd5" },
  { icon: Scissors, color: "#9333ea", bg: "#f3e8ff" },
]

const HEALTH_OPTIONS = [
  { key: "HEALTHY", en: "Healthy", kn: "ಆರೋಗ್ಯಕರ" },
  { key: "WATER_STRESSED", en: "Needs Water", kn: "ನೀರಿನ ಅಗತ್ಯ" },
  { key: "NUTRIENT_DEFICIENT", en: "Low Nutrients", kn: "ಪೋಷಕಾಂಶ ಕೊರತೆ" },
  { key: "PEST_SUSPECTED", en: "Pest Alert", kn: "ಕೀಟ ಶಂಕೆ" },
]

export default function CropCalendarScreen() {
  const { t, lang } = useLang()
  const { profile, refreshProfile } = useProfile()
  const { open } = useNav()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}

  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(undefined)
  const [data, setData] = useState<ActiveCropStageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingHealth, setUpdatingHealth] = useState(false)

  const fieldsSyncKey = profile.cropFields
    .map((f) => `${f.id}:${f.cropName}:${f.healthStatus}:${f.daysSinceSowing}`)
    .join("|")

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchActiveCropStage(profile.mobile, selectedFieldId)
      .then((res) => {
        if (active) setData(res)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [profile.mobile, selectedFieldId, fieldsSyncKey])

  const field = data?.cropField
  const allFields = data?.fields || []
  const stages = data?.allStages || []
  const maxDay = stages.length > 0 ? stages[stages.length - 1].endDay : 120
  const days = field?.daysSinceSowing ?? 35
  const progressPct = Math.min(100, Math.max(8, Math.round((days / Math.max(maxDay, 1)) * 100)))
  const currentIdx = Math.max(
    0,
    stages.findIndex((s) => s.isCurrent)
  )

  async function handleHealthUpdate(statusKey: string) {
    if (!field?.id) return
    if (field.id.startsWith("fb-")) {
      Alert.alert(
        isKn ? "ಆಫ್‌ಲೈನ್ ಸ್ಥಿತಿ" : "Offline Preview",
        isKn
          ? "ಸರ್ವರ್ ಸಂಪರ್ಕ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುಟವನ್ನು ಮರುಲೋಡ್ ಮಾಡಿ."
          : "Backend connection required to save plot check-in. Please refresh once connected."
      )
      return
    }
    setUpdatingHealth(true)
    const ok = await updateCropStageStatus(field.id, {
      mobile: profile.mobile,
      healthStatus: statusKey,
    })
    setUpdatingHealth(false)
    if (ok) {
      setData((prev) =>
        prev ? { ...prev, cropField: { ...prev.cropField, healthStatus: statusKey } } : prev
      )
      refreshProfile(profile.mobile).catch(() => {})
    } else {
      Alert.alert(
        isKn ? "ದೋಷ" : "Update Failed",
        isKn ? "ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ." : "Could not update plot health status."
      )
    }
  }

  return (
    <DetailShell
      title={t.quickActions?.calendar || (isKn ? "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್" : "Crop Calendar")}
      subtitle={`${field?.cropName || profile.crops[0] || "Rice"} · ${profile.district}`}
    >
      {/* Multi-Crop Plot Switcher */}
      {allFields.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fieldTabsRow}
          style={{ marginBottom: 14 }}
        >
          {allFields.map((f) => {
            const active = f.id === field?.id
            const label = /^rice\s*\(paddy\)$/i.test(f.cropName) ? "Rice" : f.cropName
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setSelectedFieldId(f.id)}
                style={[styles.fieldChip, active && styles.fieldChipActive]}
              >
                <Text style={[styles.fieldChipText, active && styles.fieldChipTextActive]}>
                  {cropMap[label] || f.cropName}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      ) : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#256428" />
        </View>
      ) : null}

      {/* Current Stage Hero Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerSub}>
          {isKn ? "ಪ್ರಸ್ತುತ ಬೆಳವಣಿಗೆ ಹಂತ" : "Active Growth Stage"}
        </Text>
        <Text style={styles.bannerCrop}>
          {field?.cropName || "Rice (Paddy)"}{" "}
          {field?.variety ? `(${field.variety})` : ""}
        </Text>
        <Text style={styles.bannerPhase}>
          {isKn ? field?.currentStageNameKn : field?.currentStageNameEn} ·{" "}
          {isKn ? `ದಿನ ${days} / ${maxDay}` : `Day ${days} of ${maxDay}`}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>

      {/* Quick Health Status Log */}
      <View style={styles.healthCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.healthTitle}>
            {isKn ? "ಹೊಲದ ಆರೋಗ್ಯ ಸ್ಥಿತಿ ದಾಖಲಿಸಿ" : "Plot Health Check-in"}
          </Text>
          {updatingHealth ? <ActivityIndicator size="small" color="#256428" /> : null}
        </View>
        <View style={styles.healthRow}>
          {HEALTH_OPTIONS.map((opt) => {
            const active = field?.healthStatus === opt.key
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleHealthUpdate(opt.key)}
                style={[styles.healthChip, active && styles.healthChipActive]}
              >
                <Text style={[styles.healthChipText, active && styles.healthChipTextActive]}>
                  {isKn ? opt.kn : opt.en}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Today's Advisories */}
      {data?.dailyAdvisories && data.dailyAdvisories.length > 0 ? (
        <View style={styles.advisorySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {isKn ? "ಇಂದಿನ ಹಂತ-ನಿರ್ದಿಷ್ಟ ಸಲಹೆಗಳು" : "Today's Stage Advisories"}
            </Text>
            <TouchableOpacity
              onPress={() => open("voiceAssistant")}
              style={styles.askAiBtn}
            >
              <Mic size={13} color="#256428" />
              <Text style={styles.askAiText}>
                {isKn ? "AI ಕೇಳಿ" : "Ask AI"}
              </Text>
            </TouchableOpacity>
          </View>

          {data.dailyAdvisories.map((adv, idx) => (
            <View key={idx} style={styles.advCard}>
              <Text style={styles.advCat}>{adv.category}</Text>
              <Text style={styles.advTitle}>
                {isKn ? adv.titleKn : adv.titleEn}
              </Text>
              <Text style={styles.advBody}>
                {isKn ? adv.bodyKn : adv.bodyEn}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Vertical Timeline */}
      <Text style={styles.sectionTitle}>
        {isKn ? "ಬೆಳೆ ಜೀವನಚಕ್ರ ಹಂತಗಳು" : "Growth Lifecycle Timeline"}
      </Text>
      <View style={styles.timelineList}>
        {stages.map((st, i) => {
          const vis = STAGE_VISUALS[i % STAGE_VISUALS.length]
          const isDone = !st.isCurrent && (days > st.endDay || i < currentIdx)
          const StageIcon = vis.icon

          return (
            <View key={st.key || i} style={styles.timelineItem}>
              <View style={styles.iconColumn}>
                <View
                  style={[
                    styles.stageIconWrap,
                    { backgroundColor: vis.bg },
                    st.isCurrent && styles.stageIconCurrent,
                  ]}
                >
                  <StageIcon size={20} color={vis.color} />
                </View>
                {i < stages.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View
                style={[
                  styles.stageCard,
                  st.isCurrent && styles.stageCardCurrent,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.stageName}>
                    {isKn ? st.nameKn : st.nameEn}
                  </Text>
                  {isDone ? (
                    <View style={styles.donePill}>
                      <Check size={12} color="#15803d" />
                      <Text style={styles.doneText}>
                        {isKn ? "ಪೂರ್ಣ" : "Completed"}
                      </Text>
                    </View>
                  ) : null}
                  {st.isCurrent ? (
                    <View style={styles.currentPill}>
                      <Text style={styles.currentText}>
                        {isKn ? "ಪ್ರಗತಿಯಲ್ಲಿದೆ" : "In Progress"}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.stageRange}>
                  {isKn
                    ? `ದಿನಗಳು ${st.startDay} - ${st.endDay}`
                    : `Days ${st.startDay} - ${st.endDay}`}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  fieldTabsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  fieldChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  fieldChipActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  fieldChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  fieldChipTextActive: {
    color: "#ffffff",
  },
  loadingWrap: {
    paddingVertical: 14,
  },
  banner: {
    backgroundColor: "#256428",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.78)",
  },
  bannerCrop: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  bannerPhase: {
    fontSize: 13,
    color: "#f6efd8",
    fontWeight: "600",
    marginTop: 6,
  },
  progressTrack: {
    height: 7,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#bbf7d0",
    borderRadius: 4,
  },
  healthCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  healthTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  healthRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  healthChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  healthChipActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
  },
  healthChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  healthChipTextActive: {
    color: "#15803d",
    fontWeight: "bold",
  },
  advisorySection: {
    marginBottom: 18,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  askAiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  askAiText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#256428",
  },
  advCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  advCat: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#15803d",
    letterSpacing: 0.5,
  },
  advTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },
  advBody: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18,
    marginTop: 4,
  },
  timelineList: {
    paddingBottom: 30,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 14,
    minHeight: 80,
  },
  iconColumn: {
    alignItems: "center",
  },
  stageIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stageIconCurrent: {
    borderWidth: 2,
    borderColor: "#256428",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  stageCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  stageCardCurrent: {
    borderWidth: 1.5,
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stageName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  donePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  doneText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  currentPill: {
    backgroundColor: "#256428",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  currentText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stageRange: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
})
