import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Easing } from "react-native"
import Svg, { Path, G } from "react-native-svg"
import { useLang } from "../i18n"
import { FadeSlideIn, PulseDotWave, PulseHalo } from "./Motion"

export default function SplashScreen() {
  const { t } = useLang()
  const scaleAnim = useRef(new Animated.Value(0.75)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 44,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    )
    floatLoop.start()
    return () => floatLoop.stop()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo badge with subtle radar pulse */}
        <View style={styles.badgeStage}>
          <PulseHalo size={136} color="rgba(246, 239, 216, 0.45)" active delay={0} />
          <Animated.View
            style={[
              styles.logoBadge,
              { transform: [{ translateY: floatAnim }] },
            ]}
          >
            <WheatMark size={64} />
          </Animated.View>
        </View>

        <FadeSlideIn delay={150} distance={12}>
          <Text style={styles.title}>KrushikaDhara</Text>
        </FadeSlideIn>

        <FadeSlideIn delay={230} distance={10}>
          <Text style={styles.kannadaTitle}>ಕೃಷಿಕಧಾರಾ</Text>
        </FadeSlideIn>

        <FadeSlideIn delay={310} distance={10}>
          <Text style={styles.tagline}>{t.x.info.splash.tagline}</Text>
        </FadeSlideIn>
      </Animated.View>

      {/* Animated loading dots */}
      <View style={styles.dotsContainer}>
        <PulseDotWave color="#f6efd8" size={9} gap={9} />
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
    overflow: "hidden",
  },
  topGlow: {
    position: "absolute",
    top: -90,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(124, 193, 66, 0.14)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -110,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(244, 180, 0, 0.08)",
  },
  content: {
    alignItems: "center",
  },
  badgeStage: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadge: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    marginTop: 24,
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: -0.5,
    color: "#ffffff",
  },
  kannadaTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fef08a",
  },
  tagline: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(246, 239, 216, 0.92)",
    textAlign: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 50,
  },
})
