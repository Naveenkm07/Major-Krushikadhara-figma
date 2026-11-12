import { useState } from "react"
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { ShieldCheck, FileText, Trash2, Lock, Camera, Mic, MapPin } from "lucide-react-native"
import DetailShell from "./DetailShell"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import { FadeSlideIn, ScalePressable } from "./Motion"

type SectionItem = {
  headingEn: string
  headingKn: string
  bodyEn: string
  bodyKn: string
}

const PRIVACY_SECTIONS: SectionItem[] = [
  {
    headingEn: "1. Information We Collect",
    headingKn: "1. ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ",
    bodyEn:
      "KrushikaDhara collects only the details needed to deliver agricultural services: your mobile number for OTP sign-in, optional farmer/farm profile details (name, district, village, acreage, crops, soil health NPK/pH), crop photos you upload for pest/disease scanning, and audio recordings when you actively tap the Voice AI microphone.",
    bodyKn:
      "ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಒದಗಿಸಲು ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಕೃಷಿಕಧಾರಾ ಸಂಗ್ರಹಿಸುತ್ತದೆ: OTP ಸೈನ್-ಇನ್‌ಗಾಗಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ಜಮೀನಿನ ವಿವರಗಳು (ಜಿಲ್ಲೆ, ಗ್ರಾಮ, ಬೆಳೆಗಳು, ಮಣ್ಣಿನ NPK), ನೀವು ಸ್ಕ್ಯಾನ್ ಮಾಡುವ ಬೆಳೆ ಚಿತ್ರಗಳು ಮತ್ತು ಮೈಕ್ ಒತ್ತಿದಾಗ ಮಾತ್ರ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್.",
  },
  {
    headingEn: "2. Permissions & Purpose",
    headingKn: "2. ಅನುಮತಿಗಳು ಮತ್ತು ಉದ್ದೇಶ",
    bodyEn:
      "• Camera & Photos: Used strictly when capturing leaf scans or updating your profile photo.\n• Microphone: Used strictly when speaking to the Kannada/English Voice Agronomist.\n• Location (GPS): Used only while the app is open to find APMC mandis within 50 km, hyperlocal weather advisories, and nearby rental equipment.",
    bodyKn:
      "• ಕ್ಯಾಮೆರಾ ಮತ್ತು ಫೋಟೋ: ಬೆಳೆ ರೋಗ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಪ್ರೊಫೈಲ್ ಚಿತ್ರಕ್ಕಾಗಿ ಮಾತ್ರ.\n• ಮೈಕ್ರೊಫೋನ್: ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್ ಧ್ವನಿ AI ಗೆ ಪ್ರಶ್ನೆ ಕೇಳುವಾಗ ಮಾತ್ರ.\n• ಸ್ಥಳ (GPS): 50 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯ APMC ಮಂಡಿಗಳು, ಹವಾಮಾನ ಮತ್ತು ಹತ್ತಿರದ ಕೃಷಿ ಯಂತ್ರಗಳನ್ನು ತೋರಿಸಲು ಮಾತ್ರ.",
  },
  {
    headingEn: "3. Data Security & Third-Party Processing",
    headingKn: "3. ಡೇಟಾ ಸುರಕ್ಷತೆ ಮತ್ತು AI ಸಂಸ್ಕರಣೆ",
    bodyEn:
      "We never sell farmer personal data to third-party advertisers. Images, text, and audio queries are transmitted over encrypted connections to compute AI crop diagnostics (YOLO11s + Gemini Vision) and bilingual speech (Sarvam AI), and official APMC / weather advisories.",
    bodyKn:
      "ರೈತರ ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ಜಾಹೀರಾತುದಾರರಿಗೆ ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ. AI ರೋಗನಿರ್ಣಯ ಮತ್ತು ಕನ್ನಡ ಧ್ವನಿ ಉತ್ತರಗಳಿಗಾಗಿ ಮಾತ್ರ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ.",
  },
  {
    headingEn: "4. Retention & Account Deletion Rights",
    headingKn: "4. ಡೇಟಾ ಅಳಿಸುವ ಹಕ್ಕು",
    bodyEn:
      "You retain complete ownership of your farm records. You may permanently delete your farmer profile, scan history, saved tips, equipment bookings, and crop insurance records directly inside this screen at any time, or contact support@krushikadhara.in.",
    bodyKn:
      "ನಿಮ್ಮ ಜಮೀನಿನ ದಾಖಲೆಗಳ ಸಂಪೂರ್ಣ ಹಕ್ಕು ನಿಮ್ಮದೇ ಆಗಿದೆ. ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಕೆಳಗಿನ ಬಟನ್ ಬಳಸಿ ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಬಹುದು.",
  },
]

