import { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native"
import { useNav } from "../nav"
import { useProfile } from "../profile"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { ChevronRight, ScanLine, Search, Trash2 } from "lucide-react-native"
import {
  getScanHistory,
  removeScanFromHistory,
  subscribeScanHistory,
  syncScanHistoryFromBackend,
  type ScanHistoryItem,
} from "../storage/scanHistory"

type HistoryFilter = "all" | "issue" | "healthy"

export default function ScanHistoryScreen() {
  const { open, back } = useNav()
  const { profile, refreshProfile } = useProfile()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const [items, setItems] = useState<ScanHistoryItem[]>(getScanHistory())
  const [filter, setFilter] = useState<HistoryFilter>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    syncScanHistoryFromBackend(profile.mobile).catch(() => {})
    return subscribeScanHistory((updated) => setItems(updated))
  }, [profile.mobile])

  const counts = useMemo(() => {
    const healthy = items.filter((i) => i.status === "healthy").length
    const issue = items.length - healthy
    return { total: items.length, issue, healthy }
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === "healthy" && item.status !== "healthy") return false
      if (filter === "issue" && item.status !== "pest") return false
      if (!q) return true
      return (
        item.crop.toLowerCase().includes(q) ||
        item.pest.toLowerCase().includes(q) ||
        (item.pestKn || "").toLowerCase().includes(q)
      )
    })
  }, [items, filter, search])

  function confirmDelete(item: ScanHistoryItem) {
    Alert.alert(
      isKn ? "ಸ್ಕ್ಯಾನ್ ಅಳಿಸಿ" : "Delete Scan",
      isKn
        ? `ಈ ${item.crop} ಸ್ಕ್ಯಾನ್ ವರದಿಯನ್ನು ಅಳಿಸಬೇಕೇ?`
        : `Remove this ${item.crop} scan from your history?`,
      [
        { text: isKn ? "ರದ್ದು" : "Cancel", style: "cancel" },
        {
          text: isKn ? "ಅಳಿಸಿ" : "Delete",
          style: "destructive",
          onPress: async () => {
            await removeScanFromHistory(item.id, profile.mobile)
            refreshProfile(profile.mobile).catch(() => {})
          },
        },
      ]
    )
  }

  return (
    <DetailShell
      title={isKn ? "ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ" : "Scan History"}
      subtitle={
        isKn
          ? `${counts.total} ತಪಾಸಣೆಗಳು · ${counts.issue} ಸಮಸ್ಯೆ · ${counts.healthy} ಆರೋಗ್ಯಕರ`
          : `${counts.total} scans · ${counts.issue} issues · ${counts.healthy} healthy`
      }
    >
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <ScanLine size={38} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {isKn ? "ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ" : "No crop scans yet"}
          </Text>
          <Text style={styles.emptySub}>
            {isKn
              ? "ನಿಮ್ಮ ಮೊದಲ ಎಲೆಯ ಫೋಟೋ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ನಂತರ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ."
              : "Your AI crop disease inspections will appear here after your first scan."}
          </Text>
          <TouchableOpacity onPress={back} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>
              {isKn ? "ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ತೆರೆಯಿರಿ" : "Go Back & Scan Crop"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={16} color="#6b7280" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={
                isKn ? "ಬೆಳೆ ಅಥವಾ ಕೀಟ ಹುಡುಕಿ..." : "Search crop or diagnosis..."
              }
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {(
              [
                { id: "all", labelEn: `All (${counts.total})`, labelKn: `ಎಲ್ಲಾ (${counts.total})` },
                { id: "issue", labelEn: `Issues (${counts.issue})`, labelKn: `ಸಮಸ್ಯೆ (${counts.issue})` },
                { id: "healthy", labelEn: `Healthy (${counts.healthy})`, labelKn: `ಆರೋಗ್ಯ (${counts.healthy})` },
              ] as const
            ).map((f) => {
              const active = filter === f.id
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFilter(f.id)}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {isKn ? f.labelKn : f.labelEn}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {isKn ? "ಯಾವುದೇ ಹೊಂದುವ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ" : "No scans match this filter"}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => {
                const isHealthy = item.status === "healthy"
                return (
                  <View key={item.id} style={styles.card}>
                    <TouchableOpacity
                      onPress={() =>
                        open("scanResult", {
                          diagnosis: item.diagnosis,
                          imageUri: item.imageUrl,
                          cropName: item.crop,
                        })
                      }
                      activeOpacity={0.85}
                      style={styles.cardMainTap}
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
                              numberOfLines={1}
                              style={
                                isHealthy ? styles.badgeTextGreen : styles.badgeTextAmber
                              }
                            >
                              {isKn && item.pestKn ? item.pestKn : item.pest}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.date}>{item.date}</Text>
                        <Text style={styles.confidence}>
                          {isKn ? "ನಿಖರತೆ" : "Confidence"}: {item.confidence}%
                        </Text>
                      </View>
                      <ChevronRight size={18} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDelete(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                )
              })}
            </View>
          )}
        </>
      )}
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#111827",
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  filterPillActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: "#256428",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
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
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMainTap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumb: {
    width: 58,
    height: 58,
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
    gap: 6,
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
    maxWidth: 140,
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
  deleteBtn: {
    padding: 4,
  },
})
