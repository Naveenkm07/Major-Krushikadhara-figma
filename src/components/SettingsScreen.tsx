import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import { useAppSettings } from "../storage/appSettings"
import DetailShell from "./DetailShell"
import { Bell, Globe, Shield, Smartphone, Cpu, Info, ChevronRight } from "lucide-react-native"

export default function SettingsScreen() {
  const { open } = useNav()
  const { lang, t } = useLang()
  const { settings, updateSettings } = useAppSettings()
  const s = t.x.coreA.settings

  return (
    <DetailShell title={t.x.coreA.home.settingsAria} subtitle={s.subtitle}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{s.preferences}</Text>

        <TouchableOpacity
          onPress={() => open("language")}
          style={[styles.row, styles.firstRow]}
        >
          <View style={styles.rowLeft}>
            <Globe size={18} color="#256428" />
            <Text style={styles.rowLabel}>{s.language}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowHint}>{lang === "kn" ? "ಕನ್ನಡ" : "English"}</Text>
            <ChevronRight size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Bell size={18} color="#256428" />
            <View>
              <Text style={styles.rowLabel}>{s.notifications}</Text>
              <Text style={styles.rowSub}>
                {settings.notificationsOn ? s.notifOn : s.notifOff}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsOn}
            onValueChange={(v) => updateSettings({ notificationsOn: v })}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={settings.notificationsOn ? "#256428" : "#f3f4f6"}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Smartphone size={18} color="#256428" />
            <View>
              <Text style={styles.rowLabel}>{s.offlineMode}</Text>
              <Text style={styles.rowSub}>
                {settings.offlineModeOn ? s.offlineOn : s.offlineOff}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.offlineModeOn}
            onValueChange={(v) => updateSettings({ offlineModeOn: v })}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={settings.offlineModeOn ? "#256428" : "#f3f4f6"}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{s.aiData}</Text>

        <TouchableOpacity
          onPress={() => open("howAiWorks")}
          style={[styles.row, styles.firstRow]}
        >
          <View style={styles.rowLeft}>
            <Cpu size={18} color="#256428" />
            <View>
              <Text style={styles.rowLabel}>{s.howAi}</Text>
              <Text style={styles.rowSub}>{settings.modelVersion}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("offlineMode")}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Shield size={18} color="#256428" />
            <View>
              <Text style={styles.rowLabel}>{s.offlineData}</Text>
              <Text style={styles.rowSub}>
                {settings.cacheSizeMb} · {settings.lastSyncDate}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("technicalArch")}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Smartphone size={18} color="#256428" />
            <View>
              <Text style={styles.rowLabel}>{s.techArch}</Text>
              <Text style={styles.rowSub}>{s.techArchSub}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("about")}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Info size={18} color="#256428" />
            <View>
              <Text style={styles.rowLabel}>{s.aboutApp}</Text>
              <Text style={styles.rowSub}>{s.aboutSub}</Text>
            </View>
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
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  firstRow: {
    borderTopWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  rowSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
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
