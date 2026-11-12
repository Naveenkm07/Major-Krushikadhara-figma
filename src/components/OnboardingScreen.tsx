import { useEffect, useRef, useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight, Leaf, TrendingUp, Globe } from "lucide-react-native"
import { useLang } from "../i18n"
import { ScalePressable } from "./Motion"

type Props = { onDone: () => void; initialIndex?: number; onStep?: (i: number) => void }

const slides = [
  {
    id: 0,
    icon: Leaf,
    iconBg: "#dcfce7",
    iconColor: "#15803d",
    img: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=500&fit=crop&auto=format",
    badgeColor: "#16a34a",
    stat1: "25",
    stat2: "94%",
    stat3: "<2s",
  },
  {
    id: 1,
    icon: TrendingUp,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=500&fit=crop&auto=format",
    badgeColor: "#2563eb",
    stat1: "8+",
    stat2: "daily",
    stat3: "PMFBY",
  },
  {
    id: 2,
    icon: Globe,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=500&fit=crop&auto=format",
    badgeColor: "#d97706",
    stat1: "2",
    stat2: "offline",
    stat3: "100%",
  },
]

export default function OnboardingScreen({ onDone, initialIndex = 0, onStep }: Props) {
  const { t } = useLang()
  const insets = useSafeAreaInsets()
  const [idx, setIdx] = useState(initialIndex)
  const slideFade = useRef(new Animated.Value(1)).current
  const slideX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    slideFade.setValue(0.3)
    slideX.setValue(24)
    Animated.parallel([
      Animated.timing(slideFade, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideX, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start()
  }, [idx])

  const slide = slides[idx]
  const txt = t.x.info.onboarding.slides[idx]
  const isLast = idx === slides.length - 1

  function next() {
    if (isLast) {
      onDone()
    } else {
      const nextIdx = idx + 1
      setIdx(nextIdx)
      onStep?.(nextIdx)
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 16, 40),
          paddingBottom: Math.max(insets.bottom + 20, 36),
        },
      ]}
    >
      {/* Top Bar: Progress dots and Skip */}
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setIdx(i)
                onStep?.(i)
              }}
              style={[
                styles.dot,
                i === idx ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {!isLast ? (
          <TouchableOpacity onPress={onDone} hitSlop={10}>
            <Text style={styles.skipText}>{t.x.info.onboarding.skip}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Hero Image Card */}
      <Animated.View
        style={{
          opacity: slideFade,
          transform: [{ translateX: slideX }],
        }}
      >
        <View style={styles.imageCard}>
          <Image source={{ uri: slide.img }} style={styles.heroImage} />
          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: slide.badgeColor }]}>
            <Text style={styles.badgeText}>{txt.badge}</Text>
          </View>

          {/* Stats overlay */}
          <View style={styles.statsBar}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{slide.stat1}</Text>
              <Text style={styles.statLabel}>{txt.stat1}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{slide.stat2}</Text>
              <Text style={styles.statLabel}>{txt.stat2}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{slide.stat3}</Text>
              <Text style={styles.statLabel}>{txt.stat3}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.textContainer}>
          <View style={[styles.iconPill, { backgroundColor: slide.iconBg }]}>
            <slide.icon size={22} color={slide.iconColor} />
          </View>
          <Text style={styles.title}>{txt.title}</Text>
          <Text style={styles.body}>{txt.body}</Text>
        </View>
      </Animated.View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <ScalePressable
          onPress={next}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? t.x.info.onboarding.getStarted : (t.x.info.onboarding.cont || "Next")}
          </Text>
          <ChevronRight size={20} color="#ffffff" />
        </ScalePressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 22,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 26,
    backgroundColor: "#256428",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#e5e7eb",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  imageCard: {
    height: 260,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f3f4f6",
    marginVertical: 18,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: "80%",
    alignSelf: "center",
  },
  textContainer: {
    alignItems: "flex-start",
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  bottomBar: {
    marginTop: 16,
  },
  nextButton: {
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
