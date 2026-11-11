import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import { ChevronRight } from "lucide-react-native"
import { getScanHistory, subscribeScanHistory, type ScanHistoryItem } from "../storage/scanHistory"

export default function ScanHistoryScreen() {
  const { open } = useNav()
  const [items, setItems] = useState<ScanHistoryItem[]>(getScanHistory())

  useEffect(() => {
    return subscribeScanHistory((updated) => setItems(updated))
  }, [])

  return (
    <DetailShell
      title="Scan History"
      subtitle="Past crop leaf health inspections"
    >
      <View style={styles.list}>
        {items.map((item) => {
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
              activeOpacity={0.85}
              style={styles.card}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.cropTitle}>{item.crop}</Text>
                  <View
                    style={[
                      styles.badge,
                      isHealthy ? styles.badgeGreen : styles.badgeAmber,
                    ]}
                  >
                    <Text
                      style={
                        isHealthy ? styles.badgeTextGreen : styles.badgeTextAmber
                      }
                    >
                      {item.pest}
                    </Text>
                  </View>
                </View>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.confidence}>Confidence: {item.confidence}%</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" />
            </TouchableOpacity>
          )
        })}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
  },
  badgeTextGreen: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#15803d",
  },
  badgeAmber: {
    backgroundColor: "#fee2e2",
  },
  badgeTextAmber: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc2626",
  },
  date: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  confidence: {
    fontSize: 11,
    fontWeight: "600",
    color: "#256428",
    marginTop: 2,
  },
})
