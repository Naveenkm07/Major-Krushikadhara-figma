import { View, Text, StyleSheet } from "react-native"
import DetailShell from "./DetailShell"
import { Smartphone, Layers, Server, Shield } from "lucide-react-native"

export default function TechnicalArchScreen() {
  return (
    <DetailShell
      title="Technical Architecture"
      subtitle="React Native + Local Cache + Cloud AI Pipeline"
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Layers size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>System Topology</Text>
        <Text style={styles.desc}>
          Built on React Native (Expo) with responsive native rendering, multilingual i18n localization, and fault-tolerant state persistence.
        </Text>
      </View>

      <View style={styles.layersList}>
        <View style={styles.layerCard}>
          <Text style={styles.layerTag}>Client Layer</Text>
          <Text style={styles.layerTitle}>React Native Mobile App</Text>
          <Text style={styles.layerDesc}>Multiplatform mobile UI, Native camera integration, Offline cache</Text>
        </View>

        <View style={styles.layerCard}>
          <Text style={styles.layerTag}>State & Localization</Text>
          <Text style={styles.layerTitle}>Context Architecture</Text>
          <Text style={styles.layerDesc}>Typed Stack Navigator, Dual English/Kannada dictionaries, Equipment & Insurance Stores</Text>
        </View>

        <View style={styles.layerCard}>
          <Text style={styles.layerTag}>Integration Layer</Text>
          <Text style={styles.layerTitle}>Government & Mandi APIs</Text>
          <Text style={styles.layerDesc}>Agmarknet APMC live rates, PMFBY claim workflow, OpenWeather agricultural forecast</Text>
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
  layersList: {
    gap: 12,
    marginBottom: 30,
  },
  layerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  layerTag: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#256428",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  layerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  layerDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 18,
  },
})

