import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import type { PestDetectionResult } from "../api/scan"
import { AlertCircle, Camera, BarChart2, Cpu, Mic, CheckCircle2 } from "lucide-react-native"

/* 1. AI Analysis Screen */
export function AIAnalysisScreen() {
  const { lang } = useLang()
  const { params } = useNav()
  const isKn = lang === "kn"
  const diagnosis: PestDetectionResult | undefined = params?.diagnosis

  return (
    <DetailShell
      title={isKn ? "AI ಆಳ ವಿಶ್ಲೇಷಣೆ" : "AI Analysis Deep Dive"}
      subtitle={isKn ? "YOLO11s + Gemini Vision ವಿಶ್ಲೇಷಣೆ" : "Hybrid Vision Feature Breakdown"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "YOLO11s + Gemini Vision ಪೈಪ್‌ಲೈನ್" : "YOLO11s + Gemini Vision Pipeline"}
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? "102 ಕೀಟ ವರ್ಗಗಳಿಗಾಗಿ 640×640 ಲೆಟರ್‌ಬಾಕ್ಸ್ TFLite ಮಾದರಿ ಮತ್ತು ಎಲೆ ರೋಗ/ಪೋಷಕಾಂಶ ಕೊರತೆಗಾಗಿ Gemini Vision ಮೂಲಕ ಚಿತ್ರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ."
            : "Analyzed via 640×640 letterboxed YOLO11s TFLite (102 insect classes) combined with Gemini Multimodal Vision plant pathology."}
        </Text>
        {diagnosis && (
          <Text style={[styles.bodyText, { marginTop: 10, fontWeight: "600", color: "#15803d" }]}>
            {isKn ? "ಪತ್ತೆಯಾದ ಬೆಳೆ" : "Detected Crop"}: {diagnosis.detected_crop || "Crop Leaf"} ·{" "}
            {diagnosis.confidence}%
          </Text>
        )}
      </View>
    </DetailShell>
  )
}

