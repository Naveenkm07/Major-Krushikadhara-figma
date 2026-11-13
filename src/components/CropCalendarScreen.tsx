import { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import {
  fetchActiveCropStage,
  updateCropStageStatus,
  updateFieldSowingDate,
  type ActiveCropStageResponse,
  type GrowthStageItem,
  type StageAdvisoryItem,
} from "../api/cropStage"
import {
  CROPS_CATALOG,
  CROP_CATEGORIES,
  findCropInCatalog,
  calculateDynamicCropStage,
  type CropCalendarItem,
} from "../data/cropCalendarCatalog"
import DetailShell from "./DetailShell"
import {
  Sprout,
  Wheat,
  Droplets,
  FlaskConical,
  Scissors,
  Check,
  Mic,
  Calendar,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Layers,
} from "lucide-react-native"

const STAGE_VISUALS = [
  { icon: Sprout, color: "#16a34a", bg: "#dcfce7" },
  { icon: Wheat, color: "#0d9488", bg: "#ccfbf1" },
  { icon: Droplets, color: "#2563eb", bg: "#dbeafe" },
  { icon: FlaskConical, color: "#ea580c", bg: "#ffedd5" },
  { icon: Scissors, color: "#9333ea", bg: "#f3e8ff" },
]

const HEALTH_OPTIONS: Array<{ key: string; altKeys?: string[]; en: string; kn: string }> = [
  { key: "HEALTHY", en: "Healthy", kn: "ಆರೋಗ್ಯಕರ" },
  { key: "WATER_STRESSED", en: "Needs Water", kn: "ನೀರಿನ ಅಗತ್ಯ" },
  { key: "LOW_NUTRIENTS", altKeys: ["NUTRIENT_DEFICIENT"], en: "Low Nutrients", kn: "ಪೋಷಕಾಂಶ ಕೊರತೆ" },
  { key: "PEST_SUSPECTED", altKeys: ["PEST_ALERT"], en: "Pest Alert", kn: "ಕೀಟ ಶಂಕೆ" },
]

function formatAdvCategory(cat: string, isKn: boolean): string {
  switch (cat) {
    case "FERTILIZER":
      return isKn ? "ರಸಗೊಬ್ಬರ" : "FERTILIZER"
    case "PEST_PREVENTION":
      return isKn ? "ಕೀಟ & ರೋಗ ನಿಯಂತ್ರಣ" : "PEST & DISEASE CONTROL"
    case "IRRIGATION":
      return isKn ? "ನೀರಾವರಿ ನಿರ್ವಹಣೆ" : "IRRIGATION"
    case "WEATHER_ALERT":
      return isKn ? "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ" : "WEATHER ALERT"
    default:
      return cat.replace(/_/g, " ")
  }
}

export default function CropCalendarScreen() {
  const { t, lang } = useLang()
  const { profile, refreshProfile, addCropField } = useProfile()
  const { open } = useNav()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}

  // Active plot & preview state
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(undefined)
  const [data, setData] = useState<ActiveCropStageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingHealth, setUpdatingHealth] = useState(false)

  // Expandable timeline stages
  const [expandedStageKey, setExpandedStageKey] = useState<string | null>(null)

  // Day Adjustment Modal
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [inputDaysAgo, setInputDaysAgo] = useState("35")
  const [savingDay, setSavingDay] = useState(false)

  // 32+ Crops Explorer Modal
  const [catalogModalOpen, setCatalogModalOpen] = useState(false)
  const [catalogCategory, setCatalogCategory] = useState("ALL")
  const [catalogSearch, setCatalogSearch] = useState("")

  // Quick Add Crop from Explorer Modal
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false)
  const [quickAddCrop, setQuickAddCrop] = useState<CropCalendarItem | null>(null)
  const [quickAddVariety, setQuickAddVariety] = useState("")
  const [quickAddAcres, setQuickAddAcres] = useState("1.0")
  const [quickAddDaysAgo, setQuickAddDaysAgo] = useState("15")
  const [addingCrop, setAddingCrop] = useState(false)

  // Temporary offline preview crop (when browsing crops not yet added to farm)
  const [previewCropItem, setPreviewCropItem] = useState<CropCalendarItem | null>(null)
  const [previewDaysAgo, setPreviewDaysAgo] = useState(35)

  const fieldsSyncKey = profile.cropFields
    .map((f) => `${f.id}:${f.cropName}:${f.healthStatus}:${f.daysSinceSowing}`)
    .join("|")

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchActiveCropStage(
      profile.mobile,
      selectedFieldId,
      previewCropItem ? previewCropItem.nameEn : profile.crops[0],
      previewDaysAgo
    )
      .then((res) => {
        if (active) setData(res)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [profile.mobile, selectedFieldId, fieldsSyncKey, previewCropItem, previewDaysAgo])

  // Current field / crop calculations
  const field = data?.cropField
  const allFields = data?.fields || []
  const currentCropDef = useMemo(() => {
    return findCropInCatalog(field?.cropName || previewCropItem?.nameEn || profile.crops[0] || "Rice")
  }, [field?.cropName, previewCropItem, profile.crops])

  const stages: GrowthStageItem[] = data?.allStages || []
  const days = field?.daysSinceSowing ?? previewDaysAgo ?? 35
  const totalDays = currentCropDef.totalDays || 120
  const isPerennial = Boolean(currentCropDef.isPerennial)
  const cappedDays = isPerennial ? ((days - 1) % totalDays) + 1 : Math.min(days, totalDays)
  const progressPct = Math.min(100, Math.max(8, Math.round((cappedDays / totalDays) * 100)))
  const daysRemaining = Math.max(0, totalDays - cappedDays)

  const currentIdx = Math.max(
    0,
    stages.findIndex((s) => s.isCurrent)
  )

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    let list = CROPS_CATALOG
    if (catalogCategory !== "ALL") {
      list = list.filter((c) => c.category === catalogCategory)
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.nameEn.toLowerCase().includes(q) ||
          c.nameKn.toLowerCase().includes(q) ||
          c.scientificName.toLowerCase().includes(q) ||
          c.popularVarieties.some((v) => v.toLowerCase().includes(q))
      )
    }
    return list
  }, [catalogCategory, catalogSearch])

  // Handle Health Status Check-in
  async function handleHealthUpdate(statusKey: string) {
    if (!field?.id) return
    if (field.id.startsWith("fb-") || field.id.startsWith("offline-")) {
      setData((prev) =>
        prev ? { ...prev, cropField: { ...prev.cropField, healthStatus: statusKey } } : prev
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

  // Handle Sowing Date / Days Adjustment
  async function handleSaveSowingDays() {
    const parsedDays = Math.max(1, parseInt(inputDaysAgo, 10) || 1)
    setSavingDay(true)

    if (previewCropItem) {
      setPreviewDaysAgo(parsedDays)
      setSavingDay(false)
      setDayModalOpen(false)
      return
    }

    if (field?.id && !field.id.startsWith("fb-") && !field.id.startsWith("offline-")) {
      await updateFieldSowingDate(field.id, {
        mobile: profile.mobile,
        daysAgo: parsedDays,
      })
      await refreshProfile(profile.mobile).catch(() => {})
    }

    // Immediately recalculate local stage dynamically
    const dynamic = calculateDynamicCropStage(field?.cropName || "Rice", parsedDays)
    setData((prev) =>
      prev
        ? {
            ...prev,
            cropField: {
              ...prev.cropField,
              daysSinceSowing: parsedDays,
              currentStageKey: dynamic.currentStage.key,
              currentStageNameEn: dynamic.currentStage.nameEn,
              currentStageNameKn: dynamic.currentStage.nameKn,
              stageDescriptionEn: dynamic.currentStage.descriptionEn,
              stageDescriptionKn: dynamic.currentStage.descriptionKn,
            },
            dailyAdvisories: dynamic.currentStage.advisories,
            allStages: dynamic.stages,
          }
        : prev
    )

    setSavingDay(false)
    setDayModalOpen(false)
  }

  // Select a crop from 32+ catalog to preview
  function handleSelectCropToPreview(crop: CropCalendarItem) {
    setPreviewCropItem(crop)
    setSelectedFieldId(undefined)
    setCatalogModalOpen(false)
    setExpandedStageKey(null)

    // Recalculate dynamic preview for Day 35
    const dynamic = calculateDynamicCropStage(crop, 35)
    setData({
      success: true,
      cropInfo: {
        id: crop.id,
        nameEn: crop.nameEn,
        nameKn: crop.nameKn,
        category: crop.category,
        categoryKn: crop.categoryKn,
        totalDays: crop.totalDays,
        isPerennial: Boolean(crop.isPerennial),
        popularVarieties: crop.popularVarieties,
        seasons: crop.seasons,
        soilType: crop.soilType,
        soilTypeKn: crop.soilTypeKn,
        iconName: crop.iconName,
      },
      cropField: {
        id: `preview-${crop.id}`,
        cropName: crop.nameEn,
        variety: crop.popularVarieties[0] || "Standard",
        sowingDate: new Date(Date.now() - 35 * 86400000).toISOString(),
        daysSinceSowing: 35,
        currentStageKey: dynamic.currentStage.key,
        currentStageNameEn: dynamic.currentStage.nameEn,
        currentStageNameKn: dynamic.currentStage.nameKn,
        stageDescriptionEn: dynamic.currentStage.descriptionEn,
        stageDescriptionKn: dynamic.currentStage.descriptionKn,
        healthStatus: "HEALTHY",
      },
      dailyAdvisories: dynamic.currentStage.advisories,
      allStages: dynamic.stages,
    })
  }

  // Open Quick Add Modal for a Catalog Crop
  function openQuickAdd(crop: CropCalendarItem) {
    setQuickAddCrop(crop)
    setQuickAddVariety(crop.popularVarieties[0] || "")
    setQuickAddAcres("1.0")
    setQuickAddDaysAgo("15")
    setQuickAddModalOpen(true)
  }

  async function handleConfirmQuickAdd() {
    if (!quickAddCrop) return
    const acresVal = parseFloat(quickAddAcres) || 1.0
    const daysVal = Math.max(1, parseInt(quickAddDaysAgo, 10) || 15)
    const sowingIso = new Date(Date.now() - daysVal * 86400000).toISOString()

    setAddingCrop(true)
    const ok = await addCropField({
      cropName: quickAddCrop.nameEn,
      variety: quickAddVariety.trim() || quickAddCrop.popularVarieties[0] || "Local High-Yield",
      acreage: acresVal,
      season: quickAddCrop.seasons[0] || "Kharif",
      sowingDate: sowingIso,
    })
    setAddingCrop(false)

    if (ok) {
      setQuickAddModalOpen(false)
      setCatalogModalOpen(false)
      setPreviewCropItem(null)
      await refreshProfile(profile.mobile).catch(() => {})
      Alert.alert(
        isKn ? "ಯಶಸ್ವಿ" : "Crop Added!",
        isKn
          ? `${quickAddCrop.nameKn} ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.`
          : `${quickAddCrop.nameEn} added to your farm plots.`
      )
    } else {
      Alert.alert(
        isKn ? "ದೋಷ" : "Error",
        isKn ? "ಬೆಳೆ ಸೇರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ." : "Could not add crop to farm."
      )
    }
  }

  return (
    <DetailShell
      title={t.quickActions?.calendar || (isKn ? "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್" : "Crop Calendar")}
      subtitle={`${currentCropDef.nameEn} (${currentCropDef.nameKn}) · ${profile.district}`}
    >
      {/* Top Header: Plot Switcher + "+ Browse 32 Crops" Button */}
      <View style={styles.topControlRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fieldTabsRow}
          style={{ flex: 1, marginRight: 8 }}
        >
          {/* Saved Farmer Plots */}
          {allFields.map((f) => {
            const active = !previewCropItem && (f.id === field?.id || (selectedFieldId === undefined && f.id === allFields[0]?.id))
            const label = /^rice\s*\(paddy\)$/i.test(f.cropName) ? "Rice" : f.cropName
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  setPreviewCropItem(null)
                  setSelectedFieldId(f.id)
                }}
                style={[styles.fieldChip, active && styles.fieldChipActive]}
              >
                <Text style={[styles.fieldChipText, active && styles.fieldChipTextActive]}>
                  {cropMap[label] || f.cropName}
                </Text>
              </TouchableOpacity>
            )
          })}

          {/* Active Preview Chip if browsing external crop */}
          {previewCropItem ? (
            <View style={[styles.fieldChip, styles.fieldChipPreviewActive]}>
              <Sparkles size={13} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.fieldChipTextActive}>
                {previewCropItem.nameEn} (Preview)
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* 32 Crops Explorer Button */}
        <TouchableOpacity
          onPress={() => setCatalogModalOpen(true)}
          style={styles.browseCropsBtn}
          activeOpacity={0.8}
        >
          <Layers size={14} color="#256428" />
          <Text style={styles.browseCropsBtnText}>
            {isKn ? "32 ಬೆಳೆಗಳು" : "32 Crops"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#256428" />
        </View>
      ) : null}

      {/* Preview Mode Notification Banner */}
      {previewCropItem ? (
        <View style={styles.previewNoticeCard}>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#b45309" />
              <Text style={styles.previewNoticeTitle}>
                {isKn ? "ಕ್ಯಾಲೆಂಡರ್ ಪೂರ್ವವೀಕ್ಷಣೆ" : "Crop Calendar Preview"}
              </Text>
            </View>
            <Text style={styles.previewNoticeSub}>
              {isKn
                ? `${previewCropItem.nameKn} ಬೆಳೆಯನ್ನು ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಸೇರಿಸಲು ಕೆಳಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ.`
                : `Viewing full ${totalDays}-day lifecycle for ${previewCropItem.nameEn}.`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openQuickAdd(previewCropItem)}
            style={styles.previewAddBtn}
          >
            <Plus size={14} color="#ffffff" />
            <Text style={styles.previewAddBtnText}>
              {isKn ? "ಹೊಲಕ್ಕೆ ಸೇರಿಸಿ" : "+ Add Plot"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Current Stage Hero Banner with Sowing Date Adjustment */}
      <View style={styles.banner}>
        <View style={styles.bannerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSub}>
              {isKn ? "ಪ್ರಸ್ತುತ ಬೆಳವಣಿಗೆ ಹಂತ" : "Active Growth Stage"}
            </Text>
            <Text style={styles.bannerCrop}>
              {field?.cropName || (isKn ? currentCropDef.nameKn : currentCropDef.nameEn)}
              {field?.variety ? ` • ${field.variety}` : ""}
            </Text>
          </View>

          {/* Quick Adjust Day Button */}
          <TouchableOpacity
            onPress={() => {
              setInputDaysAgo(String(days))
              setDayModalOpen(true)
            }}
            style={styles.adjustDayBtn}
          >
            <Calendar size={13} color="#15803d" />
            <Text style={styles.adjustDayText}>
              {isKn ? "ದಿನ ಬದಲಾಯಿಸಿ" : "Adjust Day"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bannerPhase}>
          {isKn ? field?.currentStageNameKn : field?.currentStageNameEn} ·{" "}
          {isKn
            ? `ದಿನ ${days} / ${totalDays} (${progressPct}%)`
            : `Day ${days} of ${totalDays} (${progressPct}%)`}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        <View style={styles.bannerMetaRow}>
          <View style={styles.metaBadge}>
            <Clock size={11} color="#f0fdf4" />
            <Text style={styles.metaBadgeText}>
              {isPerennial
                ? isKn
                  ? "ವಾರ್ಷಿಕ ಪುನರಾವರ್ತಿತ ಬೆಳೆ"
                  : "Perennial / Year-Round Cycle"
                : isKn
                ? `ಕೊಯ್ಲಿಗೆ ${daysRemaining} ದಿನಗಳು ಬಾಕಿ`
                : `${daysRemaining} days to harvest`}
            </Text>
          </View>

          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {currentCropDef.category}
            </Text>
          </View>
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
            const currentHs = field?.healthStatus
            const active =
              currentHs === opt.key ||
              Boolean(opt.altKeys?.includes(currentHs as string))
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

        {/* Dynamic Contextual Alert Based on Health Check-in */}
        {field?.healthStatus && field.healthStatus !== "HEALTHY" ? (
          <View style={styles.healthAdviceAlert}>
            <AlertCircle size={15} color="#b45309" />
            <Text style={styles.healthAdviceText}>
              {field.healthStatus === "WATER_STRESSED"
                ? isKn
                  ? `ಪ್ರಸ್ತುತ ${field.currentStageNameKn} ಹಂತದಲ್ಲಿ ನೀರು ಕಡಿಮೆಯಾಗದಂತೆ ತೇವಾಂಶ ಕಾಪಾಡಿ.`
                  : `Ensure critical irrigation during ${field.currentStageNameEn} to prevent yield drop.`
                : field.healthStatus === "PEST_SUSPECTED" || field.healthStatus === "PEST_ALERT"
                ? isKn
                  ? `ಕೀಟದ ಲಕ್ಷಣ ಕಂಡರೆ ರೋಗನಿದಾನಕ್ಕೆ ಕ್ರಾಪ್ ಸ್ಕ್ಯಾನ್ ಅಥವಾ ಬೇವಿನ ಎಣ್ಣೆ (5 ಮಿ.ಲೀ/ಲೀ) ಬಳಸಿ.`
                  : `Scout undersides of leaves and take an AI Pest Scan to identify pest precisely.`
                : isKn
                ? `ಪೋಷಕಾಂಶ ಕೊರತೆ ನಿವಾರಿಸಲು ಲಘು ಪೋಷಕಾಂಶ ಅಥವಾ 19:19:19 ಸಿಂಪಡಿಸಿ.`
                : `Apply recommended foliar NPK 19:19:19 or micronutrient spray.`}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Today's Advisories */}
      {data?.dailyAdvisories && data.dailyAdvisories.length > 0 ? (
        <View style={styles.advisorySection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>
                {isKn ? "ಇಂದಿನ ಹಂತ-ನಿರ್ದಿಷ್ಟ ಸಲಹೆಗಳು" : "Today's Stage Advisories"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isKn
                  ? `${field?.currentStageNameKn || "ಪ್ರಸ್ತುತ ಹಂತ"}ಕ್ಕೆ ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ`
                  : `Tailored for ${field?.currentStageNameEn || "Active Stage"}`}
              </Text>
            </View>
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

          {data.dailyAdvisories.map((adv: StageAdvisoryItem, idx: number) => {
            const isHigh = adv.urgency === "HIGH"
            return (
              <View
                key={idx}
                style={[styles.advCard, isHigh && styles.advCardHigh]}
              >
                <View style={styles.advHeaderRow}>
                  <Text style={[styles.advCat, isHigh && styles.advCatHigh]}>
                    {formatAdvCategory(adv.category, isKn)}
                  </Text>
                  {isHigh ? (
                    <View style={styles.urgentPill}>
                      <Text style={styles.urgentText}>
                        {isKn ? "ಮುಖ್ಯ" : "HIGH PRIORITY"}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.advTitle}>
                  {isKn ? adv.titleKn : adv.titleEn}
                </Text>
                <Text style={styles.advBody}>
                  {isKn ? adv.bodyKn : adv.bodyEn}
                </Text>
              </View>
            )
          })}
        </View>
      ) : null}

      {/* Vertical Interactive Timeline */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>
            {isKn ? "ಬೆಳೆ ಜೀವನಚಕ್ರ ಹಂತಗಳು" : "Growth Lifecycle Timeline"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {isKn
              ? "ಹಂತವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಸಂಪೂರ್ಣ ವಿವರ & ಸಲಹೆಗಳನ್ನು ನೋಡಿ"
              : "Tap any stage to view complete schedule & guidelines"}
          </Text>
        </View>
      </View>

      <View style={styles.timelineList}>
        {stages.map((st, i) => {
          const vis = STAGE_VISUALS[i % STAGE_VISUALS.length]
          const isDone = st.isCompleted || (!st.isCurrent && (cappedDays > st.endDay || i < currentIdx))
          const isExpanded = expandedStageKey === st.key
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

              <TouchableOpacity
                onPress={() => setExpandedStageKey(isExpanded ? null : st.key)}
                activeOpacity={0.88}
                style={[
                  styles.stageCard,
                  st.isCurrent && styles.stageCardCurrent,
                  isExpanded && styles.stageCardExpanded,
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
                  {!isDone && !st.isCurrent ? (
                    <View style={styles.upcomingPill}>
                      <Text style={styles.upcomingText}>
                        {isKn ? "ಮುಂಬರುವ" : "Upcoming"}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.stageRangeRow}>
                  <Text style={styles.stageRange}>
                    {isKn
                      ? `ದಿನಗಳು ${st.startDay} - ${st.endDay}`
                      : `Days ${st.startDay} - ${st.endDay}`}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={16} color="#6b7280" />
                  ) : (
                    <ChevronDown size={16} color="#6b7280" />
                  )}
                </View>

                {/* Expanded Stage Agronomic Details */}
                {isExpanded ? (
                  <View style={styles.expandedDetailsWrap}>
                    <Text style={styles.stageDescText}>
                      {isKn
                        ? st.descriptionKn || "ಈ ಹಂತದಲ್ಲಿ ಸಸ್ಯದ ಪೋಷಕಾಂಶ ಮತ್ತು ನೀರಿನ ನಿರ್ವಹಣೆ ಮುಖ್ಯ."
                        : st.descriptionEn || "Nutrient and moisture management are critical during this phase."}
                    </Text>

                    {st.advisories && st.advisories.length > 0 ? (
                      <View style={styles.stageAdvisoriesList}>
                        <Text style={styles.stageAdvisoriesHeader}>
                          {isKn ? "ಹಂತದ ಪ್ರಮುಖ ಶಿಫಾರಸುಗಳು:" : "Stage Recommendations:"}
                        </Text>
                        {st.advisories.map((adv, aIdx) => (
                          <View key={aIdx} style={styles.stageAdvMiniCard}>
                            <View style={styles.stageAdvMiniHeader}>
                              <Text style={styles.stageAdvMiniCat}>
                                {formatAdvCategory(adv.category, isKn)}
                              </Text>
                              <Text style={styles.stageAdvMiniTitle}>
                                {isKn ? adv.titleKn : adv.titleEn}
                              </Text>
                            </View>
                            <Text style={styles.stageAdvMiniBody}>
                              {isKn ? adv.bodyKn : adv.bodyEn}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          )
        })}
      </View>

      {/* Sowing Date / Days Adjustment Modal */}
      <Modal
        visible={dayModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDayModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.dayModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Calendar size={20} color="#256428" />
                <Text style={styles.modalTitle}>
                  {isKn ? "ಬಿತ್ತನೆ ದಿನ ಬದಲಾಯಿಸಿ" : "Adjust Sowing Days"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDayModalOpen(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.dayModalDesc}>
              {isKn
                ? "ಬಿತ್ತನೆಯಾಗಿ ಎಷ್ಟು ದಿನಗಳಾಗಿವೆ ಎಂಬುದನ್ನು ನಮೂದಿಸಿ. ಕ್ಯಾಲೆಂಡರ್ ಹಂತಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಬದಲಾಗುತ್ತವೆ."
                : "Enter days elapsed since sowing. The calendar stages and advisories will adjust automatically."}
            </Text>

            <View style={styles.dayInputRow}>
              <Text style={styles.dayInputLabel}>
                {isKn ? "ಕಳೆದ ದಿನಗಳು:" : "Days Elapsed:"}
              </Text>
              <TextInput
                value={inputDaysAgo}
                onChangeText={(v) => setInputDaysAgo(v.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={3}
                style={styles.dayInput}
              />
              <Text style={styles.dayInputUnit}>{isKn ? "ದಿನಗಳು" : "Days"}</Text>
            </View>

            {/* Quick Presets */}
            <Text style={styles.quickPresetLabel}>
              {isKn ? "ತ್ವರಿತ ಆಯ್ಕೆಗಳು:" : "Quick Stage Jumps:"}
            </Text>
            <View style={styles.presetChipsRow}>
              {[15, 35, 60, 85, 105].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setInputDaysAgo(String(preset))}
                  style={[
                    styles.presetChip,
                    inputDaysAgo === String(preset) && styles.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      inputDaysAgo === String(preset) && styles.presetChipTextActive,
                    ]}
                  >
                    Day {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setDayModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>
                  {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveSowingDays}
                disabled={savingDay}
                style={styles.modalConfirmBtn}
              >
                {savingDay ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Check size={16} color="#ffffff" />
                )}
                <Text style={styles.modalConfirmText}>
                  {isKn ? "ಅನ್ವಯಿಸಿ" : "Apply & Update"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 32+ Crops Catalog Explorer Modal */}
      <Modal
        visible={catalogModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCatalogModalOpen(false)}
      >
        <View style={styles.catalogModalBackdrop}>
          <View style={styles.catalogModalSheet}>
            {/* Sheet Header */}
            <View style={styles.catalogHeader}>
              <View>
                <Text style={styles.catalogTitle}>
                  {isKn ? "32 ಬೆಳೆಗಳ ಡೈನಾಮಿಕ್ ಕ್ಯಾಲೆಂಡರ್" : "32+ Crops Calendar Catalog"}
                </Text>
                <Text style={styles.catalogSubtitle}>
                  {isKn
                    ? "ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕೃಷಿ & ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳ ಹಂತಗಳು"
                    : "Karnataka & Indian agricultural lifecycle guide"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCatalogModalOpen(false)}
                style={styles.closeCircleBtn}
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchBar}>
              <Search size={18} color="#9ca3af" />
              <TextInput
                value={catalogSearch}
                onChangeText={setCatalogSearch}
                placeholder={
                  isKn
                    ? "ಬೆಳೆಯ ಹೆಸರು ಹುಡುಕಿ (ಉದಾ. ಕಬ್ಬು, ಭತ್ತ, Cotton)..."
                    : "Search 32 crops (e.g. Maize, Cotton, Ginger)..."
                }
                style={styles.searchInput}
                placeholderTextColor="#9ca3af"
              />
              {catalogSearch ? (
                <TouchableOpacity onPress={() => setCatalogSearch("")}>
                  <X size={16} color="#9ca3af" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CROP_CATEGORIES.map((cat) => {
                const active = catalogCategory === cat.id
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCatalogCategory(cat.id)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {isKn ? cat.kn : cat.en}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* Crops Grid / List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cropsListContent}
            >
              {filteredCatalog.map((crop) => (
                <View key={crop.id} style={styles.catalogCropCard}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.cropTitleRow}>
                      <Text style={styles.cropCardTitle}>
                        {crop.nameEn}
                      </Text>
                      <Text style={styles.cropCardKannada}>
                        ({crop.nameKn})
                      </Text>
                    </View>

                    <Text style={styles.cropCardScientific}>
                      {crop.scientificName}
                    </Text>

                    <View style={styles.cropBadgesRow}>
                      <View style={styles.cropDurationBadge}>
                        <Clock size={11} color="#15803d" />
                        <Text style={styles.cropDurationText}>
                          {crop.isPerennial
                            ? isKn
                              ? "ವಾರ್ಷಿಕ"
                              : "Perennial"
                            : isKn
                            ? `${crop.totalDays} ದಿನಗಳು`
                            : `${crop.totalDays} Days`}
                        </Text>
                      </View>

                      <View style={styles.cropCategoryBadge}>
                        <Text style={styles.cropCategoryText}>
                          {crop.category}
                        </Text>
                      </View>

                      <View style={styles.cropStagesBadge}>
                        <Text style={styles.cropStagesText}>
                          {crop.stages.length} Stages
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cropVarietiesText} numberOfLines={1}>
                      {isKn ? "ತಳಿಗಳು: " : "Varieties: "}
                      {crop.popularVarieties.slice(0, 3).join(", ")}
                    </Text>
                  </View>

                  {/* Actions for Crop */}
                  <View style={styles.cropActionColumn}>
                    <TouchableOpacity
                      onPress={() => handleSelectCropToPreview(crop)}
                      style={styles.previewBtn}
                    >
                      <Sparkles size={12} color="#256428" />
                      <Text style={styles.previewBtnText}>
                        {isKn ? "ನೋಡಿ" : "View"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => openQuickAdd(crop)}
                      style={styles.addPlotBtn}
                    >
                      <Plus size={12} color="#ffffff" />
                      <Text style={styles.addPlotBtnText}>
                        {isKn ? "ಸೇರಿಸಿ" : "Add"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quick Add Plot from Catalog Modal */}
      <Modal
        visible={quickAddModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickAddModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.dayModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Sprout size={20} color="#256428" />
                <Text style={styles.modalTitle}>
                  {isKn ? "ಹೊಲಕ್ಕೆ ಬೆಳೆ ಸೇರಿಸಿ" : "Add Crop to Farm"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setQuickAddModalOpen(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {quickAddCrop ? (
              <View style={{ gap: 12 }}>
                <View style={styles.quickAddHeaderCard}>
                  <Text style={styles.quickAddCropName}>
                    {quickAddCrop.nameEn} ({quickAddCrop.nameKn})
                  </Text>
                  <Text style={styles.quickAddCropSub}>
                    {quickAddCrop.category} · {quickAddCrop.totalDays} Days Cycle
                  </Text>
                </View>

                <Text style={styles.dayInputLabel}>
                  {isKn ? "ತಳಿ / ವೆರೈಟಿ" : "Crop Variety"}
                </Text>
                <TextInput
                  value={quickAddVariety}
                  onChangeText={setQuickAddVariety}
                  placeholder={quickAddCrop.popularVarieties[0] || "e.g. High Yield"}
                  style={styles.modalInput}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.dayInputLabel}>{isKn ? "ಎಕರೆ" : "Acres"}</Text>
                    <TextInput
                      value={quickAddAcres}
                      onChangeText={setQuickAddAcres}
                      keyboardType="decimal-pad"
                      style={styles.modalInput}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.dayInputLabel}>
                      {isKn ? "ಬಿತ್ತನೆಯಾಗಿ ದಿನಗಳು" : "Days Ago Sown"}
                    </Text>
                    <TextInput
                      value={quickAddDaysAgo}
                      onChangeText={(v) => setQuickAddDaysAgo(v.replace(/\D/g, ""))}
                      keyboardType="number-pad"
                      style={styles.modalInput}
                    />
                  </View>
                </View>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    onPress={() => setQuickAddModalOpen(false)}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>
                      {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirmQuickAdd}
                    disabled={addingCrop}
                    style={styles.modalConfirmBtn}
                  >
                    {addingCrop ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Check size={16} color="#ffffff" />
                    )}
                    <Text style={styles.modalConfirmText}>
                      {isKn ? "ಖಚಿತಪಡಿಸಿ" : "Save to Farm"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  topControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  fieldTabsRow: {
    gap: 8,
    paddingVertical: 2,
    alignItems: "center",
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
  fieldChipPreviewActive: {
    backgroundColor: "#b45309",
    borderColor: "#b45309",
    flexDirection: "row",
    alignItems: "center",
  },
  fieldChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  fieldChipTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  browseCropsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  browseCropsBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#256428",
  },
  previewNoticeCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fde68a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  previewNoticeTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#92400e",
  },
  previewNoticeSub: {
    fontSize: 11,
    color: "#78350f",
  },
  previewAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#256428",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  previewAddBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  loadingWrap: {
    paddingVertical: 14,
  },
  banner: {
    backgroundColor: "#256428",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  adjustDayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adjustDayText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#15803d",
  },
  bannerPhase: {
    fontSize: 13,
    color: "#f6efd8",
    fontWeight: "600",
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#bbf7d0",
    borderRadius: 4,
  },
  bannerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaBadgeText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
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
  healthAdviceAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  healthAdviceText: {
    fontSize: 11,
    color: "#92400e",
    flex: 1,
    lineHeight: 16,
  },
  advisorySection: {
    marginBottom: 18,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
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
  advCardHigh: {
    borderLeftColor: "#ea580c",
    backgroundColor: "#fffbf5",
  },
  advHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  advCat: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#15803d",
    letterSpacing: 0.5,
  },
  advCatHigh: {
    color: "#c2410c",
  },
  urgentPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#dc2626",
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
    gap: 12,
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
  stageCardExpanded: {
    borderColor: "#16a34a",
    borderWidth: 1.5,
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
  upcomingPill: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  upcomingText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
  },
  stageRangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  stageRange: {
    fontSize: 12,
    color: "#6b7280",
  },
  expandedDetailsWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 8,
  },
  stageDescText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
  },
  stageAdvisoriesList: {
    marginTop: 6,
    gap: 6,
  },
  stageAdvisoriesHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#15803d",
  },
  stageAdvMiniCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#256428",
  },
  stageAdvMiniHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stageAdvMiniCat: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#15803d",
  },
  stageAdvMiniTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  stageAdvMiniBody: {
    fontSize: 11,
    color: "#4b5563",
    marginTop: 2,
    lineHeight: 15,
  },

  // Day Adjustment Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dayModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  dayModalDesc: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 17,
    marginBottom: 12,
  },
  dayInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dayInputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  dayInput: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    width: 70,
    textAlign: "center",
  },
  dayInputUnit: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  quickPresetLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 6,
  },
  presetChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  presetChipActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
  },
  presetChipText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "600",
  },
  presetChipTextActive: {
    color: "#15803d",
    fontWeight: "bold",
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  modalConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#256428",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },

  // 32 Crops Catalog Sheet
  catalogModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  catalogModalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "92%",
  },
  catalogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  catalogTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  catalogSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    padding: 0,
  },
  categoryScroll: {
    gap: 6,
    paddingBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryChipActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  categoryChipText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  cropsListContent: {
    paddingBottom: 24,
    gap: 10,
  },
  catalogCropCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cropTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  cropCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  cropCardKannada: {
    fontSize: 12,
    color: "#256428",
    fontWeight: "600",
  },
  cropCardScientific: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#6b7280",
  },
  cropBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 4,
  },
  cropDurationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cropDurationText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#15803d",
  },
  cropCategoryBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cropCategoryText: {
    fontSize: 9,
    color: "#4b5563",
    fontWeight: "600",
  },
  cropStagesBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cropStagesText: {
    fontSize: 9,
    color: "#0369a1",
    fontWeight: "bold",
  },
  cropVarietiesText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 3,
  },
  cropActionColumn: {
    gap: 6,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  previewBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#256428",
  },
  addPlotBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#256428",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addPlotBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  quickAddHeaderCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  quickAddCropName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
  },
  quickAddCropSub: {
    fontSize: 11,
    color: "#15803d",
    marginTop: 2,
  },
  modalInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
})
