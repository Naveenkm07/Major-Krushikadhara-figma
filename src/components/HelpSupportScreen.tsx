import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Phone, MessageCircle, ExternalLink } from "lucide-react-native"

const FAQS_EN = [
  {
    q: "How accurate is the AI leaf scan?",
    a: "Our YOLO11s TFLite + Gemini AI pipeline detects 102 agricultural pests & crop conditions with high accuracy and provides instant organic & chemical remedies.",
  },
  {
    q: "How do I request equipment rentals?",
    a: "Browse Equipment Rental from the Home screen, pick a tractor or sprayer, choose dates, and submit a booking request directly.",
  },
  {
    q: "What documents are required for PMFBY claims?",
    a: "You need Aadhaar card, Land Record (Pahani/RTC), Bank Passbook copy, and geotagged crop loss photos taken within 72 hours.",
  },
  {
    q: "Can I view schemes and advisories in Kannada?",
    a: "Yes! Tap EN / ಕನ್ನಡ at the top of the Home screen anytime to switch the entire app cleanly between Kannada and English.",
  },
]

const FAQS_KN = [
  {
    q: "AI ಎಲೆ ಸ್ಕ್ಯಾನ್ ಎಷ್ಟು ನಿಖರವಾಗಿದೆ?",
    a: "ನಮ್ಮ YOLO11s TFLite ಮತ್ತು Gemini AI ವ್ಯವಸ್ಥೆಯು 102 ಕೃಷಿ ಕೀಟಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ ತಕ್ಷಣ ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಪರಿಹಾರಗಳನ್ನು ನೀಡುತ್ತದೆ.",
  },
  {
    q: "ಯಂತ್ರೋಪಕರಣ ಬಾಡಿಗೆಗೆ ಹೇಗೆ ವಿನಂತಿಸಬೇಕು?",
    a: "ಮುಖಪುಟದಿಂದ 'ಯಂತ್ರ ಬಾಡಿಗೆ' ಆಯ್ಕೆಮಾಡಿ, ಟ್ರಾಕ್ಟರ್ ಅಥವಾ ಸ್ಪ್ರೇಯರ್ ಆರಿಸಿ, ದಿನಾಂಕ ನಮೂದಿಸಿ ಬುಕ್ ಮಾಡಿ.",
  },
  {
    q: "PMFBY ವಿಮೆ ಕ್ಲೇಮ್‌ಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
    a: "ಆಧಾರ್ ಕಾರ್ಡ್, ಭೂ ದಾಖಲೆ (ಪಹಣಿ/RTC), ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ಪ್ರತಿ ಮತ್ತು 72 ಗಂಟೆಗಳೊಳಗೆ ತೆಗೆದ ಬೆಳೆ ಹಾನಿಯ ಫೋಟೋಗಳು ಬೇಕಾಗುತ್ತವೆ.",
  },
  {
    q: "ಆ್ಯಪ್ ಅನ್ನು ಕನ್ನಡದಲ್ಲಿ ಬಳಸಬಹುದೇ?",
    a: "ಹೌದು! ಮುಖಪುಟದ ಮೇಲ್ಭಾಗದಲ್ಲಿರುವ EN / ಕನ್ನಡ ಬಟನ್ ಒತ್ತಿ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಭಾಷೆ ಬದಲಾಯಿಸಬಹುದು.",
  },
]

export default function HelpSupportScreen() {
  const { t, lang } = useLang()
  const isKn = lang === "kn"
  const faqs = isKn ? FAQS_KN : FAQS_EN

  async function handleCallHelpline() {
    const url = "tel:18001801551"
    try {
      await Linking.openURL(url)
    } catch {
      Alert.alert(
        isKn ? "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್" : "Kisan Call Centre",
        isKn ? "ದಯವಿಟ್ಟು 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ." : "Please dial 1800-180-1551 from your phone dialer."
      )
    }
  }

  async function handleOpenWhatsApp() {
    const msg = encodeURIComponent(
      isKn
        ? "ನಮಸ್ಕಾರ ಕೃಷಿಕಧಾರಾ ತಂಡ, ನನಗೆ ಬೆಳೆ ಸಹಾಯ ಬೇಕಾಗಿದೆ."
        : "Namaskara KrushikaDhara team, I need assistance with my crop."
    )
    const url = `https://wa.me/919591502209?text=${msg}`
    try {
      await Linking.openURL(url)
    } catch {
      Alert.alert(
        "WhatsApp Support",
        isKn
          ? "WhatsApp ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. +91 95915 02209 ಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ."
          : "Could not open WhatsApp. Please message +91 95915 02209."
      )
    }
  }

  return (
    <DetailShell
      title={t.profile?.rows?.help || (isKn ? "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ" : "Help & Support")}
      subtitle={
        isKn
          ? "ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ ಮತ್ತು ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು"
          : "Kisan helpline & frequently asked questions"
      }
    >
      {/* Contact Channels */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {isKn ? "ರೈತ ಸಹಾಯವಾಣಿಗಳು" : "Farmer Helplines"}
        </Text>

        <TouchableOpacity
          onPress={handleCallHelpline}
          activeOpacity={0.75}
          style={[styles.contactItem, { borderTopWidth: 0 }]}
        >
          <View style={[styles.contactIconWrap, { backgroundColor: "#dcfce7" }]}>
            <Phone size={18} color="#16a34a" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>
              {isKn ? "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (ಉಚಿತ ಕರೆ)" : "Kisan Call Centre (Toll-Free)"}
            </Text>
            <Text style={styles.contactSubtitle}>
              1800-180-1551 ({isKn ? "ಬೆಳಿಗ್ಗೆ 6 - ರಾತ್ರಿ 10" : "6:00 AM - 10:00 PM"})
            </Text>
          </View>
          <ExternalLink size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenWhatsApp}
          activeOpacity={0.75}
          style={styles.contactItem}
        >
          <View style={[styles.contactIconWrap, { backgroundColor: "#dbeafe" }]}>
            <MessageCircle size={18} color="#2563eb" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>
              {isKn ? "ಕೃಷಿಕಧಾರಾ WhatsApp ಬೆಂಬಲ" : "KrushikaDhara WhatsApp Support"}
            </Text>
            <Text style={styles.contactSubtitle}>+91 95915 02209</Text>
          </View>
          <ExternalLink size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* FAQs */}
      <Text style={styles.faqHeading}>
        {isKn ? "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು (FAQ)" : "Frequently Asked Questions"}
      </Text>
      <View style={styles.faqList}>
        {faqs.map((faq, i) => (
          <View key={i} style={styles.faqCard}>
            <Text style={styles.faqQ}>{faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  contactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  contactSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  faqHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  faqList: {
    gap: 12,
    marginBottom: 30,
  },
  faqCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  faqA: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
  },
})
