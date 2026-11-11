import { View, Text, StyleSheet } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Bookmark, Leaf, Droplets, Sun, Bug } from "lucide-react-native"

const SAVED = [
  {
    icon: Droplets,
    title: "Irrigation Reminder",
    body: "Check soil moisture before irrigating. Over-watering damages root aeration and triggers fungal root rot.",
    date: "Saved Sep 20",
    bg: "#dbeafe",
    color: "#2563eb",
  },
  {
    icon: Sun,
    title: "Favorable Spray Window",
    body: "Clear skies for 3 days — good time for foliar spraying operations without rain wash-off risks.",
    date: "Saved Sep 18",
    bg: "#fef3c7",
    color: "#d97706",
  },
  {
    icon: Bug,
    title: "Pest Management Tip",
    body: "Yellow stem borer activity reported. Install pheromone traps at 5 per acre for monitoring and mass trapping.",
    date: "Saved Sep 15",
    bg: "#fee2e2",
    color: "#dc2626",
  },
  {
    icon: Leaf,
    title: "Nutrient Deficiencies",
    body: "Yellowing of older lower leaves indicates Nitrogen deficiency. Apply urea top-dressing after light irrigation.",
    date: "Saved Sep 10",
    bg: "#dcfce7",
    color: "#16a34a",
  },
]

export default function SavedTipsScreen() {
  const { t } = useLang()
  return (
    <DetailShell
      title={t.profile?.rows?.saved || "Saved Tips"}
      subtitle="Your bookmarked farming guides & agronomy advice"
    >
      <View style={styles.list}>
        {SAVED.map((tip, idx) => (
          <View key={idx} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: tip.bg }]}>
              <tip.icon size={20} color={tip.color} />
            </View>
            <View style={styles.contentWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{tip.title}</Text>
                <Bookmark size={16} color="#256428" fill="#256428" />
              </View>
              <Text style={styles.body}>{tip.body}</Text>
              <Text style={styles.date}>{tip.date}</Text>
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
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 8,
  },
})

