import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Sprout, Phone, Check, ArrowLeft, ShieldCheck } from "lucide-react-native"
import { useLang } from "../i18n"
import {
  DEV_TEST_PHONE,
  DEV_TEST_OTP,
  isValidIndianMobile,
  recordConsent,
  requestOtp,
  verifyOtp,
} from "../auth"

export default function AuthScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const L = t.x.login
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
  const otpInputRefs = useRef<any[]>([])

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
        onDone()
      } else {
        setOtpError(L.invalidCode)
        setDigits(["", "", "", ""])
        otpInputRefs.current[0]?.focus()
      }
    } catch {
      setOtpError(L.error)
    } finally {
      setBusy(false)
    }
  }

  function handleDigitChange(text: string, index: number) {
    const clean = text.replace(/\D/g, "")
    setOtpError("")
    const newDigits = [...digits]
    newDigits[index] = clean.slice(-1)
    setDigits(newDigits)

    if (clean && index < 3) {
      otpInputRefs.current[index + 1]?.focus()
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
          <View style={styles.content}>
            {/* Header / Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.sproutBox}>
                <Sprout size={36} color="#ffffff" />
              </View>
              <Text style={styles.brandTitle}>Welcome to KrushikaDhara</Text>
              <Text style={styles.brandSubtitle}>
                Sign in with your phone number to access AI crop doctor & services
              </Text>
            </View>

            {/* Input Card */}
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
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
                    Use demo number: {DEV_TEST_PHONE}
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
                  I agree to the Terms of Service & Privacy Policy
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={!canContinue}
                activeOpacity={0.85}
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
                    <Text style={styles.submitBtnText}>Get OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => {
                setStep("phone")
                setOtpError("")
              }}
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color="#256428" />
              <Text style={styles.backBtnText}>Edit Phone</Text>
            </TouchableOpacity>

            <View style={styles.otpHeader}>
              <View style={styles.shieldIconWrap}>
                <ShieldCheck size={36} color="#256428" />
              </View>
              <Text style={styles.brandTitle}>{L.verifyTitle}</Text>
              <Text style={styles.otpSubtitle}>
                Verification code sent to +91 {phone}
              </Text>
            </View>

            {/* OTP Digits Card */}
            <View style={styles.card}>
              <View style={styles.digitsRow}>
                {[0, 1, 2, 3].map((i) => (
                  <TextInput
                    key={i}
                    ref={(el) => {
                      otpInputRefs.current[i] = el
                    }}
                    value={digits[i]}
                    onChangeText={(t) => handleDigitChange(t, i)}
                    keyboardType="number-pad"
                    maxLength={1}
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
                    Auto-fill demo OTP: {DEV_TEST_OTP}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {otpError ? <Text style={styles.noticeText}>{otpError}</Text> : null}

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={digits.join("").length !== 4 || busy}
                activeOpacity={0.85}
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
              </TouchableOpacity>

              {/* Resend */}
              <TouchableOpacity
                disabled={cooldown > 0}
                onPress={handleSendOtp}
                style={styles.resendBtn}
              >
                <Text style={styles.resendText}>
                  {cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : L.resend || "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
})
