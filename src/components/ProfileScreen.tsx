import { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang, fmt } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import { clearAuthToken, maskPhone } from "../auth"
import {
  getScanHistory,
  subscribeScanHistory,
} from "../storage/scanHistory"
import { useSavedTips } from "../storage/savedTips"
import { useAppSettings } from "../storage/appSettings"
import { useNotifications } from "../storage/notifications"
import { FadeSlideIn, ScalePressable } from "./Motion"
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
  Camera,
  Share2,
  Droplets,
  CheckCircle2,
  Phone,
  BellRing,
} from "lucide-react-native"

let ImagePicker: any = null
try {
  ImagePicker = require("expo-image-picker")
} catch {}

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
  const { profile, scansCount, uploadAvatar } = useProfile()
  const { open } = useNav()
  const insets = useSafeAreaInsets()
  const isKn = lang === "kn"
  const { settings, updateSettings } = useAppSettings()
  const { tips } = useSavedTips()
  const { unreadCount } = useNotifications(profile.district, profile.crops)
  const [historyLen, setHistoryLen] = useState(() => getScanHistory().length)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    setHistoryLen(getScanHistory().length)
    return subscribeScanHistory((items) => setHistoryLen(items.length))
  }, [])

  const x = t.x.coreA
  const cropMap = (x.crops as Record<string, string>) || {}
  const cropName = (c: string) => cropMap[c] ?? c
  const location = [profile.village, profile.taluk, profile.district, profile.state]
    .filter(Boolean)
    .join(", ")
  const totalScans = Math.max(historyLen, scansCount)
  const displayName =
    isKn ? profile.nameKn || profile.name : profile.name

  async function pickAvatar(source: "camera" | "gallery") {
    if (!ImagePicker) {
      Alert.alert("Avatar", "Image picker is unavailable on this build.")
      return
    }
    try {
      const perm =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm?.granted) {
        Alert.alert(
          isKn ? "ಅನುಮತಿ ಅಗತ್ಯವಿದೆ" : "Permission Required",
          isKn
            ? "ಪ್ರೊಫೈಲ್ ಫೋಟೋ ಬದಲಿಸಲು ಕ್ಯಾಮೆರಾ/ಗ್ಯಾಲರಿ ಅನುಮತಿ ನೀಡಿ."
            : "Please grant camera or gallery permission to update your photo."
        )
        return
      }
      const res =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.75,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions?.Images || ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.75,
            })

      if (res.canceled || !res.assets?.[0]?.uri) return
      setUploadingPhoto(true)
      await uploadAvatar(res.assets[0].uri)
    } catch (err: any) {
      Alert.alert(
        isKn ? "ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ" : "Photo Upload Failed",
        err?.message ||
          (isKn
            ? "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
            : "Could not upload profile photo. Check connection.")
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  function handleChangePhoto() {
    Alert.alert(
      x.editProfile.changePhotoAria,
      x.editProfile.photoHint,
      [
        { text: isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera", onPress: () => pickAvatar("camera") },
        { text: isKn ? "ಗ್ಯಾಲರಿ" : "Gallery", onPress: () => pickAvatar("gallery") },
        { text: x.editProfile.cancel, style: "cancel" },
      ]
    )
  }

  async function handleShareFarmCard() {
    const cropsText = profile.crops.map(cropName).join(", ")
    const message = isKn
      ? `🌾 ಕೃಷಿಕಧಾರಾ ರೈತ ಕಾರ್ಡ್\nಹೆಸರು: ${displayName}\nಸ್ಥಳ: ${location}\nಜಮೀನು: ${profile.farmSize} ಎಕರೆ (${profile.soilType} · ${profile.irrigationType})\nಬೆಳೆಗಳು: ${cropsText}\nಅನುಭವ: ${profile.experience} ವರ್ಷಗಳು`
      : `🌾 KrushikaDhara Farmer Card\nFarmer: ${displayName}\nLocation: ${location}\nFarm Area: ${profile.farmSize} acres (${profile.soilType} · ${profile.irrigationType})\nActive Crops: ${cropsText}\nExperience: ${profile.experience} yrs`
    try {
      await Share.share({ message })
    } catch {}
  }

  function handleConfirmLogout() {
    Alert.alert(
      t.profile.rows.logout,
      isKn
        ? "ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಲಾಗ್ ಔಟ್ ಆಗಲು ಖಚಿತವಾಗಿ ಬಯಸುತ್ತೀರಾ?"
        : "Are you sure you want to log out of KrushikaDhara?",
      [
        { text: x.editProfile.cancel, style: "cancel" },
        {
          text: t.profile.rows.logout,
          style: "destructive",
          onPress: () => {
            clearAuthToken()
            onLogout()
          },
        },
      ]
    )
  }

  const farmStats = [
    { label: t.profile.stats.scans, value: String(totalScans), icon: ScanLine },
    { label: t.profile.stats.crops, value: String(profile.crops.length), icon: Sprout },
    { label: t.profile.stats.years, value: String(profile.experience), icon: CalendarClock },
  ]

  const farmRows: Row[] = [
    {
      label: t.profile.myFarm,
      icon: Tractor,
      hint: `${profile.cropFields.length || profile.crops.length} ${isKn ? "ಬೆಳೆಗಳು" : "plots"}`,
      onClick: () => open("myFarm"),
    },
    {
      label: x.profile?.scanHistory || "Scan History",
      icon: ScanLine,
      hint: String(totalScans),
      onClick: () => open("scanHistory"),
    },
    {
      label: isKn ? "ಅಧಿಸೂಚನೆಗಳ ಪಟ್ಟಿ" : "Notifications Inbox",
      icon: BellRing,
      hint: unreadCount > 0 ? `${unreadCount} ${isKn ? "ಹೊಸ" : "new"}` : undefined,
      onClick: () => open("notifications"),
    },
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
    {
      label: t.profile.rows.saved,
      icon: Bookmark,
      hint: String(tips.length),
      onClick: () => open("saved"),
    },
    { label: x.home.settingsAria, icon: Settings, onClick: () => open("settings") },
    { label: x.home.voiceAi, icon: Mic, onClick: () => open("voiceAssistant") },
    {
      label: x.settings.offlineMode,
      icon: WifiOff,
      hint: settings.lastSyncStatus === "synced" ? (isKn ? "ಸಿಂಕ್ ಆಗಿದೆ" : "Synced") : undefined,
      onClick: () => open("offlineMode"),
    },
  ]

  const support: Row[] = [
    { label: t.profile.rows.help, icon: CircleHelp, onClick: () => open("help") },
    { label: t.profile.rows.about, icon: Info, onClick: () => open("about") },
    { label: x.settings.privacy, icon: ShieldCheck, onClick: () => open("privacyPolicy") },
    { label: t.profile.rows.logout, icon: LogOut, danger: true, onClick: handleConfirmLogout },
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
            <View style={styles.headerBtnRow}>
              <TouchableOpacity
                onPress={handleShareFarmCard}
                activeOpacity={0.8}
                style={styles.iconPillBtn}
              >
                <Share2 size={14} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => open("editProfile")}
                activeOpacity={0.8}
                style={styles.editBtn}
              >
                <Pencil size={14} color="#ffffff" />
                <Text style={styles.editBtnText}>{t.profile.edit}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileCard}>
            <TouchableOpacity
              onPress={handleChangePhoto}
              activeOpacity={0.85}
              style={styles.avatarContainer}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: profile.photoUrl }} style={styles.avatarImg} />
                {uploadingPhoto ? (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                ) : null}
              </View>
              <View style={styles.cameraBadge}>
                <Camera size={12} color="#256428" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.farmerName} numberOfLines={1}>
                  {displayName}
                </Text>
                {profile.rtcVerified ? (
                  <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={11} color="#bbf7d0" />
                    <Text style={styles.verifiedText}>RTC</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.locRow}>
                <MapPin size={12} color="rgba(255,255,255,0.75)" />
                <Text style={styles.locText} numberOfLines={1}>
                  {profile.district}, {profile.state}
                </Text>
              </View>
              <View style={styles.locRow}>
                <Phone size={11} color="rgba(255,255,255,0.75)" />
                <Text style={styles.locText}>
                  +91 {maskPhone(profile.mobile)}
                  {profile.email ? ` · ${profile.email}` : ""}
                </Text>
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
        <FadeSlideIn delay={40}>
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>{t.profile.myFarm}</Text>
            <TouchableOpacity onPress={() => open("myFarm")}>
              <Text style={styles.manageLink}>
                {isKn ? "ನಿರ್ವಹಿಸಿ →" : "Manage →"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Ruler size={16} color="#256428" />
              <Text style={styles.detailLabel}>{t.profile.farm.size}</Text>
              <Text style={styles.detailValue}>
                {fmt(x.common.acresValue, { size: profile.farmSize })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Droplets size={16} color="#256428" />
              <Text style={styles.detailLabel}>
                {isKn ? "ಮಣ್ಣು ಮತ್ತು ನೀರಾವರಿ" : "Soil & Irrigation"}
              </Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {profile.soilType} · {profile.irrigationType}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Sprout size={16} color="#256428" />
              <Text style={styles.detailLabel}>{t.profile.farm.crops}</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {profile.crops.map(cropName).join(", ")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={16} color="#256428" />
              <Text style={styles.detailLabel}>{t.profile.farm.location}</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
        </View>
        </FadeSlideIn>

        {/* Farm Menu Items */}
        <FadeSlideIn delay={90}>
        <View style={styles.sectionCard}>
          {farmRows.map((r, i) => (
            <ScalePressable
              key={r.label}
              onPress={r.onClick}
              scaleTo={0.985}
              style={[
                styles.menuItem,
                i > 0 && styles.menuItemBorder,
              ]}
            >
              <View style={styles.menuLeft}>
                <r.icon size={18} color="#256428" />
                <Text style={styles.menuLabel}>{r.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {r.hint ? <Text style={styles.menuHint}>{r.hint}</Text> : null}
                <ChevronRight size={18} color="#9ca3af" />
              </View>
            </ScalePressable>
          ))}
        </View>
        </FadeSlideIn>

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
  headerBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconPillBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
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
  avatarContainer: {
    position: "relative",
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.65)",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#bbf7d0",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    flexShrink: 1,
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
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  manageLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#256428",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
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
    minWidth: 100,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    textAlign: "right",
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
    fontWeight: "600",
  },
  versionFooter: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 20,
  },
})
