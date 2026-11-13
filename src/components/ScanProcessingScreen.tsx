import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useNav } from "../nav"
import { useProfile } from "../profile"
import { useLang } from "../i18n"
import { Cpu, AlertTriangle } from "lucide-react-native"
import { diagnoseCropImage, type PestDetectionResult, type ScanMode } from "../api/scan"
import { addScanToHistory } from "../storage/scanHistory"
import { AnimatedProgressFill, FadeSlideIn, PulseHalo, ScalePressable } from "./Motion"

const STEPS_EN = [
  "Uploading crop image securely...",
  "Running AI crop insect & pest check...",
  "Inspecting leaf disease & nutrient health...",
  "Preparing English & Kannada treatment dosages...",
  "Saving report to your farm history...",
]

const STEPS_KN = [
  "ಬೆಳೆ ಚಿತ್ರವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
  "AI ಕೀಟ ಮತ್ತು ರೋಗ ತಪಾಸಣೆ...",
  "ಎಲೆ ರೋಗ ಮತ್ತು ಪೋಷಕಾಂಶ ಪರೀಕ್ಷೆ...",
  "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಚಿಕಿತ್ಸಾ ಪ್ರಮಾಣ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
  "ನಿಮ್ಮ ಜಮೀನಿನ ಇತಿಹಾಸಕ್ಕೆ ವರದಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
]

export default function ScanProcessingScreen() {
  const { back, open, params } = useNav()
  const { profile, refreshProfile } = useProfile()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const STEPS = isKn ? STEPS_KN : STEPS_EN
  const [stepIdx, setStepIdx] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const imageUri: string | undefined = params?.imageUri
  const scanMode: ScanMode =
    params?.mode === "crop" || params?.mode === "leaf" ? params.mode : "pest"
  const cropChoice: string = params?.cropName || profile.crops?.[0] || "Auto"

  useEffect(() => {
    let isMounted = true
    let navTimer: ReturnType<typeof setTimeout> | null = null

    const interval = setInterval(() => {
      setStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 1100)

    async function runScan() {
      if (!imageUri) {
        if (isMounted) {
          setErrorMsg(
            isKn ? "ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಯಾವುದೇ ಚಿತ್ರ ಆಯ್ಕೆಯಾಗಿಲ್ಲ." : "No image selected for scanning."
          )
        }
        return
      }

      try {
        const result: PestDetectionResult = await diagnoseCropImage(imageUri, {
          mobile: profile.mobile,
          cropName: cropChoice,
          mode: scanMode,
          language: lang,
        })
        if (!isMounted) return

        clearInterval(interval)
        setStepIdx(STEPS.length - 1)

        const resolvedCrop =
          result.detected_crop && result.detected_crop !== "Auto"
            ? result.detected_crop
            : cropChoice !== "Auto"
            ? cropChoice
            : "Crop Leaf"
        const finalUri = result.imageUrl || imageUri

        // Route non-plant images or very uncertain results to dedicated LowConfidence guidance screen
        if (result.is_plant === false || (result.low_confidence && !result.healthy)) {
          navTimer = setTimeout(() => {
            if (!isMounted) return
            back()
            open("lowConfidence", {
              diagnosis: result,
              imageUri: finalUri,
              cropName: resolvedCrop,
              mode: scanMode,
            })
          }, 350)
          return
        }

        // Persist into in-memory store & update farmer scan count
        addScanToHistory(result, finalUri, resolvedCrop)
        refreshProfile(profile.mobile).catch(() => {})

        navTimer = setTimeout(() => {
          if (!isMounted) return
          back()
          open("scanResult", {
            diagnosis: result,
            imageUri: finalUri,
            cropName: resolvedCrop,
            mode: scanMode,
          })
        }, 400)
      } catch (err: any) {
        console.error("Diagnosis error:", err)
        if (isMounted) {
          clearInterval(interval)
          setErrorMsg(
            err?.message ||
              (isKn
                ? "ಚಿತ್ರ ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಬ್ಯಾಕೆಂಡ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಪರಿಶೀಲಿಸಿ."
                : "Failed to analyze image. Please check backend connection.")
          )
        }
      }
    }

    runScan()

    return () => {
      isMounted = false
      clearInterval(interval)
      if (navTimer) clearTimeout(navTimer)
    }
  }, [imageUri])

  const progress = Math.round(((stepIdx + 1) / STEPS.length) * 100)

  return (
    <View style={styles.container}>
      <FadeSlideIn delay={40} style={styles.centerBox}>
        <View style={styles.circleStage}>
          {!errorMsg && (
            <>
              <PulseHalo size={126} color="#4ade80" active delay={0} />
              <PulseHalo size={126} color="#86efac" active delay={750} />
            </>
          )}
          <View style={styles.circleWrap}>
            {errorMsg ? (
              <AlertTriangle size={56} color="#ef4444" />
            ) : (
              <>
                <Cpu size={56} color="#4ade80" />
                <ActivityIndicator
                  size="large"
                  color="#4ade80"
                  style={styles.spinner}
                />
              </>
            )}
          </View>
        </View>

        {errorMsg ? (
          <>
            <Text style={[styles.statusTitle, { color: "#f87171" }]}>
              {isKn ? "ರೋಗನಿರ್ಣಯ ವಿಫಲವಾಗಿದೆ" : "Diagnosis Failed"}
            </Text>
            <Text style={styles.stepText}>{errorMsg}</Text>
            <ScalePressable onPress={() => back()} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>
                {isKn ? "ಹಿಂದೆ ಹೋಗಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Go Back & Try Again"}
              </Text>
            </ScalePressable>
          </>
        ) : (
          <>
            <Text style={styles.percentageText}>{progress}%</Text>
            <Text style={styles.statusTitle}>
              {isKn ? "AI ಬೆಳೆ ತಪಾಸಣೆ" : "AI Crop Inspection"}
            </Text>
            <Text style={styles.modeTag}>
              {scanMode === "leaf"
                ? isKn
                  ? "ಎಲೆ ರೋಗ ಮೋಡ್"
                  : "Leaf Disease Mode"
                : scanMode === "crop"
                ? isKn
                  ? "ಬೆಳೆ ಆರೋಗ್ಯ ಮೋಡ್"
                  : "Crop Health Mode"
                : isKn
                ? "ಕೀಟ ಪತ್ತೆ ಮೋಡ್"
                : "Pest Detection Mode"}
              {cropChoice !== "Auto" ? ` · ${cropChoice}` : ""}
            </Text>
            <Text style={styles.stepText}>{STEPS[stepIdx]}</Text>

            <View style={styles.progressBar}>
              <AnimatedProgressFill pct={progress} color="#4ade80" duration={520} />
            </View>
          </>
        )}
      </FadeSlideIn>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#165922",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 100,
  },
  centerBox: {
    alignItems: "center",
    width: "100%",
  },
  circleStage: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  circleWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  spinner: {
    position: "absolute",
    width: 140,
    height: 140,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f6efd8",
    marginTop: 8,
  },
  modeTag: {
    fontSize: 12,
    fontWeight: "600",
    color: "#86efac",
    marginTop: 4,
  },
  stepText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginTop: 10,
    minHeight: 38,
    lineHeight: 19,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginTop: 22,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 4,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
})
