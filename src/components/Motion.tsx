import { useEffect, useRef, type ReactNode } from "react"
import {
  Animated,
  Easing,
  Pressable,
  View,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ScalePressableProps {
  children: ReactNode
  onPress?: (e: GestureResponderEvent) => void
  onLongPress?: (e: GestureResponderEvent) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  scaleTo?: number
  accessibilityLabel?: string
  accessibilityRole?: "button" | "link" | "tab" | "none"
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number }
  activeOpacity?: number
}

/**
 * Tactile spring-animated pressable replacement for TouchableOpacity.
 * Uses native driver transforms for smooth 60fps interaction across all Android devices.
 */
export function ScalePressable({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  scaleTo = 0.965,
  accessibilityLabel,
  accessibilityRole = "button",
  hitSlop,
  activeOpacity = 0.92,
}: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current

  function handlePressIn() {
    if (disabled) return
    Animated.parallel([
      Animated.spring(scale, {
        toValue: scaleTo,
        speed: 42,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: activeOpacity,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start()
  }

  function handlePressOut() {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        speed: 28,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={[
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  )
}

/**
 * Staggered entrance animation combining subtle upward glide and fade-in.
 */
export function FadeSlideIn({
  children,
  delay = 0,
  distance = 14,
  duration = 320,
  direction = "up",
  style,
}: {
  children: ReactNode
  delay?: number
  distance?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right"
  style?: StyleProp<ViewStyle>
}) {
  const opacity = useRef(new Animated.Value(0)).current
  const offset = useRef(
    new Animated.Value(
      direction === "down" || direction === "right" ? -distance : distance
    )
  ).current

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration: duration + 40,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ])
    anim.start()
    return () => anim.stop()
  }, [delay, duration])

  const transform =
    direction === "left" || direction === "right"
      ? [{ translateX: offset }]
      : [{ translateY: offset }]

  return (
    <Animated.View style={[style, { opacity, transform }]}>
      {children}
    </Animated.View>
  )
}

/**
 * Bouncing 3-dot wave loader (used on SplashScreen & AI loading states).
 */
export function PulseDotWave({
  color = "#f6efd8",
  size = 9,
  gap = 8,
}: {
  color?: string
  size?: number
  gap?: number
}) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]

  useEffect(() => {
    const animations = dots.map((anim, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 160),
          Animated.timing(anim, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 360,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((2 - idx) * 160 + 180),
        ])
      )
    )
    const composite = Animated.parallel(animations)
    composite.start()
    return () => composite.stop()
  }, [])

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap }}>
      {dots.map((anim, idx) => (
        <Animated.View
          key={idx}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.45, 1],
            }),
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                }),
              },
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1.2],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  )
}

/**
 * Concentric radar pulse ring for AI Scan Processing and active Voice Microphone.
 */
export function PulseHalo({
  size = 120,
  color = "#4ade80",
  active = true,
  delay = 0,
}: {
  size?: number
  color?: string
  active?: boolean
  delay?: number
}) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!active) {
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [active, delay])

  if (!active) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        opacity: pulse.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0.55, 0.2, 0],
        }),
        transform: [
          {
            scale: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1.48],
            }),
          },
        ],
      }}
    />
  )
}

/**
 * Continuous laser sweep line inside camera viewfinder.
 */
export function ScanLaserSweep({
  height = 240,
  color = "#4ade80",
}: {
  height?: number
  color?: string
}) {
  const pos = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pos, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pos, {
          toValue: 0,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const travel = Math.max(80, height - 32)

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.laserWrap,
        {
          transform: [
            {
              translateY: pos.interpolate({
                inputRange: [0, 1],
                outputRange: [16, travel],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.laserLine, { backgroundColor: color, shadowColor: color }]} />
    </Animated.View>
  )
}

/**
 * Smooth animated horizontal fill bar for crop maturity, NPK gauges, and scan progress.
 */
export function AnimatedProgressFill({
  pct,
  color = "#256428",
  height = "100%",
  borderRadius = 999,
  duration = 550,
}: {
  pct: number
  color?: string
  height?: number | `${number}%`
  borderRadius?: number
  duration?: number
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [clamped, duration])

  return (
    <Animated.View
      style={{
        height,
        borderRadius,
        backgroundColor: color,
        width: anim.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        }),
      }}
    />
  )
}

/**
 * Animated vertical chart column that rises cleanly on mount or range switch.
 */
export function AnimatedBarColumn({
  pct,
  color = "#256428",
  delay = 0,
}: {
  pct: number
  color?: string
  delay?: number
}) {
  const clamped = Math.max(4, Math.min(100, pct))
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    anim.setValue(4)
    Animated.timing(anim, {
      toValue: clamped,
      duration: 520,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [clamped, delay])

  return (
    <Animated.View
      style={{
        width: "100%",
        borderRadius: 6,
        backgroundColor: color,
        height: anim.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        }),
      }}
    />
  )
}

/**
 * Live audio waveform equalizer bars for Voice AI recording and speech playback.
 */
export function WaveformBars({
  active = false,
  color = "#ffffff",
  barCount = 7,
  maxHeight = 22,
}: {
  active?: boolean
  color?: string
  barCount?: number
  maxHeight?: number
}) {
  const bars = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.25))
  ).current

  useEffect(() => {
    if (!active) {
      bars.forEach((b) =>
        Animated.timing(b, {
          toValue: 0.25,
          duration: 180,
          useNativeDriver: true,
        }).start()
      )
      return
    }

    const loops = bars.map((bar, i) => {
      const peak = i % 2 === 0 ? 1 : 0.72
      const dur = 240 + (i % 4) * 75
      return Animated.loop(
        Animated.sequence([
          Animated.delay(i * 55),
          Animated.timing(bar, {
            toValue: peak,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.22,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    })

    const comp = Animated.parallel(loops)
    comp.start()
    return () => comp.stop()
  }, [active])

  return (
    <View style={styles.waveRow}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            height: maxHeight,
            borderRadius: 2,
            backgroundColor: color,
            transform: [{ scaleY: bar }],
          }}
        />
      ))}
    </View>
  )
}

/**
 * Shimmer-like breathing skeleton placeholder card for async loading states.
 */
export function SkeletonBox({
  height = 84,
  borderRadius = 18,
  style,
}: {
  height?: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}) {
  const pulse = useRef(new Animated.Value(0.45)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius,
          backgroundColor: "#e5e7eb",
          opacity: pulse,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  laserWrap: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 0,
  },
  laserLine: {
    height: 2.5,
    borderRadius: 2,
    opacity: 0.85,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
})

