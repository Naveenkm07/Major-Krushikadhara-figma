import { useState, useEffect } from "react"
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
} from "lucide-react-native"
import { getScanHistory, subscribeScanHistory, type ScanHistoryItem } from "../storage/scanHistory"

// Dynamically import expo-image-picker
let ImagePicker: any = null
try {
  ImagePicker = require("expo-image-picker")
} catch {}

type ModeKey = "pest" | "crop" | "leaf"
const scanModes: { id: ModeKey; icon: typeof Bug; color: string; bg: string }[] = [
  { id: "pest", icon: Bug, color: "#ef4444", bg: "#fef2f2" },
  { id: "crop", icon: Sprout, color: "#16a34a", bg: "#f0fdf4" },
  { id: "leaf", icon: Leaf, color: "#0d9488", bg: "#f0fdfa" },
]

export default function ScanScreen() {
  const { t } = useLang()
  const { open } = useNav()
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<ModeKey>("pest")
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [historyItems, setHistoryItems] = useState<ScanHistoryItem[]>(getScanHistory())

  useEffect(() => {
    return subscribeScanHistory((items) => {
      setHistoryItems(items)
    })
  }, [])

  /**
   * Launch camera to capture a crop image.
   */
  async function openCamera() {
    if (!ImagePicker) {
      Alert.alert("Camera not available", "expo-image-picker is not installed.")
      return
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission Required / ಅನುಮತಿ ಅಗತ್ಯ",
        "Camera access is needed to scan crops.\nಬೆಳೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಕ್ಯಾಮರಾ ಪ್ರವೇಶ ಅಗತ್ಯ."
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets?.[0]) {
      setPreviewUri(result.assets[0].uri)
    }
  }

  /**
   * Open gallery to pick an existing crop image.
   */
  async function openGallery() {
    if (!ImagePicker) {
      Alert.alert("Gallery not available", "expo-image-picker is not installed.")
      return
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission Required / ಅನುಮತಿ ಅಗತ್ಯ",
        "Gallery access is needed to select crop images.\nಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಗ್ಯಾಲರಿ ಪ್ರವೇಶ ಅಗತ್ಯ."
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets?.[0]) {
      setPreviewUri(result.assets[0].uri)
    }
  }

  /**
   * Start the scan — send image to backend for YOLO inference.
   */
  function startScan() {
    if (!previewUri) {
      Alert.alert(
        "No Image / ಚಿತ್ರವಿಲ್ಲ",
        "Please capture or select a crop image first.\nದಯವಿಟ್ಟು ಮೊದಲು ಬೆಳೆ ಚಿತ್ರವನ್ನು ತೆಗೆಯಿರಿ."
      )
      return
    }
    open("scanProcessing", { imageUri: previewUri, mode })
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
          <View style={styles.headerTitleRow}>
            <ScanLine size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>{t.scan.title}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{t.scan.subtitle}</Text>
        </View>

        {/* Scan Mode Selector */}
        <View style={styles.modeSection}>
          <View style={styles.modeRow}>
            {scanModes.map(({ id, icon: Icon, color, bg }) => {
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
                  Tap Camera or Gallery below{"\n"}ಕೆಳಗಿನ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗ್ಯಾಲರಿ ಒತ್ತಿ
                </Text>
              </View>
            )}

            {/* Corner Bracket Guides */}
            <View style={[styles.cornerGuide, styles.topLeft]} />
            <View style={[styles.cornerGuide, styles.topRight]} />
            <View style={[styles.cornerGuide, styles.bottomLeft]} />
            <View style={[styles.cornerGuide, styles.bottomRight]} />

            {/* Live scan badge */}
            <View style={styles.liveScanBadge}>
              <Sparkles size={14} color="#ffffff" />
              <Text style={styles.liveScanText}>AI Diagnostic Ready · 102 Classes</Text>
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
              onPress={previewUri ? startScan : openCamera}
              activeOpacity={0.85}
              style={styles.scanNowBtn}
            >
              <Camera size={20} color="#ffffff" />
              <Text style={styles.scanNowBtnText}>
                {previewUri ? t.scan.scanNow : "📷 Camera"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scan button when image is loaded */}
          {previewUri && (
            <TouchableOpacity
              onPress={startScan}
              activeOpacity={0.85}
              style={styles.analyzeBtn}
            >
              <Cpu size={20} color="#ffffff" />
              <Text style={styles.analyzeBtnText}>
                🔬 Analyze for Pests / ಕೀಟ ವಿಶ್ಲೇಷಣೆ
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
              <Text style={styles.infoRowText}>How AI Diagnosis Works</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => open("scanHistory")}
            style={styles.infoRow}
          >
            <View style={styles.infoRowLeft}>
              <History size={18} color="#256428" />
              <Text style={styles.infoRowText}>{t.scan.recent}</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Recent Scans (Dynamic from storage) */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>{t.scan.recent}</Text>
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
                      {item.pest} · {item.confidence}%
                    </Text>
                    <Text style={styles.recentDate}>{item.date}</Text>
                  </View>
                  <ChevronRight size={16} color="#9ca3af" />
                </TouchableOpacity>
              )
            })}
          </View>
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
  modeSection: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
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
  viewfinderContainer: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  viewfinderCard: {
    height: 280,
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
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  emptySubtext: {
    fontSize: 11,
    color: "#6b7280",
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
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
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
    flex: 1.4,
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
    paddingVertical: 14,
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
    marginTop: 20,
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
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
