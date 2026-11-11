import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useNav } from "../nav"
import { Cpu, AlertTriangle } from "lucide-react-native"
import { diagnoseCropImage, type PestDetectionResult } from "../api/scan"
import { addScanToHistory } from "../storage/scanHistory"

const STEPS = [
  "Uploading image to cloud storage...",
  "Preprocessing crop image for YOLO11s...",
  "Running TFLite deep learning inference...",
  "Analyzing 102 pest & insect classes...",
  "Formulating treatment & remedies...",
]

export default function ScanProcessingScreen() {
  const { back, open, params } = useNav()
  const [stepIdx, setStepIdx] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const imageUri = params?.imageUri

  useEffect(() => {
    let isMounted = true

    // Step progress interval simulation
    const interval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1200)

    // Call real backend diagnose API
    async function runScan() {
      if (!imageUri) {
        if (isMounted) setErrorMsg("No image selected for scanning.")
        return
      }

      try {
        const result: PestDetectionResult = await diagnoseCropImage(imageUri)
        if (!isMounted) return

        clearInterval(interval)

        // Save into scan history store
        addScanToHistory(result, imageUri)

        // Transition to ScanResultScreen with real diagnosis data
        // Use timeout to allow state updates and clear stack
        setTimeout(() => {
          back()
          open("scanResult", {
            diagnosis: result,
            imageUri: result.imageUrl || imageUri,
          })
        }, 500)
      } catch (err: any) {
        console.error("Diagnosis error:", err)
        if (isMounted) {
          clearInterval(interval)
          setErrorMsg(err?.message || "Failed to analyze image. Please ensure backend is running.")
        }
      }
    }

    runScan()

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [imageUri])

  const progress = Math.round(((stepIdx + 1) / STEPS.length) * 100)

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        {/* Animated AI processing circle */}
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

        {errorMsg ? (
          <>
            <Text style={[styles.statusTitle, { color: "#f87171" }]}>
              Diagnosis Failed
            </Text>
            <Text style={styles.stepText}>{errorMsg}</Text>
            <Text
              onPress={() => back()}
              style={[
                styles.stepText,
                { color: "#ffffff", textDecorationLine: "underline", marginTop: 20 },
              ]}
            >
              Go Back & Try Again
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.percentageText}>{progress}%</Text>
            <Text style={styles.statusTitle}>Crop Pest Diagnosis</Text>
            <Text style={styles.stepText}>{STEPS[stepIdx]}</Text>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </>
        )}
      </View>
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
  stepText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
    minHeight: 36,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginTop: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 4,
  },
})
