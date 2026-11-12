import { useEffect, useRef } from "react"
import { Animated, View, Text, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Home, ScanLine, BarChart3, Landmark, User } from "lucide-react-native"
import { useLang } from "../i18n"
import { ScalePressable } from "./Motion"

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
  const scanGlow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanGlow, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

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
          <ScalePressable
            key={id}
            onPress={() => onChange(id)}
            scaleTo={0.9}
            accessibilityRole="tab"
            accessibilityLabel={t.nav[id]}
            style={styles.tabButton}
          >
            {id === "scan" ? (
              <View style={styles.scanWrap}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.scanHalo,
                    {
                      opacity: scanGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.16, 0.36],
                      }),
                      transform: [
                        {
                          scale: scanGlow.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.18],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={[styles.scanPill, isActive && styles.scanPillActive]}>
                  <Icon size={23} color="#ffffff" />
                </View>
              </View>
            ) : (
              <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
                <Icon
                  size={21}
                  color={isActive ? "#256428" : "#9ca3af"}
                />
              </View>
            )}
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {t.nav[id]}
            </Text>
          </ScalePressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
  },
  iconPillActive: {
    backgroundColor: "#dcfce7",
  },
  scanWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  scanHalo: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4ade80",
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
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 5,
  },
  scanPillActive: {
    backgroundColor: "#15803d",
    borderWidth: 2,
    borderColor: "#bbf7d0",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  tabLabelActive: {
    color: "#256428",
    fontWeight: "700",
  },
  tabLabelInactive: {
    color: "#9ca3af",
  },
})
