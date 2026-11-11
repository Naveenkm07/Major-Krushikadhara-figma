import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import Svg, { Path, G } from "react-native-svg"
import { useLang } from "../i18n"

export default function SplashScreen() {
  const { t } = useLang()
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo badge */}
        <View style={styles.logoBadge}>
          <WheatMark size={64} />
        </View>

        {/* Wordmark */}
        <Text style={styles.title}>KrushikaDhara</Text>

        {/* Kannada */}
        <Text style={styles.kannadaTitle}>ಕೃಷಿಕಧಾರಾ</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>{t.x.info.splash.tagline}</Text>
      </Animated.View>

      {/* Loading indicator dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </View>
  )
}

function WheatMark({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* green stalk / leaf */}
      <Path
        d="M20 58c0-14 4-26 14-36"
        stroke="#7cc142"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <Path
        d="M22 44c-6-1-11-5-13-11 6-1 11 1 14 6"
        fill="#5aa832"
      />
      {/* golden wheat ear */}
      <G fill="#f4b400">
        <Path d="M38 12c-4 3-6 7-6 12 5 0 9-2 12-6-2-3-4-5-6-6Z" />
        <Path d="M40 22c-4 3-6 7-6 12 5 0 9-2 12-6-2-3-4-5-6-6Z" />
        <Path d="M42 32c-4 3-6 7-6 12 5 0 9-2 12-6-2-3-4-5-6-6Z" />
      </G>
      <Path
        d="M44 8c-4 2-7 5-9 9"
        stroke="#f4b400"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#165922",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
  },
  logoBadge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    marginTop: 28,
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: -0.5,
    color: "#ffffff",
  },
  kannadaTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tagline: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(246, 239, 216, 0.9)",
    textAlign: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#f6efd8",
    opacity: 0.8,
  },
})

