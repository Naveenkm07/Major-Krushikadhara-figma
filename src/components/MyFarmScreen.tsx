import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useProfile } from "../profile"
import { useLang, fmt } from "../i18n"
import { useNav } from "../nav"
import type { CropFieldDTO } from "../api/profile"
import { CROPS_CATALOG, findCropInCatalog } from "../data/cropCalendarCatalog"
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
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ShieldCheck,
} from "lucide-react-native"

const SOIL_OPTIONS = ["Red Loam", "Black Cotton Soil", "Alluvial / Silt", "Laterite Soil", "Sandy Loam"]
const IRRIGATION_OPTIONS = ["Borewell + Drip", "Canal + Flood", "Sprinkler", "Rainfed", "Open Well"]
const SEASONS = ["Kharif", "Rabi", "Summer"]

export default function MyFarmScreen() {
  const {
    profile,
    refreshProfile,
    saveProfile,
    addCropField,
    editCropField,
    removeCropField,
  } = useProfile()
  const { lang, t } = useLang()
  const { open } = useNav()
  const isKn = lang === "kn"
  const x = t.x.coreA
  const cropMap = (x.crops as Record<string, string>) || {}

  // Farm Soil/Irrigation Editor
  const [farmModalOpen, setFarmModalOpen] = useState(false)
  const [editSoil, setEditSoil] = useState(profile.soilType)
  const [editIrr, setEditIrr] = useState(profile.irrigationType)
  const [editRtc, setEditRtc] = useState(profile.rtcVerified)
  const [savingFarm, setSavingFarm] = useState(false)

  // Add / Edit Plot Modal
  const [plotModalOpen, setPlotModalOpen] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [plotCrop, setPlotCrop] = useState("Tomato")
  const [plotVariety, setPlotVariety] = useState("")
  const [plotAcres, setPlotAcres] = useState("1.0")
  const [plotSeason, setPlotSeason] = useState("Kharif")
  const [plotDaysAgo, setPlotDaysAgo] = useState("30")
  const [savingPlot, setSavingPlot] = useState(false)

  useEffect(() => {
    refreshProfile(profile.mobile).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.mobile])

  const parsedTotal = parseFloat(profile.farmSize) || 4.2
  const displayFields: CropFieldDTO[] =
    profile.cropFields && profile.cropFields.length > 0
      ? profile.cropFields
      : profile.crops.map((crop, idx) => ({
          id: `local-${idx}`,
          cropName: crop,
          variety: "Local High-Yield",
          acreage: Math.round((parsedTotal / Math.max(profile.crops.length, 1)) * 10) / 10,
          season: "Kharif",
          sowingDate: new Date(Date.now() - 35 * 86400000).toISOString(),
          daysSinceSowing: 35,
          currentStage: "TILLERING_VEGETATIVE",
          currentStageNameEn: "Tillering & Vegetative",
          currentStageNameKn: "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಬೆಳವಣಿಗೆ",
          healthStatus: "HEALTHY",
        }))

  const farmerDisplay = isKn && profile.nameKn ? profile.nameKn : profile.name
  const locationText = [profile.village, profile.taluk, profile.district]
    .filter(Boolean)
    .join(", ")

  function handleSelectQuickCrop(cropItem: (typeof CROPS_CATALOG)[0]) {
    setPlotCrop(cropItem.nameEn)
    setPlotVariety(cropItem.popularVarieties[0] || "Local High-Yield")
    setPlotSeason(cropItem.seasons[0] || "Kharif")
  }

  function openNewPlotModal() {
    setEditingFieldId(null)
    setPlotCrop("Rice (Paddy)")
    setPlotVariety("BPT 5204 (Sona Masoori)")
    setPlotAcres("1.0")
    setPlotSeason("Kharif")
    setPlotDaysAgo("25")
    setPlotModalOpen(true)
  }

  function openEditPlotModal(field: CropFieldDTO) {
    setEditingFieldId(field.id)
    setPlotCrop(field.cropName)
    setPlotVariety(field.variety || "")
    setPlotAcres(String(field.acreage))
    setPlotSeason(field.season || "Kharif")
    setPlotDaysAgo(String(field.daysSinceSowing || 30))
    setPlotModalOpen(true)
  }

  async function handleSavePlot() {
    const cleanCrop = plotCrop.trim()
    const acresVal = parseFloat(plotAcres)
    const daysVal = Math.max(1, parseInt(plotDaysAgo, 10) || 15)
    if (!cleanCrop) {
      Alert.alert(isKn ? "ದೋಷ" : "Missing Crop", isKn ? "ಬೆಳೆ ಹೆಸರು ನಮೂದಿಸಿ." : "Please enter a crop name.")
      return
    }
    if (!Number.isFinite(acresVal) || acresVal <= 0) {
      Alert.alert(isKn ? "ದೋಷ" : "Invalid Area", isKn ? "ಸರಿಯಾದ ಎಕರೆ ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ." : "Enter positive acreage.")
      return
    }

    const sowingIso = new Date(Date.now() - daysVal * 86400000).toISOString()
    setSavingPlot(true)
    let ok = false
    if (editingFieldId && !editingFieldId.startsWith("local-")) {
      ok = await editCropField(editingFieldId, {
        cropName: cleanCrop,
        variety: plotVariety.trim() || "Local High-Yield",
        acreage: acresVal,
        season: plotSeason,
        sowingDate: sowingIso,
      })
    } else {
      ok = await addCropField({
        cropName: cleanCrop,
        variety: plotVariety.trim() || "Local High-Yield",
        acreage: acresVal,
        season: plotSeason,
        sowingDate: sowingIso,
      })
    }
    setSavingPlot(false)
    if (!ok) {
      Alert.alert(
        isKn ? "ಸರ್ವರ್ ದೋಷ" : "Sync Failed",
        isKn ? "ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." : "Could not save crop plot to server."
      )
      return
    }
    setPlotModalOpen(false)
  }

  function handleDeletePlot(field: CropFieldDTO) {
    if (displayFields.length <= 1) {
      Alert.alert(
        isKn ? "ಅನುಮತಿ ಇಲ್ಲ" : "Minimum One Plot",
        isKn ? "ಕನಿಷ್ಠ ಒಂದು ಬೆಳೆ ಜಮೀನಿನಲ್ಲಿ ಇರಬೇಕು." : "At least one crop plot must remain."
      )
      return
    }
    Alert.alert(
      isKn ? "ಬೆಳೆ ಪ್ಲಾಟ್ ಅಳಿಸಿ" : "Remove Crop Plot",
      isKn
        ? `${cropMap[field.cropName] || field.cropName} ಪ್ಲಾಟ್ ಅನ್ನು ತೆಗೆದುಹಾಕಬೇಕೇ?`
        : `Remove ${field.cropName} (${field.acreage} ac)?`,
      [
        { text: x.editProfile.cancel, style: "cancel" },
        {
          text: isKn ? "ಅಳಿಸಿ" : "Remove",
          style: "destructive",
          onPress: async () => {
            await removeCropField(field.id)
          },
        },
      ]
    )
  }

  async function handleSaveFarmSetup() {
    setSavingFarm(true)
    await saveProfile({
      soilType: editSoil,
      irrigationType: editIrr,
      rtcVerified: editRtc,
    })
    setSavingFarm(false)
    setFarmModalOpen(false)
  }

  return (
    <DetailShell
      title={t.profile.myFarm}
      subtitle={`${farmerDisplay} · ${locationText || profile.state}`}
      action={
        <TouchableOpacity onPress={openNewPlotModal} style={styles.addBtn}>
          <Plus size={14} color="#ffffff" />
          <Text style={styles.addBtnText}>{isKn ? "ಸೇರಿಸಿ" : "Add Plot"}</Text>
        </TouchableOpacity>
      }
    >
      {/* Farm Overview Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={styles.locWrap}>
            <MapPin size={15} color="#256428" />
            <Text style={styles.landTitle}>
              {profile.village || profile.district} ({displayFields.length}{" "}
              {isKn ? "ಪ್ಲಾಟ್‌ಗಳು" : "Plots"})
            </Text>
          </View>
          <View style={styles.badgeActions}>
            <View
              style={[
                styles.rtcBadge,
                !profile.rtcVerified && { backgroundColor: "#fef3c7" },
              ]}
            >
              <Text
                style={[
                  styles.rtcText,
                  !profile.rtcVerified && { color: "#b45309" },
                ]}
              >
                {profile.rtcVerified
                  ? isKn
                    ? "RTC ದೃಢೀಕೃತ"
                    : "RTC Verified"
                  : isKn
                  ? "RTC ಬಾಕಿ"
                  : "RTC Unverified"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditSoil(profile.soilType)
                setEditIrr(profile.irrigationType)
                setEditRtc(profile.rtcVerified)
                setFarmModalOpen(true)
              }}
              style={styles.smallEditIcon}
            >
              <Pencil size={13} color="#256428" />
            </TouchableOpacity>
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
            <Text style={styles.metricVal}>{profile.soilType}</Text>
            <Text style={styles.metricLabel}>
              {isKn ? "ಮಣ್ಣಿನ ವಿಧ" : "Soil Type"}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Droplets size={18} color="#2563eb" />
            <Text style={styles.metricVal}>{profile.irrigationType}</Text>
            <Text style={styles.metricLabel}>
              {isKn ? "ನೀರಾವರಿ" : "Irrigation"}
            </Text>
          </View>
        </View>
      </View>

      {/* Active Crops in Field */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>{x.myFarm.myCrops}</Text>
        <TouchableOpacity onPress={openNewPlotModal}>
          <Text style={styles.addTextLink}>+ {isKn ? "ಹೊಸ ಬೆಳೆ" : "Add Crop"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cropsList}>
        {displayFields.map((field) => {
          const isHealthy = field.healthStatus === "HEALTHY"
          return (
            <View key={field.id} style={styles.cropCard}>
              <View
                style={[
                  styles.cropIconBox,
                  !isHealthy && { backgroundColor: "#fef3c7" },
                ]}
              >
                <Sprout size={22} color={isHealthy ? "#16a34a" : "#d97706"} />
              </View>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>
                  {cropMap[field.cropName] || field.cropName}
                </Text>
                <Text style={styles.cropDetails}>
                  {isKn ? field.currentStageNameKn : field.currentStageNameEn} ·{" "}
                  {isKn ? "ದಿನ" : "Day"} {field.daysSinceSowing} · {field.season}
                </Text>
                <Text style={styles.cropVariety}>
                  {field.variety} ·{" "}
                  {(() => {
                    const hs = String(field.healthStatus || "HEALTHY").toUpperCase()
                    if (hs === "HEALTHY") return isKn ? "ಆರೋಗ್ಯಕರ" : "Healthy"
                    if (hs === "WATER_STRESSED") return isKn ? "ನೀರಿನ ಒತ್ತಡ" : "Water Stressed"
                    if (hs === "NUTRIENT_DEFICIENT") return isKn ? "ಪೋಷಕಾಂಶ ಕೊರತೆ" : "Nutrient Deficient"
                    if (hs === "PEST_SUSPECTED") return isKn ? "ಕೀಟ ಶಂಕೆ" : "Pest Suspected"
                    return field.healthStatus
                  })()}
                </Text>
              </View>
              <View style={styles.cropRight}>
                <Text style={styles.cropAcres}>
                  {fmt(x.common.acAbbr, { size: String(field.acreage) })}
                </Text>
                {!field.id.startsWith("local-") ? (
                  <View style={styles.plotActionRow}>
                    <TouchableOpacity
                      onPress={() => openEditPlotModal(field)}
                      style={styles.plotMiniBtn}
                    >
                      <Pencil size={13} color="#256428" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePlot(field)}
                      style={[styles.plotMiniBtn, { backgroundColor: "#fee2e2" }]}
                    >
                      <Trash2 size={13} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          )
        })}
      </View>

      {/* Farm Tools */}
      <Text style={styles.sectionHeader}>{x.myFarm.tools}</Text>
      <View style={styles.toolsCard}>
        <TouchableOpacity onPress={() => open("calendar")} style={styles.toolRow}>
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

      {/* Soil & Irrigation Modal */}
      <Modal
        visible={farmModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFarmModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalSheet, { maxHeight: "88%" }]}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isKn ? "ಮಣ್ಣು, ನೀರಾವರಿ & RTC" : "Farm Soil, Irrigation & RTC"}
                  </Text>
                  <TouchableOpacity onPress={() => setFarmModalOpen(false)}>
                    <X size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalLabel}>{isKn ? "ಮಣ್ಣಿನ ವಿಧ" : "Soil Type"}</Text>
                <View style={styles.chipsWrap}>
                  {SOIL_OPTIONS.map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setEditSoil(st)}
                      style={[styles.chip, editSoil === st && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, editSoil === st && styles.chipTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.modalLabel}>{isKn ? "ನೀರಾವರಿ ಮೂಲ" : "Irrigation"}</Text>
                <View style={styles.chipsWrap}>
                  {IRRIGATION_OPTIONS.map((ir) => (
                    <TouchableOpacity
                      key={ir}
                      onPress={() => setEditIrr(ir)}
                      style={[styles.chip, editIrr === ir && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, editIrr === ir && styles.chipTextActive]}>
                        {ir}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.rtcToggleRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ShieldCheck size={18} color="#256428" />
                    <Text style={styles.modalLabel}>
                      {isKn ? "RTC / ಪಹಣಿ ಪರಿಶೀಲನೆ ಆಗಿದೆಯೇ?" : "RTC Land Record Verified"}
                    </Text>
                  </View>
                  <Switch
                    value={editRtc}
                    onValueChange={setEditRtc}
                    trackColor={{ false: "#d1d5db", true: "#86efac" }}
                    thumbColor={editRtc ? "#256428" : "#f3f4f6"}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveFarmSetup}
                  disabled={savingFarm}
                  style={styles.modalSaveBtn}
                >
                  {savingFarm ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Check size={18} color="#ffffff" />
                  )}
                  <Text style={styles.modalSaveText}>
                    {isKn ? "ಉಳಿಸಿ" : "Save Farm Setup"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add / Edit Plot Modal */}
      <Modal
        visible={plotModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPlotModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalSheet, { maxHeight: "88%" }]}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingFieldId
                      ? isKn
                        ? "ಬೆಳೆ ಪ್ಲಾಟ್ ಸಂಪಾದಿಸಿ"
                        : "Edit Crop Plot"
                      : isKn
                      ? "ಹೊಸ ಬೆಳೆ ಪ್ಲಾಟ್ ಸೇರಿಸಿ"
                      : "Add Crop Plot"}
                  </Text>
                  <TouchableOpacity onPress={() => setPlotModalOpen(false)}>
                    <X size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalLabel}>
                  {isKn ? "32 ಪ್ರಮುಖ ಬೆಳೆಗಳಿಂದ ಆರಿಸಿ" : "Pick from 32 Popular Crops"}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickCropsScroll}
                >
                  {CROPS_CATALOG.map((c) => {
                    const isSelected =
                      plotCrop.toLowerCase() === c.nameEn.toLowerCase() ||
                      plotCrop.toLowerCase() === c.id.toLowerCase()
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => handleSelectQuickCrop(c)}
                        style={[
                          styles.quickCropChip,
                          isSelected && styles.quickCropChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quickCropChipText,
                            isSelected && styles.quickCropChipTextActive,
                          ]}
                        >
                          {c.nameEn}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>

                <Text style={styles.modalLabel}>{isKn ? "ಬೆಳೆಯ ಹೆಸರು (ಸಂಪಾದಿಸಿ)" : "Crop Name (Or Type Custom)"}</Text>
                <TextInput
                  value={plotCrop}
                  onChangeText={setPlotCrop}
                  placeholder="Tomato, Rice, Ragi, Sugarcane..."
                  style={styles.modalInput}
                />

                <Text style={styles.modalLabel}>{isKn ? "ತಳಿ / ವೆರೈಟಿ" : "Variety"}</Text>
                <TextInput
                  value={plotVariety}
                  onChangeText={setPlotVariety}
                  placeholder="e.g. Arka Rakshak / BPT 5204"
                  style={styles.modalInput}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.modalLabel}>{isKn ? "ಎಕರೆ" : "Acres"}</Text>
                    <TextInput
                      value={plotAcres}
                      onChangeText={setPlotAcres}
                      keyboardType="decimal-pad"
                      style={styles.modalInput}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.modalLabel}>
                      {isKn ? "ಬಿತ್ತನೆಯಾಗಿ ಎಷ್ಟು ದಿನ" : "Days Since Sowing"}
                    </Text>
                    <TextInput
                      value={plotDaysAgo}
                      onChangeText={(v) => setPlotDaysAgo(v.replace(/\D/g, ""))}
                      keyboardType="number-pad"
                      style={styles.modalInput}
                    />
                  </View>
                </View>

                <Text style={styles.modalLabel}>{isKn ? "ಹಂಗಾಮು" : "Season"}</Text>
                <View style={styles.chipsWrap}>
                  {SEASONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setPlotSeason(s)}
                      style={[styles.chip, plotSeason === s && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, plotSeason === s && styles.chipTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleSavePlot}
                  disabled={savingPlot}
                  style={styles.modalSaveBtn}
                >
                  {savingPlot ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Check size={18} color="#ffffff" />
                  )}
                  <Text style={styles.modalSaveText}>
                    {isKn ? "ಪ್ಲಾಟ್ ಉಳಿಸಿ" : "Save Crop Plot"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
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
    flex: 1,
  },
  landTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  badgeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  smallEditIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  addTextLink: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#256428",
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
    color: "#4b5563",
    marginTop: 2,
  },
  cropVariety: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  cropRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cropAcres: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#256428",
  },
  plotActionRow: {
    flexDirection: "row",
    gap: 6,
  },
  plotMiniBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  rtcToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  quickCropsScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  quickCropChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickCropChipActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
  },
  quickCropChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  quickCropChipTextActive: {
    color: "#15803d",
    fontWeight: "bold",
  },
  modalSaveBtn: {
    backgroundColor: "#256428",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
