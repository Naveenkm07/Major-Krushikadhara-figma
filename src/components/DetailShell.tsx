import { useEffect, useRef, type ReactNode } from "react"
import {
  Animated,
  Easing,
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronLeft } from "lucide-react-native"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import { ScalePressable } from "./Motion"

export default function DetailShell({
  title,
  subtitle,
  action,
  footer,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  const { back } = useNav()
  const { t } = useLang()
  const insets = useSafeAreaInsets()

  const enterOpacity = useRef(new Animated.Value(0)).current
  const enterY = useRef(new Animated.Value(22)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(enterY, {
        toValue: 0,
        speed: 22,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: enterOpacity,
          transform: [{ translateY: enterY }],
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + 10, 40),
            },
          ]}
        >
          <View style={styles.headerRow}>
            <ScalePressable
              onPress={back}
              scaleTo={0.9}
              style={styles.backButton}
              accessibilityLabel={t.x.coreA.common.back || "Back"}
            >
              <ChevronLeft size={22} color="#ffffff" />
            </ScalePressable>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {action}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {footer}
      </KeyboardAvoidingView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f7f8ec",
    zIndex: 50,
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 48,
  },
})
