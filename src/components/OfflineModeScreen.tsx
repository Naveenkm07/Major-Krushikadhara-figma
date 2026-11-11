import { View, Text, StyleSheet } from "react-native"
import DetailShell from "./DetailShell"
import { WifiOff, Database, CheckCircle2 } from "lucide-react-native"

export default function OfflineModeScreen() {
  return (
    <DetailShell
      title="Offline Mode"
      subtitle="Full utility without cellular or internet connectivity"
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <WifiOff size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>Offline First Architecture</Text>
        <Text style={styles.desc}>
          In remote farmlands with poor network reception, KrushikaDhara operates reliably.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What works offline:</Text>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>Save crop scan photos for later auto-diagnosis</Text>
        </View>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>Access pre-downloaded chemical & organic remedies</Text>
        </View>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>View your farm records, crop calendar & saved tips</Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  itemText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
})

