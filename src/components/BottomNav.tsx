import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Home, ScanLine, BarChart3, Landmark, User } from "lucide-react-native"
import { useLang } from "../i18n"

export type Tab = "home" | "scan" | "insights" | "schemes" | "profile"

const items: { id: Tab; icon: typeof Home }[] = [
  { id: "home", icon: Home },
  { id: "scan", icon: ScanLine },
  { id: "insights", icon: BarChart3 },
  { id: "schemes", icon: Landmark },
  { id: "profile", icon: User },
]

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  const { t } = useLang()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.nav,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {items.map(({ id, icon: Icon }) => {
        const isActive = active === id
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onChange(id)}
            activeOpacity={0.7}
            style={styles.tabButton}
          >
            {id === "scan" ? (
              <View style={styles.scanPill}>
                <Icon size={24} color="#ffffff" />
              </View>
            ) : (
              <Icon
                size={22}
                color={isActive ? "#256428" : "#9ca3af"}
              />
            )}
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {t.nav[id]}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  scanPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  tabLabelActive: {
    color: "#256428",
  },
  tabLabelInactive: {
    color: "#9ca3af",
  },
})

