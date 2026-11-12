import { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang, fmt } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import {
  getScanHistory,
  subscribeScanHistory,
} from "../storage/scanHistory"
import { useAppSettings } from "../storage/appSettings"
import {
  Pencil,
  MapPin,
  Ruler,
  Sprout,
  ScanLine,
  CalendarClock,
  Languages,
  Bell,
  Bookmark,
  ShieldCheck,
  CircleHelp,
  Info,
  LogOut,
  ChevronRight,
  Settings,
  Mic,
  WifiOff,
  Tractor,
} from "lucide-react-native"

type Row = {
  label: string
  icon: typeof Languages
  hint?: string
  danger?: boolean
  onClick?: () => void
  isToggle?: boolean
  toggleValue?: boolean
  onToggle?: () => void
}

export default function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const { t, lang } = useLang()
  const { profile, scansCount } = useProfile()
  const { open } = useNav()
  const insets = useSafeAreaInsets()
  const { settings, updateSettings } = useAppSettings()
  const [historyLen, setHistoryLen] = useState(() => getScanHistory().length)

  useEffect(() => {
    setHistoryLen(getScanHistory().length)
    return subscribeScanHistory((items) => setHistoryLen(items.length))
  }, [])

  const x = t.x.coreA
  const cropMap = (x.crops as Record<string, string>) || {}
  const cropName = (c: string) => cropMap[c] ?? c
  const location = profile.district ? `${profile.district}, ${profile.state}` : profile.state
  const totalScans = Math.max(historyLen, scansCount)
  const displayName =
    lang === "kn" ? profile.nameKn || profile.name : profile.name

  const farmStats = [
    { label: t.profile.stats.scans, value: String(totalScans), icon: ScanLine },
    { label: t.profile.stats.crops, value: String(profile.crops.length), icon: Sprout },
    { label: t.profile.stats.years, value: String(profile.experience), icon: CalendarClock },
  ]

  const farmRows: Row[] = [
    { label: t.profile.myFarm, icon: Tractor, onClick: () => open("myFarm") },
    { label: x.profile?.scanHistory || "Scan History", icon: ScanLine, onClick: () => open("scanHistory") },
    { label: t.profile.rows.insurance, icon: ShieldCheck, onClick: () => open("insurance") },
  ]

  const preferences: Row[] = [
    {
      label: t.profile.rows.language,
      icon: Languages,
      hint: lang === "kn" ? "ಕನ್ನಡ" : "English",
      onClick: () => open("language"),
    },
    {
      label: t.profile.rows.notifications,
      icon: Bell,
      isToggle: true,
      toggleValue: settings.notificationsOn,
      onToggle: () => updateSettings({ notificationsOn: !settings.notificationsOn }),
    },
    { label: t.profile.rows.saved, icon: Bookmark, onClick: () => open("saved") },
    { label: x.home.settingsAria, icon: Settings, onClick: () => open("settings") },
    { label: x.home.voiceAi, icon: Mic, onClick: () => open("voiceAssistant") },
    { label: x.settings.offlineMode, icon: WifiOff, onClick: () => open("offlineMode") },
  ]

  const support: Row[] = [
    { label: t.profile.rows.help, icon: CircleHelp, onClick: () => open("help") },
    { label: t.profile.rows.about, icon: Info, onClick: () => open("about") },
    { label: t.profile.rows.logout, icon: LogOut, danger: true, onClick: onLogout },
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + 10, 44),
            },
          ]}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{t.profile.title}</Text>
            <TouchableOpacity
              onPress={() => open("editProfile")}
              activeOpacity={0.8}
              style={styles.editBtn}
            >
              <Pencil size={14} color="#ffffff" />
              <Text style={styles.editBtnText}>{t.profile.edit}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: profile.photoUrl }} style={styles.avatarImg} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.farmerName}>{displayName}</Text>
              <View style={styles.locRow}>
                <MapPin size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locText}>{location}</Text>
              </View>
            </View>
          </View>

          {/* Farm Stats Row */}
          <View style={styles.statsRow}>
            {farmStats.map((st, i) => (
              <View key={i} style={styles.statCol}>
                <Text style={styles.statValue}>{st.value}</Text>
                <Text style={styles.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Farm Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.profile.myFarm}</Text>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Ruler size={16} color="#256428" />
              <Text style={styles.detailLabel}>{t.profile.farm.size}</Text>
              <Text style={styles.detailValue}>
                {fmt(x.common.acresValue, { size: profile.farmSize })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Sprout size={16} color="#256428" />
              <Text style={styles.detailLabel}>{t.profile.farm.crops}</Text>
              <Text style={styles.detailValue}>
                {profile.crops.map(cropName).join(", ")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={16} color="#256428" />
              <Text style={styles.detailLabel}>{t.profile.farm.location}</Text>
              <Text style={styles.detailValue}>{location}</Text>
            </View>
          </View>
        </View>

        {/* Farm Menu Items */}
        <View style={styles.sectionCard}>
          {farmRows.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              onPress={r.onClick}
              activeOpacity={0.7}
              style={[
                styles.menuItem,
                i > 0 && styles.menuItemBorder,
              ]}
            >
              <View style={styles.menuLeft}>
                <r.icon size={18} color="#256428" />
                <Text style={styles.menuLabel}>{r.label}</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.profile.preferences}</Text>
          {preferences.map((r, i) => (
            <View
              key={r.label}
              style={[
                styles.menuItem,
                i > 0 && styles.menuItemBorder,
              ]}
            >
              <TouchableOpacity
                onPress={r.onClick}
                disabled={r.isToggle}
                style={styles.menuLeft}
              >
                <r.icon size={18} color="#256428" />
                <Text style={styles.menuLabel}>{r.label}</Text>
              </TouchableOpacity>

              {r.isToggle ? (
                <Switch
                  value={r.toggleValue}
                  onValueChange={r.onToggle}
                  trackColor={{ false: "#d1d5db", true: "#86efac" }}
                  thumbColor={r.toggleValue ? "#256428" : "#f3f4f6"}
                />
              ) : (
                <TouchableOpacity onPress={r.onClick} style={styles.menuRight}>
                  {r.hint ? <Text style={styles.menuHint}>{r.hint}</Text> : null}
                  <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Support & Logout */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.profile.support}</Text>
          {support.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              onPress={r.onClick}
              activeOpacity={0.7}
              style={[
                styles.menuItem,
                i > 0 && styles.menuItemBorder,
              ]}
            >
              <View style={styles.menuLeft}>
                <r.icon size={18} color={r.danger ? "#dc2626" : "#256428"} />
                <Text
                  style={[
                    styles.menuLabel,
                    r.danger && styles.menuLabelDanger,
                  ]}
                >
                  {r.label}
                </Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Version Footer */}
        <Text style={styles.versionFooter}>{t.profile.version}</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  scrollContent: {
    paddingBottom: 36,
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 14,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 16,
    paddingVertical: 12,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  detailsList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  menuLabelDanger: {
    color: "#dc2626",
  },
  menuHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  versionFooter: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 20,
  },
})
