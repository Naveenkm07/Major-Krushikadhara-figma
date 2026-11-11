import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Landmark, Check, ExternalLink, Calendar, FileText } from "lucide-react-native"

export default function SchemeDetailScreen() {
  const { params } = useNav()
  const { t } = useLang()
  const id = typeof params.id === "string" ? params.id : "pmkisan"
  const item: any = t.x.coreB.schemes.items[id as keyof typeof t.x.coreB.schemes.items] || {
    name: "PM-KISAN Samman Nidhi",
    eligibility: "All landholding farmer families with cultivable land",
    benefitAmount: "₹6,000 / year",
  }

  return (
    <DetailShell
      title={item.name}
      subtitle="Government Welfare & Subsidy Scheme"
      footer={
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.85} style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply on Official Portal</Text>
            <ExternalLink size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Landmark size={32} color="#ffffff" />
        </View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.benefitText}>Benefit: {item.benefitAmount}</Text>
        <Text style={styles.descText}>{item.eligibility}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
        <View style={styles.reqItem}>
          <Check size={16} color="#16a34a" />
          <Text style={styles.reqText}>Valid landholding ownership documents (RTC / Pahani)</Text>
        </View>
        <View style={styles.reqItem}>
          <Check size={16} color="#16a34a" />
          <Text style={styles.reqText}>Aadhaar linked with primary bank account (DBT enabled)</Text>
        </View>
        <View style={styles.reqItem}>
          <Check size={16} color="#16a34a" />
          <Text style={styles.reqText}>Farmer family with cultivable land in Karnataka</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        <View style={styles.reqItem}>
          <FileText size={16} color="#256428" />
          <Text style={styles.reqText}>Aadhaar Card of Applicant</Text>
        </View>
        <View style={styles.reqItem}>
          <FileText size={16} color="#256428" />
          <Text style={styles.reqText}>Land Record Documents (Pahani/RTC)</Text>
        </View>
        <View style={styles.reqItem}>
          <FileText size={16} color="#256428" />
          <Text style={styles.reqText}>Bank Passbook with IFSC code</Text>
        </View>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  benefitText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 4,
  },
  descText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  reqItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  reqText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  applyBtn: {
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
