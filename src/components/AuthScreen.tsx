import { useState, useRef, useEffect } from "react"
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Sprout, Phone, Check, ArrowLeft, ShieldCheck, X } from "lucide-react-native"
import { useLang, fmt } from "../i18n"
import { useProfile } from "../profile"
import { syncScanHistoryFromBackend } from "../storage/scanHistory"
import { FadeSlideIn, ScalePressable } from "./Motion"
import {
  DEV_TEST_PHONE,
  DEV_TEST_OTP,
  isValidIndianMobile,
  recordConsent,
  requestOtp,
  verifyOtp,
} from "../auth"

export default function AuthScreen({ onDone }: { onDone: () => void }) {
  const { t, lang } = useLang()
  const { updateProfile, refreshProfile } = useProfile()
  const L = t.x.login
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [consent, setConsent] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")

  // OTP state
  const [digits, setDigits] = useState(["", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [cooldown, setCooldown] = useState(30)
  const [policyModal, setPolicyModal] = useState<"privacy" | "terms" | null>(null)
  const otpInputRefs = useRef<any[]>([])
  const otpShake = useRef(new Animated.Value(0)).current

  function triggerOtpShake() {
    otpShake.setValue(0)
    Animated.sequence([
      Animated.timing(otpShake, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(otpShake, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(otpShake, { toValue: -7, duration: 55, useNativeDriver: true }),
      Animated.timing(otpShake, { toValue: 7, duration: 55, useNativeDriver: true }),
      Animated.timing(otpShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  useEffect(() => {
    if (step !== "otp" || cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [step, cooldown])

  const valid = isValidIndianMobile(phone)
  const canContinue = valid && consent && !busy

  async function handleSendOtp() {
    if (!canContinue) return
    setBusy(true)
    setNotice("")
    try {
      const res = await requestOtp(phone)
      if (res.ok) {
        recordConsent()
        setStep("otp")
        setCooldown(30)
      } else {
        setNotice(L.noSms)
      }
    } catch {
      setNotice(L.error)
    } finally {
      setBusy(false)
    }
  }

  function handleFillDemo() {
    if (DEV_TEST_PHONE) {
      setPhone(DEV_TEST_PHONE)
      setConsent(true)
    }
  }

  async function handleVerifyOtp() {
    const code = digits.join("")
    if (code.length !== 4 || busy) return
    setBusy(true)
    setOtpError("")
    try {
      const ok = await verifyOtp(phone, code)
      if (ok) {
        updateProfile({ mobile: phone })
        await refreshProfile(phone)
        syncScanHistoryFromBackend(phone).catch(() => {})
        onDone()
      } else {
        setOtpError(L.invalidCode)
        triggerOtpShake()
        setDigits(["", "", "", ""])
        otpInputRefs.current[0]?.focus()
      }
    } catch {
      setOtpError(L.error)
      triggerOtpShake()
    } finally {
      setBusy(false)
    }
  }

  function handleDigitChange(text: string, index: number) {
    const clean = text.replace(/\D/g, "")
    setOtpError("")
    const newDigits = [...digits]

    // Support pasting full 4-digit OTP into any box
    if (clean.length > 1) {
      const chars = clean.slice(0, 4).split("")
      chars.forEach((ch, idx) => {
        if (index + idx < 4) newDigits[index + idx] = ch
      })
      setDigits(newDigits)
      const nextFocus = Math.min(3, index + chars.length)
      otpInputRefs.current[nextFocus]?.focus()
      return
    }

    newDigits[index] = clean
    setDigits(newDigits)

    if (clean && index < 3) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  function handleDigitKeyPress(key: string, index: number) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits]
      newDigits[index - 1] = ""
      setDigits(newDigits)
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  function handleDemoOtp() {
    if (DEV_TEST_OTP) {
      const parts = DEV_TEST_OTP.split("")
      setDigits(parts)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top + 20, 48),
            paddingBottom: Math.max(insets.bottom + 20, 36),
          },
        ]}
      >
        {step === "phone" ? (
          <FadeSlideIn key="phone-step" delay={40} style={styles.content}>
            {/* Header / Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.sproutBox}>
                <Sprout size={36} color="#ffffff" />
              </View>
              <Text style={styles.brandTitle}>
                {isKn ? "ಕೃಷಿಕಧಾರಾಗೆ ಸ್ವಾಗತ" : "Welcome to KrushikaDhara"}
              </Text>
              <Text style={styles.brandSubtitle}>
                {isKn
                  ? "AI ಬೆಳೆ ವೈದ್ಯ ಮತ್ತು ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ"
                  : "Sign in with your phone number to access AI crop doctor & services"}
              </Text>
            </View>

            {/* Input Card */}
            <View style={styles.card}>
              <Text style={styles.inputLabel}>
                {isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "Mobile Number"}
              </Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val.replace(/\D/g, "").slice(0, 10))
                    setNotice("")
                  }}
                  placeholder="98765 43210"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.phoneTextInput}
                />
              </View>

              {/* Demo auto-fill helper button */}
              {DEV_TEST_PHONE ? (
                <TouchableOpacity
                  onPress={handleFillDemo}
                  style={styles.demoFillBtn}
                >
                  <Text style={styles.demoFillText}>
                    {fmt(L.devPhone, { phone: DEV_TEST_PHONE })}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

              {/* Consent checkbox */}
              <TouchableOpacity
                onPress={() => setConsent(!consent)}
                activeOpacity={0.8}
                style={styles.consentRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    consent && styles.checkboxActive,
                  ]}
                >
                  {consent && <Check size={14} color="#ffffff" />}
                </View>
                <Text style={styles.consentText}>
                  {fmt(L.consent, { terms: L.termsLink, privacy: L.privacyLink })}
                </Text>
              </TouchableOpacity>

              <View style={styles.legalLinksRow}>
                <TouchableOpacity onPress={() => setPolicyModal("terms")} hitSlop={6}>
                  <Text style={styles.legalLinkText}>{L.termsLink}</Text>
                </TouchableOpacity>
                <Text style={styles.legalDot}>·</Text>
                <TouchableOpacity onPress={() => setPolicyModal("privacy")} hitSlop={6}>
                  <Text style={styles.legalLinkText}>{L.privacyLink}</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <ScalePressable
                onPress={handleSendOtp}
                disabled={!canContinue}
                style={[
                  styles.submitBtn,
                  !canContinue && styles.submitBtnDisabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Phone size={18} color="#ffffff" />
                    <Text style={styles.submitBtnText}>
                      {isKn ? "OTP ಪಡೆಯಿರಿ" : "Get OTP"}
                    </Text>
                  </>
                )}
              </ScalePressable>
            </View>
          </FadeSlideIn>
        ) : (
          <FadeSlideIn key="otp-step" delay={30} style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => {
                setStep("phone")
                setOtpError("")
              }}
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color="#256428" />
              <Text style={styles.backBtnText}>{L.editPhone}</Text>
            </TouchableOpacity>

            <View style={styles.otpHeader}>
              <View style={styles.shieldIconWrap}>
                <ShieldCheck size={36} color="#256428" />
              </View>
              <Text style={styles.brandTitle}>{L.verifyTitle}</Text>
              <Text style={styles.otpSubtitle}>
                {fmt(L.verifyFor, { phone: `+91 ${phone}` })}
              </Text>
            </View>

            {/* OTP Digits Card */}
            <Animated.View
              style={[
                styles.card,
                { transform: [{ translateX: otpShake }] },
              ]}
            >
              <View style={styles.digitsRow}>
                {[0, 1, 2, 3].map((i) => (
                  <TextInput
                    key={i}
                    ref={(el) => {
                      otpInputRefs.current[i] = el
                    }}
                    value={digits[i]}
                    onChangeText={(t) => handleDigitChange(t, i)}
                    onKeyPress={({ nativeEvent }) => handleDigitKeyPress(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={i === 0 ? 4 : 1}
                    style={[
                      styles.digitInput,
                      digits[i] ? styles.digitInputFilled : null,
                    ]}
                  />
                ))}
              </View>

              {DEV_TEST_OTP ? (
                <TouchableOpacity
                  onPress={handleDemoOtp}
                  style={styles.demoFillBtn}
                >
                  <Text style={styles.demoFillText}>
                    {fmt(L.devCode, { code: DEV_TEST_OTP })}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {otpError ? <Text style={styles.noticeText}>{otpError}</Text> : null}

              <ScalePressable
                onPress={handleVerifyOtp}
                disabled={digits.join("").length !== 4 || busy}
                style={[
                  styles.submitBtn,
                  digits.join("").length !== 4 && styles.submitBtnDisabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>{L.verify}</Text>
                )}
              </ScalePressable>

              {/* Resend */}
              <TouchableOpacity
                disabled={cooldown > 0}
                onPress={handleSendOtp}
                style={styles.resendBtn}
              >
                <Text style={styles.resendText}>
                  {cooldown > 0
                    ? fmt(L.resendIn, { s: cooldown })
                    : L.resend}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </FadeSlideIn>
        )}
      </View>

      <Modal
        visible={policyModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPolicyModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {policyModal === "privacy" ? L.privacyLink : L.termsLink}
              </Text>
              <TouchableOpacity onPress={() => setPolicyModal(null)} hitSlop={8}>
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBody}>
                {policyModal === "privacy"
                  ? isKn
                    ? "ಕೃಷಿಕಧಾರಾ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು OTP ಲಾಗಿನ್ ಮತ್ತು ರೈತ ಸೇವೆಗಳ ಸಿಂಕ್‌ಗಾಗಿ ಮಾತ್ರ ಬಳಸುತ್ತದೆ. ಕ್ಯಾಮೆರಾ, ಮೈಕ್ ಮತ್ತು ಸ್ಥಳ ಅನುಮತಿಗಳನ್ನು ನೀವು ಸ್ಕ್ಯಾನ್, ಧ್ವನಿ ಸಹಾಯಕ ಅಥವಾ ಹತ್ತಿರದ ಮಂಡಿ/ಹವಾಮಾನ ವೀಕ್ಷಿಸುವಾಗ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಜಾಹೀರಾತಿಗಾಗಿ ಡೇಟಾವನ್ನು ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ. ಆ್ಯಪ್‌ನ ಸೆಟ್ಟಿಂಗ್ಸ್ -> ಗೌಪ್ಯತಾ ನೀತಿಯಿಂದ ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಬಹುದು."
                    : "KrushikaDhara uses your mobile number only for OTP authentication and syncing your farm profile, crop scans, equipment rentals, and PMFBY insurance records. Camera, microphone, and GPS are requested strictly when you scan leaves, speak to Voice AI, or query local weather and mandis. We never sell personal data or display third-party ads. You can delete your account and all data anytime from Settings -> Privacy Policy."
                  : isKn
                  ? "ಕೃಷಿಕಧಾರಾ AI ಬೆಳೆ ತಪಾಸಣೆ, ಮಂಡಿ ದರಗಳು, ಹವಾಮಾನ ಮತ್ತು ವಿಮಾ ದಾಖಲೆಗಳು ರೈತರ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಗೆ ಮುನ್ನ ಲೇಬಲ್ ಸೂಚನೆ ಮತ್ತು ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಸಲಹೆ ಪಾಲಿಸಿ. ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಯೋಜನೆ ಮತ್ತು ವಿಮಾ ಪರಿಹಾರಗಳು ಆಯಾ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ನಿಯಮಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ."
                  : "KrushikaDhara provides AI pest diagnostics, APMC Mandi rates, weather guidance, equipment rental matching, and PMFBY workflows as farmer decision-support tools. Always verify chemical dosages against registered product labels and local agricultural officers. Official schemes and insurance payouts remain governed by pmfby.gov.in and respective government portals."}
              </Text>
            </ScrollView>
            <ScalePressable
              onPress={() => setPolicyModal(null)}
              style={[styles.submitBtn, { marginTop: 14 }]}
            >
              <Text style={styles.submitBtnText}>{isKn ? "ಸರಿ" : "Close"}</Text>
            </ScalePressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  sproutBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#256428",
    marginTop: 18,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  countryCodeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#f3f4f6",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  demoFillBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#256428",
    textDecorationLine: "underline",
  },
  noticeText: {
    marginTop: 10,
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    borderColor: "#256428",
    backgroundColor: "#256428",
  },
  consentText: {
    fontSize: 12,
    color: "#4b5563",
    flex: 1,
  },
  submitBtn: {
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 22,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#256428",
  },
  otpHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  shieldIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  otpSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  digitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  digitInput: {
    width: 54,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  digitInputFilled: {
    borderColor: "#256428",
    backgroundColor: "#f0fdf4",
  },
  resendBtn: {
    marginTop: 18,
    alignItems: "center",
  },
  resendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  legalLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingLeft: 30,
  },
  legalLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#256428",
    textDecorationLine: "underline",
  },
  legalDot: {
    fontSize: 12,
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  modalBody: {
    fontSize: 13.5,
    color: "#4b5563",
    lineHeight: 21,
  },
})
