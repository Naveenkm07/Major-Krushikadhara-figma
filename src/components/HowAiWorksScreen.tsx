import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Cpu } from "lucide-react-native"

export default function HowAiWorksScreen() {
  const { lang, t } = useLang()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={t.x.coreA.settings.howAi}
      subtitle={
        isKn
          ? "YOLO11s TFLite + Gemini ಕೃಷಿ ತಜ್ಞ"
          : "Computer Vision & Agronomy AI Pipeline"
      }
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Cpu size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>
          {isKn
            ? "YOLO11s ಕೀಟ ಪತ್ತೆ ನರಮಂಡಲ (Neural Network)"
            : "YOLO11s Pest Pathology Pipeline"}
        </Text>
        <Text style={styles.desc}>
          {isKn
            ? "ಕೃಷಿಕಧಾರಾ 102 ಕೃಷಿ ಕೀಟ ವರ್ಗಗಳ ಮೇಲೆ ತರಬೇತಿ ಪಡೆದ YOLO11s TensorFlow Lite ಮಾದರಿಯನ್ನು ಬಳಸುತ್ತದೆ. EXIF ಓರಿಯಂಟೇಶನ್ ಸರಿಪಡಿಸಿ ಮತ್ತು ಆಸ್ಪೆಕ್ಟ್ ಅನುಪಾತ ಲೆಟರ್‌ಬಾಕ್ಸಿಂಗ್ ಮೂಲಕ ನಿಖರವಾಗಿ ಕೀಟಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ."
            : "KrushikaDhara runs a quantized YOLO11s TensorFlow Lite model trained across 102 pest species with EXIF orientation normalization and aspect-preserving letterboxing for high field accuracy."}
        </Text>
      </View>

      <View style={styles.stepsCard}>
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>
              {isKn ? "ಚಿತ್ರದ ಪ್ರಮಾಣೀಕರಣ (EXIF & Letterbox)" : "Image Normalization (EXIF & Letterbox)"}
            </Text>
            <Text style={styles.stepDesc}>
              {isKn
                ? "ಫೋನ್ ಕ್ಯಾಮೆರಾ ದಿಕ್ಕನ್ನು ಸರಿಪಡಿಸಿ 640×640 RGB ಇನ್‌ಪುಟ್ ತಯಾರಿಸುತ್ತದೆ."
                : "Corrects mobile camera rotation metadata and pads leaves to 640×640 without distortion."}
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>
              {isKn ? "102-ವರ್ಗ ಕೀಟ ಪತ್ತೆ (TFLite NMS)" : "102-Class Inference & NMS"}
            </Text>
            <Text style={styles.stepDesc}>
              {isKn
                ? "ವಿಶ್ವಾಸಾರ್ಹತೆಯೊಂದಿಗೆ ಕೀಟದ ಹೆಸರು, ಸಂಖ್ಯೆ ಮತ್ತು ತೀವ್ರತೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ."
                : "Identifies insect species, bounding detections, confidence score, and infestation severity."}
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>
              {isKn ? "Gemini ಕೃಷಿ ಚಿಕಿತ್ಸಾ ಸಲಹೆ" : "Remedy & Dosage Generation"}
            </Text>
            <Text style={styles.stepDesc}>
              {isKn
                ? "ಪ್ರತಿ ಲೀಟರ್ ಪ್ರಮಾಣದೊಂದಿಗೆ ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಗಳನ್ನು ನೀಡುತ್ತದೆ."
                : "Generates organic and chemical sprays with exact ml/L or g/L field dosages and offline fallback."}
            </Text>
          </View>
        </View>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  desc: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 6,
  },
  stepsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 30,
  },
  step: {
    flexDirection: "row",
    gap: 14,
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#15803d",
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  stepDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    lineHeight: 17,
  },
})
