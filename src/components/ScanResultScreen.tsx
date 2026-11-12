import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { isScanBookmarked, toggleBookmarkScanResult } from "../storage/savedTips"
import { submitScanFeedback, type PestDetectionResult } from "../api/scan"
import {
  ChevronLeft,
  RotateCcw,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Share2,
  Mic,
  BarChart2,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react-native"

type TabType = "treatment" | "symptoms" | "prevention"

export default function ScanResultScreen() {
  const { back, open, params } = useNav()
  const { lang } = useLang()
  const { profile } = useProfile()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const [tab, setTab] = useState<TabType>("treatment")
  const [showBoxes, setShowBoxes] = useState(true)
  const [imgLayout, setImgLayout] = useState({ width: 0, height: 0 })
  const [imgNatSize, setImgNatSize] = useState({ width: 0, height: 0 })
  const [feedbackSent, setFeedbackSent] = useState<"up" | "down" | null>(null)

  const diagnosis: PestDetectionResult | undefined = params?.diagnosis
  const cropName: string =
    diagnosis?.detected_crop || params?.cropName || "Crop Leaf"
  const imageUri: string =
    diagnosis?.imageUrl ||
    params?.imageUri ||
    "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=450&fit=crop&auto=format"

  const isHealthy = diagnosis ? diagnosis.healthy || (!diagnosis.pest_name && diagnosis.issue_type === "healthy") : false

  const displayTitle = isHealthy
    ? isKn
      ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ"
      : "Healthy Crop"
    : isKn
    ? diagnosis?.pest_name_kn || diagnosis?.pest_name || "ಬೆಳೆ ಸಮಸ್ಯೆ ಪತ್ತೆಯಾಗಿದೆ"
    : diagnosis?.pest_name
    ? diagnosis.pest_name.charAt(0).toUpperCase() + diagnosis.pest_name.slice(1)
    : "Crop Inspection"

  const bookmarkKey = isHealthy
    ? `${cropName} Healthy Check`
    : diagnosis?.pest_name || `${cropName} Diagnosis`
  const [saved, setSaved] = useState(() => isScanBookmarked(bookmarkKey))

  const bboxDetections = (diagnosis?.all_detections || []).filter(
    (d) => Array.isArray(d.bbox) && d.bbox.length === 4 && d.bbox[2] > d.bbox[0] && d.bbox[3] > d.bbox[1]
  )

  const confidence = diagnosis ? diagnosis.confidence : 0
  const severity = diagnosis?.severity ?? (isHealthy ? "None" : "Moderate")
  const affectedPct = diagnosis?.affected_area_pct ?? (isHealthy ? 0 : 20)
  const spreadRisk = diagnosis?.spread_risk ?? (isHealthy ? "None" : "Moderate")
  const scientificName =
    diagnosis?.scientific_name && diagnosis.scientific_name !== "—"
      ? diagnosis.scientific_name
      : ""

  const about = isKn
    ? diagnosis?.about_kn || diagnosis?.about || "ವಿವರ ಲಭ್ಯವಿಲ್ಲ."
    : diagnosis?.about || "Detailed inspection report ready."

  const symptoms =
    (isKn && diagnosis?.symptoms_kn?.length
      ? diagnosis.symptoms_kn
      : diagnosis?.symptoms) || []

  const chemical =
    (isKn && diagnosis?.chemical_kn?.length
      ? diagnosis.chemical_kn
      : diagnosis?.chemical) || []

  const organic =
    (isKn && diagnosis?.organic_kn?.length
      ? diagnosis.organic_kn
      : diagnosis?.organic) || []

  const prevention =
    (isKn && diagnosis?.prevention_kn?.length
      ? diagnosis.prevention_kn
      : diagnosis?.prevention) || []

  function issueBadgeLabel() {
    const type = diagnosis?.issue_type || (isHealthy ? "healthy" : "pest")
    if (isKn) {
      switch (type) {
        case "fungal":
          return "ಶಿಲೀಂಧ್ರ ರೋಗ"
        case "bacterial":
          return "ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗ"
        case "viral":
          return "ವೈರಲ್ ರೋಗ"
        case "nutrient":
          return "ಪೋಷಕಾಂಶ ಕೊರತೆ"
        case "healthy":
          return "ಆರೋಗ್ಯಕರ"
        default:
          return "ಕೀಟ ಬಾಧೆ"
      }
    }
    switch (type) {
      case "fungal":
        return "Fungal Disease"
      case "bacterial":
        return "Bacterial Disease"
      case "viral":
        return "Viral Disease"
      case "nutrient":
        return "Nutrient Deficiency"
      case "healthy":
        return "Healthy Foliage"
      default:
        return "Insect Pest"
    }
  }

  function handleToggleSave() {
    if (!diagnosis) return
    const nowSaved = toggleBookmarkScanResult(diagnosis, cropName, profile.mobile)
    setSaved(nowSaved)
    Alert.alert(
      isKn ? "ಉಳಿಸಿದ ಸಲಹೆಗಳು" : "Saved Tips",
      nowSaved
        ? isKn
          ? "ರೋಗನಿರ್ಣಯ ವರದಿಯನ್ನು ಉಳಿಸಿದ ಸಲಹೆಗಳಿಗೆ ಸೇರಿಸಲಾಗಿದೆ ✓"
          : "Saved to your Saved Tips ✓"
        : isKn
        ? "ಉಳಿಸಿದ ಸಲಹೆಗಳಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ"
        : "Removed from Saved Tips"
    )
  }

  async function handleShareReport() {
    const lines = [
      `🌾 KrushikaDhara AI Crop Scan Report`,
      `Crop: ${cropName}`,
      `Diagnosis: ${displayTitle}${scientificName ? ` (${scientificName})` : ""}`,
      `Match Confidence: ${confidence}% | Severity: ${severity}`,
      ``,
      `About: ${about}`,
      organic.length > 0 ? `\n🌿 Organic / Bio Remedy:\n• ${organic.slice(0, 2).join("\n• ")}` : "",
      chemical.length > 0 ? `\n🧪 Chemical Dosage:\n• ${chemical.slice(0, 2).join("\n• ")}` : "",
      prevention.length > 0 ? `\n🛡️ Prevention:\n• ${prevention[0]}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    try {
      await Share.share({ message: lines })
    } catch {}
  }

  function handleAskAiFollowup() {
    const prompt = isKn
      ? `ನನ್ನ ${cropName} ಬೆಳೆಯ ಸ್ಕ್ಯಾನ್‌ನಲ್ಲಿ "${displayTitle}" (${confidence}% ನಿಖರತೆ, ತೀವ್ರತೆ: ${severity}) ಕಂಡುಬಂದಿದೆ. ನನ್ನ ${profile.farmSize} ಎಕರೆ ಜಮೀನಿಗೆ ನಿಖರ ಸಿಂಪಡಣೆ ಪ್ರಮಾಣ ಮತ್ತು ಮುಂದಿನ 7 ದಿನಗಳ ಕ್ರಮ ತಿಳಿಸಿ.`
      : `My ${cropName} scan detected "${displayTitle}" (${confidence}% confidence, severity: ${severity}). For my ${profile.farmSize}-acre farm in ${profile.district}, please tell me the exact acre-level spray tank dosage and 7-day recovery plan.`
    open("voiceAssistant", { initialPrompt: prompt })
  }

  function handleFeedback(helpful: boolean) {
    setFeedbackSent(helpful ? "up" : "down")
    if (diagnosis?.scan_id) {
      submitScanFeedback(diagnosis.scan_id, helpful).catch(() => {})
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + 10, 44),
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={back} style={styles.iconCircle}>
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isKn ? "ರೋಗನಿರ್ಣಯ ವರದಿ" : "Diagnosis Report"}
          </Text>
          <View style={styles.headerRightActions}>
            <TouchableOpacity onPress={handleShareReport} style={styles.iconCircle}>
              <Share2 size={17} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleSave} style={styles.iconCircle}>
              <Bookmark
                size={17}
                color="#ffffff"
                fill={saved ? "#ffffff" : "none"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
      >
        {/* Scanned Photo + Live YOLO Bounding Box Overlay */}
        <View
          style={styles.imageCard}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout
            if (width !== imgLayout.width || height !== imgLayout.height) {
              setImgLayout({ width, height })
            }
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.leafImg}
            onLoad={(e) => {
              const src = e.nativeEvent?.source
              if (src?.width && src?.height) {
                setImgNatSize({ width: src.width, height: src.height })
              }
            }}
          />

          {/* Bounding boxes from YOLO11s aligned to rendered 'contain' image rect */}
          {showBoxes &&
            imgLayout.width > 0 &&
            imgLayout.height > 0 &&
            bboxDetections.map((det, idx) => {
              const cw = imgLayout.width
              const ch = imgLayout.height
              let dispW = cw
              let dispH = ch
              let offX = 0
              let offY = 0
              if (imgNatSize.width > 0 && imgNatSize.height > 0) {
                const scale = Math.min(cw / imgNatSize.width, ch / imgNatSize.height)
                dispW = imgNatSize.width * scale
                dispH = imgNatSize.height * scale
                offX = (cw - dispW) / 2
                offY = (ch - dispH) / 2
              }
              const [x1, y1, x2, y2] = det.bbox!
              const left = offX + x1 * dispW
              const top = offY + y1 * dispH
              const boxW = Math.max(24, (x2 - x1) * dispW)
              const boxH = Math.max(24, (y2 - y1) * dispH)
              return (
                <View
                  key={`${det.class_name}_${idx}`}
                  pointerEvents="none"
                  style={[
                    styles.bboxRect,
                    { left, top, width: boxW, height: boxH },
                  ]}
                >
                  <View style={styles.bboxLabelPill}>
                    <Text style={styles.bboxLabelText} numberOfLines={1}>
                      {det.class_name} {det.confidence}%
                    </Text>
                  </View>
                </View>
              )
            })}

          {/* Toggle Bounding Boxes Button */}
          {bboxDetections.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowBoxes((v) => !v)}
              style={styles.bboxToggleBtn}
              activeOpacity={0.85}
            >
              {showBoxes ? (
                <Eye size={13} color="#ffffff" />
              ) : (
                <EyeOff size={13} color="#ffffff" />
              )}
              <Text style={styles.bboxToggleText}>
                {showBoxes
                  ? isKn
                    ? "ಬಾಕ್ಸ್ ಮರೆಮಾಡಿ"
                    : "Hide Boxes"
                  : isKn
                  ? "ಬಾಕ್ಸ್ ತೋರಿಸಿ"
                  : "Show Boxes"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Top Crop Badge */}
          <View style={styles.topCropPill}>
            <Text style={styles.topCropText}>{cropName}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.confidencePill,
                {
                  backgroundColor: isHealthy
                    ? "rgba(22, 101, 52, 0.95)"
                    : "rgba(185, 28, 28, 0.95)",
                },
              ]}
            >
              <CheckCircle2 size={13} color="#ffffff" />
              <Text style={styles.confidenceText}>
                {confidence}% {isKn ? "ಹೊಂದಾಣಿಕೆ" : "Match"}
              </Text>
            </View>
            <View
              style={[
                styles.severityPill,
                {
                  backgroundColor:
                    severity === "High" || severity === "Critical"
                      ? "rgba(220, 38, 38, 0.95)"
                      : severity === "Moderate"
                      ? "rgba(217, 119, 6, 0.95)"
                      : "rgba(22, 101, 52, 0.95)",
                },
              ]}
            >
              <Text style={styles.severityText}>
                {isHealthy
                  ? isKn
                    ? "ಸ್ಥಿತಿ: ಆರೋಗ್ಯಕರ"
                    : "Status: Healthy"
                  : isKn
                  ? `ತೀವ್ರತೆ: ${severity}`
                  : `Severity: ${severity}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Diagnosis Summary Card */}
        <View style={styles.titleCard}>
          <View style={styles.categoryChipRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{issueBadgeLabel()}</Text>
            </View>
            {diagnosis?.gemini_used && (
              <Text style={styles.engineLabel}>
                YOLO11s + Gemini Vision
              </Text>
            )}
          </View>

          <View style={styles.pestHeaderRow}>
            <Text style={styles.diseaseTitle}>{displayTitle}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isHealthy ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              {isHealthy ? (
                <ShieldCheck size={14} color="#15803d" />
              ) : (
                <AlertTriangle size={14} color="#dc2626" />
              )}
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isHealthy ? "#15803d" : "#dc2626" },
                ]}
              >
                {isHealthy
                  ? isKn
                    ? "ಆರೋಗ್ಯಕರ"
                    : "Healthy"
                  : isKn
                  ? "ಕ್ರಮ ಅಗತ್ಯ"
                  : "Action Needed"}
              </Text>
            </View>
          </View>

          {scientificName ? (
            <Text style={styles.scientificName}>{scientificName}</Text>
          ) : null}

          {/* 3-Column Metrics Strip */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricCell}>
              <Text style={styles.metricValue}>{severity}</Text>
              <Text style={styles.metricLabel}>
                {isKn ? "ತೀವ್ರತೆ" : "Severity"}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCell}>
              <Text style={styles.metricValue}>~{affectedPct}%</Text>
              <Text style={styles.metricLabel}>
                {isKn ? "ಬಾಧಿತ ಭಾಗ" : "Affected Area"}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCell}>
              <Text style={styles.metricValue}>{spreadRisk}</Text>
              <Text style={styles.metricLabel}>
                {isKn ? "ಹರಡುವ ಅಪಾಯ" : "Spread Risk"}
              </Text>
            </View>
          </View>

          <Text style={styles.aboutText}>{about}</Text>
        </View>

        {/* Action Shortcuts Row: Ask AI + All Detections */}
        <View style={styles.quickActionBar}>
          <TouchableOpacity
            onPress={handleAskAiFollowup}
            activeOpacity={0.85}
            style={styles.askAiBtn}
          >
            <Mic size={16} color="#ffffff" />
            <Text style={styles.askAiBtnText}>
              {isKn ? "AI ಸಹಾಯಕರನ್ನು ಕೇಳಿ" : "Ask Krushika AI"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              open("aiPredictions", { diagnosis, cropName, imageUri })
            }
            activeOpacity={0.85}
            style={styles.predictionsBtn}
          >
            <BarChart2 size={16} color="#256428" />
            <Text style={styles.predictionsBtnText}>
              {isKn ? "ಎಲ್ಲಾ ಪತ್ತೆಗಳು" : "All Detections"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Tabs (Treatment, Symptoms, Prevention) */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setTab("treatment")}
            style={[styles.tabBtn, tab === "treatment" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "treatment" && styles.tabBtnTextActive,
              ]}
            >
              {isKn ? "ಚಿಕಿತ್ಸೆ" : "Treatment"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("symptoms")}
            style={[styles.tabBtn, tab === "symptoms" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "symptoms" && styles.tabBtnTextActive,
              ]}
            >
              {isKn ? "ಲಕ್ಷಣಗಳು" : "Symptoms"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("prevention")}
            style={[styles.tabBtn, tab === "prevention" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "prevention" && styles.tabBtnTextActive,
              ]}
            >
              {isKn ? "ತಡೆಗಟ್ಟುವಿಕೆ" : "Prevention"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === "treatment" && (
          <View style={styles.sectionWrap}>
            {organic.length === 0 && chemical.length === 0 && (
              <View style={styles.remedyCard}>
                <Text style={styles.listText}>
                  {isKn
                    ? "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಚಿಕಿತ್ಸೆಯ ಅಗತ್ಯವಿಲ್ಲ. ನಿಯಮಿತ ನೀರಾವರಿ ಮತ್ತು ಸಮತೋಲಿತ ಪೋಷಕಾಂಶಗಳನ್ನು ಮುಂದುವರಿಸಿ."
                    : "No special treatment required right now. Continue regular field monitoring and balanced irrigation."}
                </Text>
              </View>
            )}

            {organic.length > 0 && (
              <View style={styles.remedyCard}>
                <View style={styles.remedyHeader}>
                  <Leaf size={18} color="#16a34a" />
                  <Text style={styles.remedyTitle}>
                    {isKn ? "ಸಾವಯವ / ಜೈವಿಕ ಪರಿಹಾರಗಳು" : "Organic / Bio Remedies"}
                  </Text>
                </View>
                {organic.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Text style={styles.bullet}>🌱</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {chemical.length > 0 && (
              <View style={styles.remedyCard}>
                <View style={styles.remedyHeader}>
                  <FlaskConical size={18} color="#2563eb" />
                  <Text style={styles.remedyTitle}>
                    {isKn ? "ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ ಮತ್ತು ಪ್ರಮಾಣ" : "Chemical Sprays & Dosages"}
                  </Text>
                </View>
                {chemical.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Text style={styles.bullet}>🧪</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
                {!isHealthy && (
                  <View style={styles.safetyBox}>
                    <Text style={styles.safetyText}>
                      ⚠️{" "}
                      {isKn
                        ? "ಸುರಕ್ಷತೆ: ಸಿಂಪಡಿಸುವಾಗ ಮಾಸ್ಕ್ ಮತ್ತು ಕೈಗವಸು ಧರಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಮತ್ತು ಕೊಯ್ಲು ಪೂರ್ವ ಅವಧಿಯನ್ನು ಪಾಲಿಸಿ."
                        : "Safety: Wear protective gloves/mask, spray during calm morning or evening hours, and follow pre-harvest waiting periods."}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {tab === "symptoms" && (
          <View style={styles.sectionWrap}>
            <View style={styles.remedyCard}>
              <Text style={[styles.remedyTitle, { marginBottom: 10 }]}>
                {isKn ? "ಗುರುತಿಸಲಾದ ಲಕ್ಷಣಗಳು" : "Identified Symptoms & Signs"}
              </Text>
              {symptoms.length === 0 ? (
                <Text style={styles.listText}>
                  {isKn
                    ? "ಎಲೆಗಳ ಮೇಲೆ ಗೋಚರ ರೋಗ ಅಥವಾ ಕೀಟ ಹಾನಿಯ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
                    : "No active pest damage or lesion symptoms were flagged on this sample."}
                </Text>
              ) : (
                symptoms.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {tab === "prevention" && (
          <View style={styles.sectionWrap}>
            <View style={styles.remedyCard}>
              <Text style={[styles.remedyTitle, { marginBottom: 10 }]}>
                {isKn ? "ದೀರ್ಘಕಾಲೀನ ತಡೆಗಟ್ಟುವಿಕೆ" : "Long-term Prevention Guidelines"}
              </Text>
              {prevention.length === 0 ? (
                <Text style={styles.listText}>
                  {isKn
                    ? "ಬೆಳೆ ಪರಿವರ್ತನೆ, ಶುದ್ಧ ಬೀಜಗಳ ಬಳಕೆ ಮತ್ತು ಹೊಲದ ನೈರ್ಮಲ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ."
                    : "Maintain clean field bunds, practice seasonal crop rotation, and inspect leaves weekly."}
                </Text>
              ) : (
                prevention.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Text style={styles.bullet}>✓</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Helpful Feedback Card */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackLabel}>
            {feedbackSent
              ? feedbackSent === "up"
                ? isKn
                  ? "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು ✓"
                  : "Thanks for confirming this diagnosis ✓"
                : isKn
                ? "ಧನ್ಯವಾದಗಳು — ನಿಖರತೆಯನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯವಾಗುತ್ತದೆ."
                : "Thanks — we'll use this to improve accuracy."
              : isKn
              ? "ಈ ರೋಗನಿರ್ಣಯ ಫಲಿತಾಂಶ ನಿಮಗೆ ಉಪಯುಕ್ತವಾಗಿತ್ತೇ?"
              : "Was this diagnosis helpful?"}
          </Text>
          {!feedbackSent && (
            <View style={styles.feedbackBtns}>
              <TouchableOpacity
                onPress={() => handleFeedback(true)}
                style={styles.feedbackBtn}
              >
                <ThumbsUp size={15} color="#15803d" />
                <Text style={styles.feedbackBtnText}>
                  {isKn ? "ಹೌದು" : "Yes"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFeedback(false)}
                style={styles.feedbackBtn}
              >
                <ThumbsDown size={15} color="#dc2626" />
                <Text style={styles.feedbackBtnText}>
                  {isKn ? "ಇಲ್ಲ" : "No"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Actions: Retake Scan */}
        <TouchableOpacity
          onPress={() => back()}
          activeOpacity={0.85}
          style={styles.retakeBtn}
        >
          <RotateCcw size={18} color="#ffffff" />
          <Text style={styles.retakeText}>
            {isKn ? "ಇನ್ನೊಂದು ಸಸ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" : "Scan Another Plant"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRightActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  imageCard: {
    height: 235,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0f172a",
    marginBottom: 14,
  },
  leafImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  bboxRect: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#facc15",
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    borderRadius: 6,
  },
  bboxLabelPill: {
    position: "absolute",
    top: -18,
    left: -2,
    backgroundColor: "#facc15",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    maxWidth: 180,
  },
  bboxLabelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  bboxToggleBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bboxToggleText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  topCropPill: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(22, 101, 52, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topCropText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  badgeRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confidencePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  titleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  engineLabel: {
    fontSize: 10.5,
    color: "#6b7280",
    fontWeight: "600",
  },
  pestHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  scientificName: {
    fontSize: 12.5,
    fontStyle: "italic",
    color: "#6b7280",
    marginTop: 4,
  },
  metricsStrip: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  metricCell: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  metricLabel: {
    fontSize: 10.5,
    color: "#6b7280",
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },
  aboutText: {
    fontSize: 13.5,
    color: "#374151",
    lineHeight: 20,
    marginTop: 12,
  },
  quickActionBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  askAiBtn: {
    flex: 1.2,
    backgroundColor: "#166534",
    borderRadius: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  askAiBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  predictionsBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#256428",
  },
  predictionsBtnText: {
    color: "#256428",
    fontSize: 13,
    fontWeight: "bold",
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabBtnTextActive: {
    color: "#256428",
    fontWeight: "bold",
  },
  sectionWrap: {
    gap: 12,
  },
  remedyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  remedyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  remedyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    marginTop: 1,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 19,
  },
  safetyBox: {
    marginTop: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  safetyText: {
    fontSize: 11.5,
    color: "#92400e",
    lineHeight: 17,
  },
  feedbackCard: {
    marginTop: 14,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  feedbackLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
  },
  feedbackBtns: {
    flexDirection: "row",
    gap: 8,
  },
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  feedbackBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  retakeBtn: {
    marginTop: 18,
    backgroundColor: "#256428",
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  retakeText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
