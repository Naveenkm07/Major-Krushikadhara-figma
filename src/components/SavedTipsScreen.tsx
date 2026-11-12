import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useLang } from "../i18n"
import { useSavedTips } from "../storage/savedTips"
import DetailShell from "./DetailShell"
import { Bookmark, Leaf, Droplets, Sun, Bug } from "lucide-react-native"

export default function SavedTipsScreen() {
  const { t, lang } = useLang()
  const { tips, removeTip } = useSavedTips()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={t.profile?.rows?.saved || (isKn ? "ಉಳಿಸಿದ ಸಲಹೆಗಳು" : "Saved Tips")}
      subtitle={
        isKn
          ? "ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿಗಳು"
          : "Your bookmarked farming guides & scan remedies"
      }
    >
      {tips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Bookmark size={36} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {isKn ? "ಯಾವುದೇ ಸಲಹೆಗಳನ್ನು ಉಳಿಸಿಲ್ಲ" : "No saved tips yet"}
          </Text>
          <Text style={styles.emptySub}>
            {isKn
              ? "ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶದ ಮೇಲಿನ ಬುಕ್‌ಮಾರ್ಕ್ ಒತ್ತಿ ಇಲ್ಲಿ ಉಳಿಸಿ."
              : "Tap the bookmark icon on any Crop Scan report to save it here."}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {tips.map((tip) => {
            const cat = (isKn ? tip.categoryKn : tip.categoryEn).toLowerCase()
            const Icon = cat.includes("irrigat") || cat.includes("ನೀರಾವರಿ")
              ? Droplets
              : cat.includes("pest") || cat.includes("ರೋಗ") || cat.includes("ಕೀಟ")
              ? Bug
              : cat.includes("sun")
              ? Sun
              : Leaf
            const bg = tip.isUserSaved
              ? "#dcfce7"
              : cat.includes("irrigat") || cat.includes("ನೀರಾವರಿ")
              ? "#dbeafe"
              : "#fef3c7"
            const color = tip.isUserSaved ? "#15803d" : "#256428"

            return (
              <View key={tip.id} style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                  <Icon size={20} color={color} />
                </View>
                <View style={styles.contentWrap}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>
                      {isKn ? tip.titleKn : tip.titleEn}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeTip(tip.id)}
                      style={styles.bookmarkBtn}
                    >
                      <Bookmark size={16} color="#256428" fill="#256428" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.categoryPill}>
                    {isKn ? tip.categoryKn : tip.categoryEn}
                  </Text>
                  <Text style={styles.body}>
                    {isKn ? tip.bodyKn : tip.bodyEn}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
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
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  bookmarkBtn: {
    padding: 4,
  },
  categoryPill: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
    marginTop: 2,
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 6,
  },
})
