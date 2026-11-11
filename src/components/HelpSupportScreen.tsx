import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Phone, Mail, MessageCircle, HelpCircle, ChevronRight } from "lucide-react-native"

const FAQS = [
  {
    q: "How accurate is the AI leaf scan?",
    a: "Our AI model achieves 94% diagnostic accuracy across 25+ crops including Paddy, Tomato, Chilli, and Ragi.",
  },
  {
    q: "How do I request equipment rentals?",
    a: "Browse the Equipment Rental tab, pick a tractor or machinery, select rental dates, and tap 'Book Now'. The owner will confirm within 2 hours.",
  },
  {
    q: "What documents are required for PMFBY claims?",
    a: "You need Aadhaar card, Land Record (Pahani/RTC), Bank Passbook copy, and geotagged crop loss photos taken within 72 hours.",
  },
  {
    q: "Can I use KrushikaDhara without internet?",
    a: "Yes! Offline Mode allows you to save scan photos, view pre-downloaded advisories, and browse saved market prices.",
  },
]

export default function HelpSupportScreen() {
  const { t } = useLang()
  return (
    <DetailShell
      title={t.profile?.rows?.help || "Help & Support"}
      subtitle="Kisan helpline & frequently asked questions"
    >
      {/* Contact Channels */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Farmer Helplines</Text>

        <TouchableOpacity style={styles.contactItem}>
          <View style={[styles.contactIconWrap, { backgroundColor: "#dcfce7" }]}>
            <Phone size={18} color="#16a34a" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Kisan Call Centre (Toll-Free)</Text>
            <Text style={styles.contactSubtitle}>1800-180-1551 (6:00 AM - 10:00 PM)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem}>
          <View style={[styles.contactIconWrap, { backgroundColor: "#dbeafe" }]}>
            <MessageCircle size={18} color="#2563eb" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>KrushikaDhara WhatsApp Support</Text>
            <Text style={styles.contactSubtitle}>+91 95915 02209</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FAQs */}
      <Text style={styles.faqHeading}>Frequently Asked Questions</Text>
      <View style={styles.faqList}>
        {FAQS.map((faq, i) => (
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
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
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