const TERMS_SECTIONS: SectionItem[] = [
  {
    headingEn: "1. Agricultural Advisory Disclaimer",
    headingKn: "1. ಕೃಷಿ ಸಲಹಾ ಸೂಚನೆ",
    bodyEn:
      "AI pest detection (YOLO11s / Gemini Vision), weather advisories, and fertilizer dosages are decision-support tools. Before applying chemical pesticides, verify product labels, approved dosages, and local Karnataka Raitha Samparka Kendra (RSK) agronomist guidance.",
    bodyKn:
      "AI ಕೀಟ ಪತ್ತೆ, ಹವಾಮಾನ ಮತ್ತು ಗೊಬ್ಬರದ ಸಲಹೆಗಳು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಗೆ ಮುನ್ನ ಉತ್ಪನ್ನದ ಲೇಬಲ್ ಮತ್ತು ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಸಲಹೆ ಪರಿಶೀಲಿಸಿ.",
  },
  {
    headingEn: "2. Equipment Rental Marketplace",
    headingKn: "2. ಕೃಷಿ ಯಂತ್ರ ಬಾಡಿಗೆ ನಿಯಮಗಳು",
    bodyEn:
      "KrushikaDhara connects local farm machinery owners and renters directly. Owners must maintain safe working machinery; renters must inspect fuel, attachments, and agreed daily rates before dispatch.",
    bodyKn:
      "ಕೃಷಿಕಧಾರಾ ಯಂತ್ರ ಮಾಲೀಕರು ಮತ್ತು ಬಾಡಿಗೆದಾರರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ. ಬಾಡಿಗೆಗೆ ಪಡೆಯುವ ಮುನ್ನ ಯಂತ್ರದ ಸ್ಥಿತಿ ಮತ್ತು ದರವನ್ನು ದೃಢಪಡಿಸಿಕೊಳ್ಳಿ.",
  },
  {
    headingEn: "3. PMFBY Insurance & Official Portals",
    headingKn: "3. ಬೆಳೆ ವಿಮೆ (PMFBY) ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    bodyEn:
      "Premium calculations, eligibility checks, and claim tracking assist farmers in organizing records. Official policy issuance, claim settlement, and DBT disbursements are governed solely by pmfby.gov.in, Karnataka Samrakshane, and respective government portals.",
    bodyKn:
      "ವಿಮಾ ಕಂತು ಲೆಕ್ಕಾಚಾರ ಮತ್ತು ದಾಖಲೆಗಳು ಪೂರ್ವಸಿದ್ಧತೆಗಾಗಿ ಮಾತ್ರ. ಅಂತಿಮ ಪಾಲಿಸಿ ಮತ್ತು ಪರಿಹಾರವನ್ನು ಅಧಿಕೃತ pmfby.gov.in ಹಾಗೂ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು ನಿರ್ಧರಿಸುತ್ತವೆ.",
  },
  {
    headingEn: "4. Grievance & Contact",
    headingKn: "4. ಸಂಪರ್ಕ ಮತ್ತು ದೂರು ವಿಭಾಗ",
    bodyEn:
      "For support, account deletion requests, or legal queries, reach KrushikaDhara Farmer Support at support@krushikadhara.in (Bengaluru & Mandya, Karnataka, India).",
    bodyKn:
      "ಸಹಾಯ, ಖಾತೆ ಅಳಿಸುವಿಕೆ ಅಥವಾ ಕಾನೂನು ಪ್ರಶ್ನೆಗಳಿಗಾಗಿ support@krushikadhara.in ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  },
]

function LegalScreen({ mode }: { mode: "privacy" | "terms" }) {
  const { lang, t } = useLang()
  const { profile, deleteAccountData } = useProfile()
  const { open, reset } = useNav()
  const isKn = lang === "kn"
  const [deleting, setDeleting] = useState(false)

  const isPrivacy = mode === "privacy"
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS

  function confirmDeleteAccount() {
    Alert.alert(
      isKn ? "ಖಾತೆ ಮತ್ತು ಡೇಟಾ ಅಳಿಸಿ" : "Delete Account & Data",
      isKn
        ? `+91 ${profile.mobile} ಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರೊಫೈಲ್, ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ, ವಿಮಾ ಅರ್ಜಿಗಳು ಮತ್ತು ಬಾಡಿಗೆ ದಾಖಲೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ಬಯಸುವಿರಾ? ಇದನ್ನು ಹಿಂಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.`
        : `Permanently delete your profile (+91 ${profile.mobile}), scan history, insurance records, and equipment bookings? This action cannot be undone.`,
      [
        { text: t.x.coreA.editProfile.cancel || (isKn ? "ರದ್ದು" : "Cancel"), style: "cancel" },
        {
          text: isKn ? "ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ" : "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            setDeleting(true)
            try {
              reset()
              await deleteAccountData()
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  return (
    <DetailShell
      title={
        isPrivacy
          ? t.x.coreA.settings.privacy || (isKn ? "ಗೌಪ್ಯತಾ ನೀತಿ" : "Privacy Policy")
          : t.x.coreA.settings.terms || (isKn ? "ಸೇವಾ ನಿಯಮಗಳು" : "Terms of Service")
      }
      subtitle={
        isKn
          ? "ಕೊನೆಯ ನವೀಕರಣ: ನವೆಂಬರ್ 2026 · ಕೃಷಿಕಧಾರಾ"
          : "Last updated: Nov 2026 · KrushikaDhara"
      }
    >
      <FadeSlideIn delay={30}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            {isPrivacy ? (
              <ShieldCheck size={26} color="#15803d" />
            ) : (
              <FileText size={26} color="#15803d" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {isPrivacy
                ? isKn
                  ? "ನಿಮ್ಮ ಡೇಟಾ, ನಿಮ್ಮ ನಿಯಂತ್ರಣ"
                  : "Your Farm Data, Your Control"
                : isKn
                ? "ಪಾರದರ್ಶಕ ರೈತ ಸೇವಾ ನಿಯಮಗಳು"
                : "Transparent Farmer Usage Terms"}
            </Text>
            <Text style={styles.heroSub}>
              {isPrivacy
                ? isKn
                  ? "ಯಾವುದೇ ಜಾಹೀರಾತು ಟ್ರ್ಯಾಕಿಂಗ್ ಇಲ್ಲ · ಸುರಕ್ಷಿತ OTP ಮತ್ತು HTTPS"
                  : "Zero ad tracking · Scoped permissions · Encrypted API access"
                : isKn
                ? "ಕರ್ನಾಟಕ ಮತ್ತು ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ಮಾರ್ಗದರ್ಶಿ"
                : "Built for Indian farmers with transparent AI & govt disclaimers"}
            </Text>
          </View>
        </View>
      </FadeSlideIn>

      {isPrivacy && (
        <FadeSlideIn delay={80}>
          <View style={styles.permStrip}>
            <View style={styles.permBadge}>
              <Camera size={14} color="#256428" />
              <Text style={styles.permText}>{isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera"}</Text>
            </View>
            <View style={styles.permBadge}>
              <Mic size={14} color="#256428" />
              <Text style={styles.permText}>{isKn ? "ಮೈಕ್" : "Voice"}</Text>
            </View>
            <View style={styles.permBadge}>
              <MapPin size={14} color="#256428" />
              <Text style={styles.permText}>{isKn ? "ಸ್ಥಳ" : "Location"}</Text>
            </View>
            <View style={styles.permBadge}>
              <Lock size={14} color="#256428" />
              <Text style={styles.permText}>{isKn ? "ಮಾರಾಟವಿಲ್ಲ" : "No Ads"}</Text>
            </View>
          </View>
        </FadeSlideIn>
      )}

      {sections.map((sec, idx) => (
        <FadeSlideIn key={sec.headingEn} delay={110 + idx * 55}>
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>
              {isKn ? sec.headingKn : sec.headingEn}
            </Text>
            <Text style={styles.sectionBody}>
              {isKn ? sec.bodyKn : sec.bodyEn}
            </Text>
          </View>
        </FadeSlideIn>
      ))}

      {isPrivacy ? (
        <FadeSlideIn delay={340}>
          <View style={styles.deleteCard}>
            <Text style={styles.deleteTitle}>
              {isKn ? "ಖಾತೆ ಮತ್ತು ಡೇಟಾ ಅಳಿಸುವಿಕೆ" : "Delete Account & All Farm Data"}
            </Text>
            <Text style={styles.deleteDesc}>
              {isKn
                ? "ನಿಮ್ಮ ರೈತ ಪ್ರೊಫೈಲ್, ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ, ವಿಮೆ ಮತ್ತು ಯಂತ್ರ ಬಾಡಿಗೆ ಡೇಟಾವನ್ನು ಸರ್ವರ್ ಹಾಗೂ ಸಾಧನದಿಂದ ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ."
                : "Permanently remove your farmer account, leaf scans, insurance records, and equipment listings from KrushikaDhara servers and this device."}
            </Text>
            <ScalePressable
              onPress={confirmDeleteAccount}
              disabled={deleting}
              style={styles.deleteBtn}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Trash2 size={16} color="#ffffff" />
                  <Text style={styles.deleteBtnText}>
                    {isKn ? "ನನ್ನ ಖಾತೆ ಮತ್ತು ಡೇಟಾ ಅಳಿಸಿ" : "Delete My Account & Data"}
                  </Text>
                </>
              )}
            </ScalePressable>
          </View>
        </FadeSlideIn>
      ) : (
        <FadeSlideIn delay={340}>
          <ScalePressable
            onPress={() => open("privacyPolicy")}
            style={styles.crossLinkBtn}
          >
            <ShieldCheck size={17} color="#256428" />
            <Text style={styles.crossLinkText}>
              {isKn
                ? "ಗೌಪ್ಯತಾ ನೀತಿ ಮತ್ತು ಡೇಟಾ ಅಳಿಸುವಿಕೆ ನೋಡಿ →"
                : "View Privacy Policy & Data Deletion →"}
            </Text>
          </ScalePressable>
        </FadeSlideIn>
      )}
    </DetailShell>
  )
}

export function PrivacyPolicyScreen() {
  return <LegalScreen mode="privacy" />
}

export function TermsOfServiceScreen() {
  return <LegalScreen mode="terms" />
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#15803d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#14532d",
  },
  heroSub: {
    fontSize: 12,
    color: "#166534",
    marginTop: 3,
    lineHeight: 17,
  },
  permStrip: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  permBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  permText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1f2937",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 20,
  },
  deleteCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#991b1b",
  },
  deleteDesc: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 14,
  },
  deleteBtn: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  crossLinkBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 24,
  },
  crossLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#256428",
  },
})

