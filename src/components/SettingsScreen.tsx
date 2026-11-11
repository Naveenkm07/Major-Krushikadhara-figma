import { useState } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import { Bell, Moon, Globe, Shield, Smartphone, ChevronRight } from "lucide-react-native"

export default function SettingsScreen() {
  const { open } = useNav()
  const { lang } = useLang()
  const [pushNotifs, setPushNotifs] = useState(true)
  const [offlineSync, setOfflineSync] = useState(true)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <DetailShell title="Settings" subtitle="App preferences & storage">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity
          onPress={() => open("language")}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Globe size={18} color="#256428" />
            <Text style={styles.rowLabel}>App Language</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowHint}>{lang === "kn" ? "ಕನ್ನಡ" : "English"}</Text>
            <ChevronRight size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Bell size={18} color="#256428" />
            <Text style={styles.rowLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={pushNotifs}
            onValueChange={setPushNotifs}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={pushNotifs ? "#256428" : "#f3f4f6"}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Smartphone size={18} color="#256428" />
            <Text style={styles.rowLabel}>Offline Model Cache</Text>
          </View>
          <Switch
            value={offlineSync}
            onValueChange={setOfflineSync}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={offlineSync ? "#256428" : "#f3f4f6"}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Information & System</Text>

        <TouchableOpacity
          onPress={() => open("offlineMode")}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Shield size={18} color="#256428" />
            <Text style={styles.rowLabel}>Offline Mode Guide</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("technicalArch")}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Smartphone size={18} color="#256428" />
            <Text style={styles.rowLabel}>Technical Architecture</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowHint: {
    fontSize: 13,
    color: "#6b7280",
  },
})

