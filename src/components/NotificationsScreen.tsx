import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import { useNotifications, type NotificationKind } from "../storage/notifications"
import DetailShell from "./DetailShell"
import {
  CloudRain,
  Bug,
  Droplets,
  TrendingUp,
  Landmark,
  CheckCheck,
} from "lucide-react-native"

const KIND_STYLES: Record<
  NotificationKind,
  { icon: typeof CloudRain; bg: string; color: string }
> = {
  weather: { icon: CloudRain, bg: "#dbeafe", color: "#2563eb" },
  pest: { icon: Bug, bg: "#fee2e2", color: "#dc2626" },
  irrigation: { icon: Droplets, bg: "#ccfbf1", color: "#0d9488" },
  market: { icon: TrendingUp, bg: "#ffedd5", color: "#ea580c" },
  scheme: { icon: Landmark, bg: "#f3e8ff", color: "#9333ea" },
}

export default function NotificationsScreen() {
  const { t, lang } = useLang()
  const { profile } = useProfile()
  const { open } = useNav()
  const isKn = lang === "kn"
  const { items, unreadCount, markRead, markAllRead } = useNotifications(
    profile.district,
    profile.crops
  )

  return (
    <DetailShell
      title={t.profile?.rows?.notifications || (isKn ? "ಸೂಚನೆಗಳು" : "Notifications")}
      subtitle={
        isKn
          ? `${profile.district} · ಕೃಷಿ, ಹವಾಮಾನ ಮತ್ತು ಮಂಡಿ ಎಚ್ಚರಿಕೆಗಳು`
          : `${profile.district} · Farming alerts, weather & mandi updates`
      }
      action={
        unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <CheckCheck size={14} color="#256428" />
            <Text style={styles.markAllText}>
              {isKn ? "ಎಲ್ಲಾ ಓದಿದೆ" : "Mark all"}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      <View style={styles.list}>
        {items.map((n) => {
          const vis = KIND_STYLES[n.kind]
          const Icon = vis.icon
          return (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.8}
              onPress={() => {
                markRead(n.id)
                open(n.route as any)
              }}
              style={[styles.card, !n.read && styles.cardUnread]}
            >
              <View style={[styles.iconWrap, { backgroundColor: vis.bg }]}>
                <Icon size={20} color={vis.color} />
              </View>
              <View style={styles.infoWrap}>
                <View style={styles.topRow}>
                  <Text style={styles.title}>
                    {isKn ? n.titleKn : n.titleEn}
                  </Text>
                  {!n.read ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.desc}>{isKn ? n.bodyKn : n.bodyEn}</Text>
                <Text style={styles.time}>{isKn ? n.agoKn : n.agoEn}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#256428",
  },
  list: {
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: "#256428",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  infoWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#256428",
  },
  desc: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 6,
  },
})
