import { View, Text, StyleSheet } from "react-native"
import DetailShell from "./DetailShell"
import { Cpu, Eye, Sparkles, Database } from "lucide-react-native"

export default function HowAiWorksScreen() {
  return (
    <DetailShell
      title="How AI Works"
      subtitle="Computer Vision & Agronomy Deep Learning"
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Cpu size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>Plant Pathology Neural Network</Text>
        <Text style={styles.desc}>
          KrushikaDhara utilizes Convolutional Neural Networks (CNN) fine-tuned on ICAR and agricultural university datasets to classify leaf lesions, chlorosis, fungal spore patterns, and pest bites.
        </Text>
      </View>

      <View style={styles.stepsCard}>
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Leaf Region Extraction</Text>
            <Text style={styles.stepDesc}>Segments healthy leaf tissue from background soil/debris.</Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Feature Classification</Text>
            <Text style={styles.stepDesc}>Extracts lesion patterns, halo coloration, and necrotic spots.</Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Remedy Generation</Text>
            <Text style={styles.stepDesc}>Provides dosage recommendations from agricultural handbooks.</Text>
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

