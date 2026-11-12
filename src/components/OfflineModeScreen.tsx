import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useEquipment } from "../equipment"
import { useInsurance } from "../insurance"
import { API_BASE } from "../api/config"
import { markCloudSyncedNow, useAppSettings } from "../storage/appSettings"
import { syncScanHistoryFromBackend, getScanHistory } from "../storage/scanHistory"
import { syncSavedTipsFromBackend, useSavedTips } from "../storage/savedTips"
import DetailShell from "./DetailShell"
import { WifiOff, CheckCircle2, RefreshCw, Cloud } from "lucide-react-native"

export default function OfflineModeScreen() {
  const { lang, t } = useLang()
  const { profile, scansCount, refreshProfile } = useProfile()
  const { mine, rentals, refreshEquipment } = useEquipment()
  const { refreshInsurance } = useInsurance()
  const { settings } = useAppSettings()
  const { tips } = useSavedTips()
  const isKn = lang === "kn"

  const [syncing, setSyncing] = useState(false)
  const localScans = getScanHistory().length
  const totalScans = Math.max(localScans, scansCount)

  async function handleSyncNow() {
    setSyncing(true)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 7000)
      const healthRes = await fetch(`${API_BASE}/health`, { signal: controller.signal })
      clearTimeout(timer)

      if (!healthRes.ok) {
        throw new Error(`HTTP ${healthRes.status}`)
      }

      await Promise.all([
        refreshProfile(profile.mobile),
        syncScanHistoryFromBackend(profile.mobile),
        syncSavedTipsFromBackend(profile.mobile),
        refreshEquipment({ silent: true }),
        refreshInsurance(),
      ])
      markCloudSyncedNow()
      Alert.alert(
        isKn ? "ಕ್ಲೌಡ್ ಸಿಂಕ್ ಪೂರ್ಣ" : "Cloud Sync Complete",
        isKn
          ? "ಪ್ರೊಫೈಲ್, ಜಮೀನು ಪ್ಲಾಟ್‌ಗಳು, ಯಂತ್ರ ಬಾಡಿಗೆ, ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ ಮತ್ತು ಸಲಹೆಗಳು ನವೀಕರಿಸಲ್ಪಟ್ಟಿವೆ."
          : "Profile, crop plots, equipment rentals, scan history, and saved tips are synced with the backend."
      )
    } catch {
      Alert.alert(
        isKn ? "ಆಫ್‌ಲೈನ್ ಮೋಡ್" : "Server Unreachable",
        isKn
          ? "ಸರ್ವರ್ ಸಂಪರ್ಕವಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಡೇಟಾ ಸಾಧನದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿದೆ."
          : "Could not reach backend server. Your active records remain accessible locally."
      )
    } finally {
      setSyncing(false)
    }
  }

  return (
    <DetailShell
      title={t.x.coreA.settings.offlineMode}
      subtitle={
        isKn
          ? "ಕಡಿಮೆ ನೆಟ್‌ವರ್ಕ್ ಇರುವ ಪ್ರದೇಶಗಳಲ್ಲೂ ಉಪಯುಕ್ತ"
          : "Graceful fallback & cloud sync for farmland areas"
      }
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <WifiOff size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>
          {isKn ? "ಆಫ್‌ಲೈನ್-ಮೊದಲ ಮತ್ತು ಕ್ಲೌಡ್ ಸಿಂಕ್" : "Offline-Resilient + Cloud Sync"}
        </Text>
        <Text style={styles.desc}>
          {isKn
            ? `ಇಂಟರ್ನೆಟ್ ಸಿಗದ ಹೊಲಗಳಲ್ಲೂ ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರ, ಸ್ಕ್ಯಾನ್ ವರದಿಗಳು ಮತ್ತು ಸಲಹೆಗಳು ಲಭ್ಯವಿರುತ್ತವೆ. ಕೊನೆಯ ಸಿಂಕ್: ${settings.lastSyncDate}`
            : `Your active farm plots, scan remedies, and scheme checklists stay available on device when reception drops. Last sync: ${settings.lastSyncDate}`}
        </Text>

        <View style={styles.syncStatsRow}>
          <View style={styles.syncStatBox}>
            <Text style={styles.syncStatNum}>{totalScans}</Text>
            <Text style={styles.syncStatLbl}>{isKn ? "ಸ್ಕ್ಯಾನ್‌ಗಳು" : "Scans"}</Text>
          </View>
          <View style={styles.syncStatBox}>
            <Text style={styles.syncStatNum}>{tips.length}</Text>
            <Text style={styles.syncStatLbl}>{isKn ? "ಸಲಹೆಗಳು" : "Saved Tips"}</Text>
          </View>
          <View style={styles.syncStatBox}>
            <Text style={styles.syncStatNum}>{profile.crops.length}</Text>
            <Text style={styles.syncStatLbl}>{isKn ? "ಬೆಳೆಗಳು" : "Plots"}</Text>
          </View>
          <View style={styles.syncStatBox}>
            <Text style={styles.syncStatNum}>{mine.length + rentals.length}</Text>
            <Text style={styles.syncStatLbl}>{isKn ? "ಬಾಡಿಗೆ" : "Rentals"}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSyncNow}
          disabled={syncing}
          activeOpacity={0.85}
          style={[styles.syncBtn, syncing && { opacity: 0.7 }]}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <RefreshCw size={16} color="#ffffff" />
          )}
          <Text style={styles.syncBtnText}>
            {syncing
              ? isKn
                ? "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ..."
                : "Syncing with Cloud..."
              : isKn
              ? "ಈಗ ಕ್ಲೌಡ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ"
              : "Sync Now with Cloud"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {isKn ? "ಸಿಂಕ್ ಆಗುವ ಮತ್ತು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿರುವ ಸೇವೆಗಳು:" : "Synced & Offline Capabilities:"}
        </Text>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>
            {isKn
              ? "ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ ಮತ್ತು ಸಾವಯವ/ರಾಸಾಯನಿಕ ಪರಿಹಾರಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
              : "Review saved scan diagnoses and organic & chemical dosage remedies"}
          </Text>
        </View>
        <View style={styles.item}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.itemText}>
            {isKn
              ? "ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರಗಳು, ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ಬುಕ್‌ಮಾರ್ಕ್ ಸಲಹೆಗಳನ್ನು ನೋಡಿ"
              : "View your farm records, active crop calendar stage & saved tips"}
          </Text>
        </View>
        <View style={styles.item}>
          <Cloud size={16} color="#2563eb" />
          <Text style={styles.itemText}>
            {isKn
              ? "ನೆಟ್‌ವರ್ಕ್ ಬಂದ ತಕ್ಷಣ Neon PostgreSQL & Cloudinary ಗೆ ಸ್ವಯಂಚಾಲಿತ ಸಿಂಕ್"
              : "Automatic cloud sync to Neon PostgreSQL & Cloudinary when online"}
          </Text>
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
  syncStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  syncStatBox: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  syncStatNum: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#256428",
  },
  syncStatLbl: {
    fontSize: 11,
    color: "#4b5563",
    marginTop: 2,
  },
  syncBtn: {
    backgroundColor: "#256428",
    borderRadius: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  syncBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
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
