import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { CloudRain, Bug, Droplets, TrendingUp, Landmark } from "lucide-react-native"

const NOTIFS = [
  {
    icon: CloudRain,
    bg: "#dbeafe",
    color: "#2563eb",
    title: "Heavy Rain Expected",
    desc: "Weather forecast predicts heavy rainfall in Mandya on Thursday. Ensure proper field drainage.",
    time: "2 hours ago",
    unread: true,
  },
  {
    icon: Bug,
    bg: "#fee2e2",
    color: "#dc2626",
    title: "Pest Warning in your Taluk",
    desc: "Yellow stem borer attacks reported in nearby paddy fields. Monitor crops closely.",
    time: "5 hours ago",
    unread: true,
  },
  {
    icon: Droplets,
    bg: "#ccfbf1",
    color: "#0d9488",
    title: "Optimal Irrigation Window",
    desc: "Soil moisture is at 42%. Schedule drip irrigation between 6:00 AM and 8:00 AM.",
    time: "8 hours ago",
    unread: false,
  },
  {
    icon: TrendingUp,
    bg: "#ffedd5",
    color: "#ea580c",
    title: "Mandi Price Surge",
    desc: "Tomato rates in Mandya APMC increased by 4% to ₹28/kg.",
    time: "Yesterday",
    unread: false,
  },
  {
    icon: Landmark,
    bg: "#f3e8ff",
    color: "#9333ea",
    title: "PM-KISAN Installment Released",
    desc: "17th installment of ₹2,000 has been credited to registered farmer bank accounts.",
    time: "2 days ago",
    unread: false,
  },
]

export default function NotificationsScreen() {
  const { t } = useLang()
  return (
    <DetailShell
      title={t.profile?.rows?.notifications || "Notifications"}
      subtitle="Farming alerts, weather updates & mandi rates"
    >
      <View style={styles.list}>
        {NOTIFS.map((n, idx) => (
          <View
            key={idx}
            style={[
              styles.card,
              n.unread && styles.cardUnread,
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: n.bg }]}>
              <n.icon size={20} color={n.color} />
            </View>
            <View style={styles.infoWrap}>
              <View style={styles.topRow}>
                <Text style={styles.title}>{n.title}</Text>
                {n.unread && <View style={styles.dot} />}
              </View>
              <Text style={styles.desc}>{n.desc}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </View>
        ))}
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

