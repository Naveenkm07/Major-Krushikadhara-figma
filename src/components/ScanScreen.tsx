import { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import { useProfile } from "../profile"
import { checkScanHealth, type ScanMode } from "../api/scan"
import {
  ScanLine,
  Camera,
  ImageUp,
  Leaf,
  Bug,
  Sprout,
  ChevronRight,
  Sparkles,
  History,
  Cpu,
  X,
  ShieldCheck,
  Lightbulb,
} from "lucide-react-native"
import {
  getScanHistory,
  subscribeScanHistory,
  syncScanHistoryFromBackend,
  type ScanHistoryItem,
} from "../storage/scanHistory"

let ImagePicker: any = null
try {
  ImagePicker = require("expo-image-picker")
} catch {}

const SCAN_MODES: {
  id: ScanMode
  icon: typeof Bug
  color: string
  bg: string
  hintEn: string
  hintKn: string
}[] = [
  {
    id: "pest",
    icon: Bug,
    color: "#ef4444",
    bg: "#fef2f2",
    hintEn: "Detects 102 crop insect & pest species using YOLO11s + Gemini Vision.",
    hintKn: "YOLO11s + Gemini Vision ಬಳಸಿ 102 ಕೀಟ ಪ್ರಭೇದಗಳನ್ನು ಪತ್ತೆ ಮಾಡುತ್ತದೆ.",
  },
  {
    id: "leaf",
    icon: Leaf,
    color: "#0d9488",
    bg: "#f0fdfa",
    hintEn: "Diagnoses fungal blight, leaf spots, rust, viral curl & bacterial disease.",
    hintKn: "ಎಲೆ ಚುಕ್ಕೆ, ಅಂಗಮಾರಿ, ತುಕ್ಕು ರೋಗ ಮತ್ತು ವೈರಲ್ ರೋಗಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ.",
  },
  {
    id: "crop",
    icon: Sprout,
    color: "#16a34a",
    bg: "#f0fdf4",
    hintEn: "Evaluates overall crop vigor, nutrient deficiencies (N/P/K/Zn) & stress.",
    hintKn: "ಒಟ್ಟಾರೆ ಬೆಳೆ ಆರೋಗ್ಯ, ಪೋಷಕಾಂಶ ಕೊರತೆ (N/P/K) ಮತ್ತು ಒತ್ತಡವನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.",
  },
]

const COMMON_CROPS = [
  "Auto",
  "Tomato",
  "Rice",
  "Ragi",
  "Chilli",
  "Maize",
  "Potato",
  "Onion",
  "Sugarcane",
  "Cotton",
]

export default function ScanScreen() {
  const { t, lang } = useLang()
  const { open } = useNav()
  const { profile } = useProfile()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}

  const [mode, setMode] = useState<ScanMode>("pest")
  const [selectedCrop, setSelectedCrop] = useState<string>("Auto")
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [showTips, setShowTips] = useState(false)
  const [aiReady, setAiReady] = useState<"checking" | "ready" | "offline">("checking")
  const [historyItems, setHistoryItems] = useState<ScanHistoryItem[]>(getScanHistory())

  const cropChoices = useMemo(() => {
    const merged = ["Auto", ...(profile.crops || []), ...COMMON_CROPS]
    return Array.from(new Set(merged))
  }, [profile.crops])

  useEffect(() => {
    checkScanHealth()
      .then((h) => setAiReady(h?.model_loaded ? "ready" : "offline"))
      .catch(() => setAiReady("offline"))
  }, [])

  useEffect(() => {
    syncScanHistoryFromBackend(profile.mobile).catch(() => {})
    return subscribeScanHistory((items) => {
      setHistoryItems(items)
    })
  }, [profile.mobile])

  const activeModeMeta = SCAN_MODES.find((m) => m.id === mode) || SCAN_MODES[0]

  function localizeCropLabel(crop: string): string {
    if (crop === "Auto") return isKn ? "ಸ್ವಯಂ ಪತ್ತೆ" : "Auto Detect"
    return cropMap[crop] || crop
  }

  async function openCamera() {
    if (!ImagePicker) {
      Alert.alert("Camera not available", "expo-image-picker is not installed.")
      return
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        isKn ? "ಅನುಮತಿ ಅಗತ್ಯ" : "Permission Required",
        isKn
          ? "ಬೆಳೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶ ಅಗತ್ಯ."
          : "Camera access is needed to scan crops."
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets?.[0]) {
      setPreviewUri(result.assets[0].uri)
    }
  }

  async function openGallery() {
    if (!ImagePicker) {
      Alert.alert("Gallery not available", "expo-image-picker is not installed.")
      return
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        isKn ? "ಅನುಮತಿ ಅಗತ್ಯ" : "Permission Required",
        isKn
          ? "ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಗ್ಯಾಲರಿ ಪ್ರವೇಶ ಅಗತ್ಯ."
          : "Gallery access is needed to select crop images."
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets?.[0]) {
      setPreviewUri(result.assets[0].uri)
    }
  }

  function startScan() {
    if (!previewUri) {
      Alert.alert(
        isKn ? "ಚಿತ್ರವಿಲ್ಲ" : "No Image",
        isKn
          ? "ದಯವಿಟ್ಟು ಮೊದಲು ಬೆಳೆ ಚಿತ್ರವನ್ನು ತೆಗೆಯಿರಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ."
          : "Please capture or select a crop image first."
      )
      return
    }
    open("scanProcessing", {
      imageUri: previewUri,
      mode,
      cropName: selectedCrop,
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + 10, 44),
            },
          ]}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleRow}>
              <ScanLine size={24} color="#ffffff" />
              <Text style={styles.headerTitle}>{t.scan.title}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowTips((v) => !v)}
              style={styles.tipsToggleBtn}
              activeOpacity={0.8}
            >
              <Lightbulb size={14} color="#fef08a" />
              <Text style={styles.tipsToggleText}>
                {isKn ? "ಸಲಹೆ" : "Tips"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>{t.scan.subtitle}</Text>
        </View>

        {/* Optional Photo Capture Tips */}
        {showTips && (
          <View style={styles.tipsBanner}>
            <Text style={styles.tipsBannerTitle}>
              {isKn ? "ಉತ್ತಮ ಸ್ಕ್ಯಾನ್‌ಗಾಗಿ ಸಲಹೆಗಳು" : "Photo Tips for Accurate Diagnosis"}
            </Text>
            <Text style={styles.tipsBannerItem}>
              •{" "}
              {isKn
                ? "ಎಲೆಯಿಂದ 15–20 ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಸ್ಥಿರವಾಗಿ ಹಿಡಿಯಿರಿ."
                : "Hold camera steady 15–20 cm from a single affected leaf."}
            </Text>
            <Text style={styles.tipsBannerItem}>
              •{" "}
              {isKn
                ? "ಸಾಧ್ಯವಾದಷ್ಟು ನೈಸರ್ಗಿಕ ಹಗಲು ಬೆಳಕಿನಲ್ಲಿ ತೆಗೆಯಿರಿ (ನೆರಳು/ಮಸುಕು ತಪ್ಪಿಸಿ)."
                : "Capture in bright daylight without harsh glare or blur."}
            </Text>
            <Text style={styles.tipsBannerItem}>
              •{" "}
              {isKn
                ? "ಕೀಟ ಅಥವಾ ರೋಗದ ಚುಕ್ಕೆಗಳು ಚೌಕಟ್ಟಿನ ಮಧ್ಯದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ."
                : "Center visible spots, lesions, yellowing, or insects in the frame."}
            </Text>
          </View>
        )}

        {/* Scan Mode Selector */}
        <View style={styles.modeSection}>
          <View style={styles.modeRow}>
            {SCAN_MODES.map(({ id, icon: Icon, color, bg }) => {
              const isActive = mode === id
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setMode(id)}
                  activeOpacity={0.8}
                  style={[
                    styles.modeCard,
                    isActive && styles.modeCardActive,
                  ]}
                >
                  <View style={[styles.modeIconCircle, { backgroundColor: bg }]}>
                    <Icon size={20} color={color} />
                  </View>
                  <Text
                    style={[
                      styles.modeText,
                      isActive && styles.modeTextActive,
                    ]}
                  >
                    {t.scan.modes[id]}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={styles.modeHintPill}>
            <Text style={styles.modeHintText}>
              {isKn ? activeModeMeta.hintKn : activeModeMeta.hintEn}
            </Text>
          </View>
        </View>

        {/* Crop Context Selector */}
        <View style={styles.cropPickerWrap}>
          <Text style={styles.cropPickerLabel}>
            {isKn ? "ಬೆಳೆ ಆಯ್ಕೆ (ಐಚ್ಛಿಕ):" : "Select Crop (optional):"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cropScroll}
          >
            {cropChoices.map((crop) => {
              const active = selectedCrop === crop
              return (
                <TouchableOpacity
                  key={crop}
                  onPress={() => setSelectedCrop(crop)}
                  activeOpacity={0.8}
                  style={[styles.cropChip, active && styles.cropChipActive]}
                >
                  <Text
                    style={[
                      styles.cropChipText,
                      active && styles.cropChipTextActive,
                    ]}
                  >
                    {localizeCropLabel(crop)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Viewfinder Preview */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinderCard}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.emptyViewfinder}>
                <Camera size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>{t.scan.hint}</Text>
                <Text style={styles.emptySubtext}>
                  {isKn
                    ? "ಕೆಳಗಿನ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗ್ಯಾಲರಿ ಒತ್ತಿ"
                    : "Tap Camera or Gallery below"}
                </Text>
              </View>
            )}

            {/* Corner Bracket Guides */}
            <View style={[styles.cornerGuide, styles.topLeft]} />
            <View style={[styles.cornerGuide, styles.topRight]} />
            <View style={[styles.cornerGuide, styles.bottomLeft]} />
            <View style={[styles.cornerGuide, styles.bottomRight]} />

            {/* Live AI readiness badge */}
            <View style={styles.liveScanBadge}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      aiReady === "ready"
                        ? "#4ade80"
                        : aiReady === "checking"
                        ? "#facc15"
                        : "#f87171",
                  },
                ]}
              />
              <Sparkles size={13} color="#ffffff" />
              <Text style={styles.liveScanText}>
                {aiReady === "ready"
                  ? isKn
                    ? "YOLO11s + Gemini Vision · ಸಿದ್ಧ"
                    : "YOLO11s + Gemini Vision · Ready"
                  : aiReady === "checking"
                  ? isKn
                    ? "AI ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
                    : "Connecting to AI Engine..."
                  : isKn
                  ? "ಸರ್ವರ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ"
                  : "Check Server Connection"}
              </Text>
            </View>

            {previewUri ? (
              <TouchableOpacity
                onPress={() => setPreviewUri(null)}
                style={styles.clearBtn}
              >
                <X size={16} color="#ffffff" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Action Buttons — Camera + Gallery */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={openGallery}
              activeOpacity={0.8}
              style={styles.galleryBtn}
            >
              <ImageUp size={20} color="#256428" />
              <Text style={styles.galleryBtnText}>{t.scan.gallery}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openCamera}
              activeOpacity={0.85}
              style={styles.scanNowBtn}
            >
              <Camera size={20} color="#ffffff" />
              <Text style={styles.scanNowBtnText}>
                {previewUri
                  ? isKn
                    ? "ಮತ್ತೆ ತೆಗೆಯಿರಿ"
                    : "Retake Photo"
                  : isKn
                  ? "ಕ್ಯಾಮೆರಾ"
                  : "Camera"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Primary Diagnose CTA */}
          {previewUri && (
            <TouchableOpacity
              onPress={startScan}
              activeOpacity={0.85}
              style={styles.analyzeBtn}
            >
              <Cpu size={20} color="#ffffff" />
              <Text style={styles.analyzeBtnText}>
                {isKn
                  ? "🔬 ಈಗ AI ರೋಗನಿರ್ಣಯ ಆರಂಭಿಸಿ"
                  : "🔬 Analyze Crop Now"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Features Links */}
        <View style={styles.infoLinksSection}>
          <TouchableOpacity
            onPress={() => open("howAiWorks")}
            style={styles.infoRow}
          >
            <View style={styles.infoRowLeft}>
              <Cpu size={18} color="#256428" />
              <Text style={styles.infoRowText}>
                {isKn ? "AI ರೋಗನಿರ್ಣಯ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" : "How AI Diagnosis Works"}
              </Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => open("scanHistory")}
            style={styles.infoRow}
          >
            <View style={styles.infoRowLeft}>
              <History size={18} color="#256428" />
              <Text style={styles.infoRowText}>
                {t.scan.recent} ({historyItems.length})
              </Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Recent Scans (Dynamic from Neon + Local Store) */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.sectionTitle}>{t.scan.recent}</Text>
            {historyItems.length > 0 && (
              <TouchableOpacity onPress={() => open("scanHistory")}>
                <Text style={styles.viewAllText}>
                  {isKn ? "ಎಲ್ಲಾ ನೋಡಿ →" : "View all →"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {historyItems.length === 0 ? (
            <View style={styles.emptyHistoryCard}>
              <ScanLine size={24} color="#9ca3af" />
              <Text style={styles.emptyHistoryText}>
                {isKn
                  ? "ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ. ಮೇಲಿನ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗ್ಯಾಲರಿಯಿಂದ ಪ್ರಾರಂಭಿಸಿ."
                  : "No crop scans yet. Capture or upload a leaf photo above to get instant AI diagnosis."}
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {historyItems.slice(0, 5).map((item) => {
                const isHealthy = item.status === "healthy"
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      open("scanResult", {
                        diagnosis: item.diagnosis,
                        imageUri: item.imageUrl,
                        cropName: item.crop,
                      })
                    }
                    style={styles.recentCard}
                  >
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.recentThumb} />
                    ) : (
                      <View style={styles.recentIconWrap}>
                        {isHealthy ? (
                          <ShieldCheck size={20} color="#16a34a" />
                        ) : (
                          <Leaf size={20} color="#dc2626" />
                        )}
                      </View>
                    )}
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentCrop}>{item.crop}</Text>
                      <Text
                        style={[
                          styles.recentResult,
                          { color: isHealthy ? "#16a34a" : "#dc2626", fontWeight: "600" },
                        ]}
                      >
                        {isKn && item.pestKn ? item.pestKn : item.pest} · {item.confidence}%
                      </Text>
                      <Text style={styles.recentDate}>{item.date}</Text>
                    </View>
                    <ChevronRight size={16} color="#9ca3af" />
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  scrollContent: {
    paddingBottom: 36,
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  tipsToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tipsToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  tipsBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#fefce8",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fde047",
    gap: 4,
  },
  tipsBannerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#854d0e",
    marginBottom: 2,
  },
  tipsBannerItem: {
    fontSize: 12,
    color: "#713f12",
    lineHeight: 17,
  },
  modeSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  modeCardActive: {
    borderColor: "#256428",
    backgroundColor: "#ffffff",
  },
  modeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  modeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
    textAlign: "center",
  },
  modeTextActive: {
    color: "#256428",
    fontWeight: "bold",
  },
  modeHintPill: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modeHintText: {
    fontSize: 11.5,
    color: "#4b5563",
    lineHeight: 16,
  },
  cropPickerWrap: {
    marginTop: 14,
  },
  cropPickerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  cropScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  cropChip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cropChipActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  cropChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  cropChipTextActive: {
    color: "#ffffff",
  },
  viewfinderContainer: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  viewfinderCard: {
    height: 270,
    backgroundColor: "#1f2937",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  emptyViewfinder: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: "#d1d5db",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 16,
  },
  cornerGuide: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#ffffff",
  },
  topLeft: {
    top: 18,
    left: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 18,
    right: 18,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 18,
    left: 18,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 18,
    right: 18,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  liveScanBadge: {
    position: "absolute",
    top: 18,
    backgroundColor: "rgba(0,0,0,0.68)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveScanText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  clearBtn: {
    position: "absolute",
    bottom: 18,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 12,
  },
  galleryBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#256428",
  },
  galleryBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#256428",
  },
  scanNowBtn: {
    flex: 1.3,
    backgroundColor: "#256428",
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  scanNowBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  analyzeBtn: {
    marginTop: 12,
    backgroundColor: "#dc2626",
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#991b1b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  infoLinksSection: {
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 10,
  },
  infoRow: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoRowText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  recentSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  recentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1f2937",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#256428",
  },
  emptyHistoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: 12.5,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  recentList: {
    gap: 10,
  },
  recentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recentThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  recentIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  recentInfo: {
    flex: 1,
  },
  recentCrop: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  recentResult: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  recentDate: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },
})