/* 2. Diagnosis Confirmation Screen */
export function DiagnosisResultScreen() {
  const { lang } = useLang()
  const { params, open } = useNav()
  const isKn = lang === "kn"
  const diagnosis: PestDetectionResult | undefined = params?.diagnosis
  const title = diagnosis
    ? diagnosis.healthy
      ? isKn
        ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ"
        : "Healthy Crop"
      : isKn
      ? diagnosis.pest_name_kn || diagnosis.pest_name
      : diagnosis.pest_name
    : isKn
    ? "ತಪಾಸಣೆ ಪೂರ್ಣ"
    : "Inspection Complete"

  return (
    <DetailShell title={isKn ? "ರೋಗನಿರ್ಣಯ ದೃಢೀಕರಣ" : "Diagnosis Confirmation"}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {diagnosis && (
          <Text style={styles.bodyText}>
            {isKn ? "ನಿಖರತೆ" : "Confidence"}: {diagnosis.confidence}% ·{" "}
            {diagnosis.scientific_name || "—"}
          </Text>
        )}
        {diagnosis && (
          <TouchableOpacity
            onPress={() => open("scanResult", params)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {isKn ? "ಪೂರ್ಣ ವರದಿ ತೆರೆಯಿರಿ" : "Open Full Report"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </DetailShell>
  )
}

/* 3. Low Confidence / Non-Crop Image Screen */
export function LowConfidenceScreen() {
  const { back, open, params } = useNav()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const diagnosis: PestDetectionResult | undefined = params?.diagnosis
  const imageUri: string | undefined = params?.imageUri
  const isNonCrop = diagnosis?.is_plant === false
  const conf = diagnosis?.confidence ?? 0

  const tips = isKn
    ? [
        "ಎಲೆಯಿಂದ 15–20 ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಸ್ಥಿರವಾಗಿ ಹಿಡಿಯಿರಿ",
        "ಉತ್ತಮ ನೈಸರ್ಗಿಕ ಹಗಲು ಬೆಳಕಿನಲ್ಲಿ ತೆಗೆಯಿರಿ — ನೇರ ಪ್ರಜ್ವಲಿಸುವ ಬಿಸಿಲು ತಪ್ಪಿಸಿ",
        "ಸೋಂಕಿತ ಎಲೆ ಅಥವಾ ಕೀಟವು ಚೌಕಟ್ಟಿನ ಮಧ್ಯದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ",
        "ಚಿತ್ರ ತೆಗೆಯುವ ಮೊದಲು ಕ್ಯಾಮೆರಾ ಲೆನ್ಸ್ ಸ್ವಚ್ಛಗೊಳಿಸಿ",
      ]
    : [
        "Hold camera steady 15–20 cm from a single affected leaf",
        "Move to bright daylight and avoid harsh glare or shadow",
        "Keep the leaf spots or pest clearly centered in frame",
        "Wipe the camera lens clean before retaking the photo",
      ]

  const headline = isNonCrop
    ? isKn
      ? "ಬೆಳೆ ಅಥವಾ ಎಲೆಯ ಚಿತ್ರ ಕಂಡುಬಂದಿಲ್ಲ"
      : "Not a Crop or Leaf Photo"
    : diagnosis?.image_quality_issue === "blurry"
    ? isKn
      ? "ಚಿತ್ರ ಮಸುಕಾಗಿದೆ — ದಯವಿಟ್ಟು ಮತ್ತೆ ತೆಗೆಯಿರಿ"
      : "Photo Appears Blurry — Please Retake"
    : diagnosis?.image_quality_issue === "dark"
    ? isKn
      ? "ಬೆಳಕು ಕಡಿಮೆ ಇದೆ — ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ತೆಗೆಯಿರಿ"
      : "Photo Too Dark — Retake in Brighter Light"
    : isKn
    ? `ಕಡಿಮೆ ನಿಖರತೆ (${conf}%) — ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ`
    : `Low Confidence Match (${conf}%)`

  return (
    <DetailShell
      title={isKn ? "ಸ್ಪಷ್ಟ ಚಿತ್ರ ಅಗತ್ಯ" : "Clearer Photo Needed"}
      subtitle={
        isNonCrop
          ? isKn
            ? "ದಯವಿಟ್ಟು ಬೆಳೆಯ ಎಲೆ ಅಥವಾ ಕೀಟದ ಫೋಟೋ ತೆಗೆಯಿರಿ"
            : "Please capture a plant leaf, crop, or pest"
          : isKn
          ? "ಉತ್ತಮ ನಿಖರತೆಗಾಗಿ ಚಿತ್ರ ಮರುಪರಿಶೀಲಿಸಿ"
          : "Retake for a reliable AI diagnosis"
      }
    >
      {imageUri ? (
        <View style={styles.thumbWrap}>
          <Image source={{ uri: imageUri }} style={styles.previewThumb} />
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.alertHeadRow}>
          <AlertCircle size={28} color="#d97706" />
          <Text style={[styles.cardTitle, { flex: 1 }]}>{headline}</Text>
        </View>
        <Text style={[styles.bodyText, { marginTop: 8 }]}>
          {isKn
            ? diagnosis?.message_kn || diagnosis?.about_kn || diagnosis?.about
            : diagnosis?.message || diagnosis?.about}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಉತ್ತಮ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಸಲಹೆಗಳು" : "Tips for Accurate Scan"}
        </Text>
        <View style={{ marginTop: 8, gap: 6 }}>
          {tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <CheckCircle2 size={14} color="#16a34a" />
              <Text style={[styles.bodyText, { marginTop: 0, flex: 1 }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      {diagnosis && !isNonCrop && (
        <TouchableOpacity
          onPress={() => open("scanResult", params)}
          style={styles.secondaryBtn}
        >
          <BarChart2 size={16} color="#256428" />
          <Text style={styles.secondaryBtnText}>
            {isKn ? "ಲಭ್ಯವಿರುವ ವರದಿ ನೋಡಿ" : "View Tentative Report Anyway"}
          </Text>
        </TouchableOpacity>
      )}

      {isNonCrop && (
        <TouchableOpacity
          onPress={() =>
            open("voiceAssistant", {
              initialPrompt: isKn
                ? "ನನ್ನ ಬೆಳೆಯ ಎಲೆಗಳ ಮೇಲಿನ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಸಹಾಯ ಮಾಡಿ."
                : "Help me diagnose symptoms on my crop leaves.",
            })
          }
          style={styles.secondaryBtn}
        >
          <Mic size={16} color="#256428" />
          <Text style={styles.secondaryBtnText}>
            {isKn ? "ಬದಲಾಗಿ AI ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Ask Krushika AI by Voice/Text"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => back()} style={styles.btn}>
        <Camera size={17} color="#ffffff" />
        <Text style={styles.btnText}>
          {isKn ? "ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ" : "Retake Crop Photo"}
        </Text>
      </TouchableOpacity>
    </DetailShell>
  )
}

/* 4. Live Ranked AI Detections Screen */
export function AiPredictionsScreen() {
  const { lang } = useLang()
  const { params } = useNav()
  const isKn = lang === "kn"
  const diagnosis: PestDetectionResult | undefined = params?.diagnosis
  const detections = diagnosis?.all_detections || []

  return (
    <DetailShell
      title={isKn ? "AI ಪತ್ತೆ ಶ್ರೇಣಿ" : "AI Detection Breakdown"}
      subtitle={
        isKn
          ? "YOLO11s + Gemini Vision ಫಲಿತಾಂಶಗಳು"
          : "YOLO11s + Gemini Vision confidence scores"
      }
    >
      <View style={styles.card}>
        <View style={styles.alertHeadRow}>
          <Cpu size={20} color="#256428" />
          <Text style={styles.cardTitle}>
            {isKn ? "ಮಾಡಲ್ ಎಂಜಿನ್ ಮಾಹಿತಿ" : "Active Diagnostic Models"}
          </Text>
        </View>
        <Text style={[styles.bodyText, { marginTop: 6 }]}>
          {isKn
            ? "• YOLO11s TFLite: 640×640 ಇನ್‌ಪುಟ್ · 102 ಕೀಟ ವರ್ಗಗಳು (ಬಾಕ್ಸ್ ಪತ್ತೆ)\n• Gemini Multimodal Vision: ಎಲೆ ರೋಗ, ಶಿಲೀಂಧ್ರ, ವೈರಲ್ ಮತ್ತು ಪೋಷಕಾಂಶ ವಿಶ್ಲೇಷಣೆ"
            : "• YOLO11s TFLite: 640×640 input · 102 insect species with bounding boxes\n• Gemini Multimodal Vision: Foliar fungal/bacterial/viral & nutrient analysis"}
        </Text>
      </View>

      {detections.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {diagnosis?.healthy
              ? isKn
                ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ — ಯಾವುದೇ ಕೀಟ ಪತ್ತೆಯಾಗಿಲ್ಲ"
                : "Healthy Crop — Zero Pest Detections"
              : isKn
              ? "ಪತ್ತೆಯಾದ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ"
              : "No bounding detections recorded"}
          </Text>
          <Text style={styles.bodyText}>
            {isKn
              ? diagnosis?.about_kn || diagnosis?.about || "ಯಾವುದೇ ಕೀಟ ಬಾಧೆ ಕಂಡುಬಂದಿಲ್ಲ."
              : diagnosis?.about || "No insect detections exceeded the 22% threshold."}
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>
            {isKn ? "ಶ್ರೇಣೀಕೃತ ಪತ್ತೆಗಳು" : "Ranked Candidate Matches"} ({detections.length})
          </Text>
          {detections.map((det, idx) => (
            <View key={`${det.class_name}_${idx}`} style={styles.detRow}>
              <View style={styles.detTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detName}>
                    #{idx + 1} {det.class_name}
                  </Text>
                  <Text style={styles.detSource}>
                    {det.source === "gemini_vision"
                      ? "Gemini Vision Pathology"
                      : `YOLO11s Class #${det.class_id}`}
                  </Text>
                </View>
                <Text style={styles.detPct}>{det.confidence}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, Math.max(4, det.confidence))}%`,
                      backgroundColor: idx === 0 ? "#16a34a" : "#f59e0b",
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  thumbWrap: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#e5e7eb",
  },
  previewThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  bodyText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 4,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#256428",
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#256428",
  },
  btn: {
    backgroundColor: "#256428",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  detRow: {
    marginBottom: 14,
  },
  detTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  detName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  detSource: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  detPct: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#256428",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
})
