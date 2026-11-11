import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native"
import { useNav } from "../nav"
import { useInsurance } from "../insurance"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  ChevronRight,
  Upload,
} from "lucide-react-native"

/* 1. Eligibility Screen */
export function EligibilityScreen() {
  const { open } = useNav()
  return (
    <DetailShell
      title="Check PMFBY Eligibility"
      subtitle="Pradhan Mantri Fasal Bima Yojana"
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={() => open("insuranceApplication")}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Proceed to Application</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.eligibleBadge}>
          <CheckCircle2 size={20} color="#16a34a" />
          <Text style={styles.eligibleTitle}>You are Eligible!</Text>
        </View>
        <Text style={styles.bodyText}>
          Based on your landholding (4.2 acres) and crop selection (Paddy & Ragi) in Mandya District, you qualify for subsidized crop insurance under PMFBY.
        </Text>
      </View>
    </DetailShell>
  )
}

/* 2. Insurance Plan Screen */
export function InsurancePlanScreen() {
  const { open } = useNav()
  return (
    <DetailShell title="Available Insurance Plans" subtitle="Kharif 2026 Season">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PMFBY Kharif Paddy Plan</Text>
        <Text style={styles.highlightText}>₹45,000 / Acre Coverage</Text>
        <Text style={styles.bodyText}>Farmer Premium: 2% (₹900/acre)</Text>
        <Text style={styles.bodyText}>Govt Subsidy: 98% (Supported by Centre & Karnataka)</Text>

        <TouchableOpacity
          onPress={() => open("insuranceApplication")}
          style={[styles.primaryBtn, { marginTop: 14 }]}
        >
          <Text style={styles.primaryBtnText}>Select & Apply</Text>
        </TouchableOpacity>
      </View>
    </DetailShell>
  )
}

/* 3. Insurance Application Screen */
export function InsuranceApplicationScreen() {
  const { open } = useNav()
  const [surveyNo, setSurveyNo] = useState("142/2A")

  return (
    <DetailShell
      title="Insurance Application"
      subtitle="Step 1 of 3: Land & Crop Registration"
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={() => open("applicationStatus")}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.label}>Survey Number (Pahani)</Text>
        <TextInput
          value={surveyNo}
          onChangeText={setSurveyNo}
          style={styles.input}
        />
        <Text style={[styles.label, { marginTop: 12 }]}>Aadhaar Number</Text>
        <TextInput
          value="XXXX-XXXX-9281"
          editable={false}
          style={[styles.input, { backgroundColor: "#f3f4f6" }]}
        />
      </View>
    </DetailShell>
  )
}

/* 4. Application Status Screen */
export function ApplicationStatusScreen() {
  return (
    <DetailShell title="Application Status" subtitle="PMFBY-2026-KA-991204">
      <View style={styles.card}>
        <View style={styles.eligibleBadge}>
          <Clock size={20} color="#d97706" />
          <Text style={[styles.eligibleTitle, { color: "#d97706" }]}>Under Review</Text>
        </View>
        <Text style={styles.bodyText}>
          Your document verification is in progress with the Mandya District Agriculture Department. Policy issuance expected in 24 hours.
        </Text>
      </View>
    </DetailShell>
  )
}

/* 5. Policy Screen */
export function PolicyScreen() {
  const { policies } = useInsurance()
  const p = policies[0]

  return (
    <DetailShell title="Policy Certificate" subtitle={p?.policyNumber}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PMFBY Kharif Scheme</Text>
        <Text style={styles.highlightText}>Sum Insured: ₹{p ? p.coverage.toLocaleString() : "45,000"}</Text>
        <Text style={styles.bodyText}>Insured Crop: {p?.crop}</Text>
        <Text style={styles.bodyText}>Validity: Until {p?.endDate}</Text>
      </View>
    </DetailShell>
  )
}

/* 6. Claim Home Screen */
export function ClaimHomeScreen() {
  const { open } = useNav()
  return (
    <DetailShell title="Insurance Claims" subtitle="File or track crop loss claims">
      <TouchableOpacity
        onPress={() => open("reportCropLoss")}
        style={styles.lossBanner}
      >
        <AlertTriangle size={24} color="#dc2626" />
        <View style={{ flex: 1 }}>
          <Text style={styles.lossTitle}>Report Crop Damage</Text>
          <Text style={styles.lossSub}>File loss within 72 hours of damage event</Text>
        </View>
        <ChevronRight size={18} color="#dc2626" />
      </TouchableOpacity>
    </DetailShell>
  )
}

/* 7. Report Crop Loss Screen */
export function ReportCropLossScreen() {
  const { open } = useNav()
  const [lossType, setLossType] = useState("Drought / Water Deficit")

  return (
    <DetailShell
      title="Report Crop Loss"
      subtitle="Intimation under PMFBY guidelines"
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={() => open("claimTracking")}
            style={[styles.primaryBtn, { backgroundColor: "#dc2626" }]}
          >
            <Text style={styles.primaryBtnText}>Submit Loss Intimation</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.label}>Cause of Crop Damage</Text>
        <TextInput
          value={lossType}
          onChangeText={setLossType}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Damage Proof (Geotagged Photo)</Text>
        <View style={styles.uploadBox}>
          <Upload size={24} color="#6b7280" />
          <Text style={styles.uploadText}>Tap to capture / upload crop photo</Text>
        </View>
      </View>
    </DetailShell>
  )
}

/* 8. Claim Tracking Screen */
export function ClaimTrackingScreen() {
  return (
    <DetailShell title="Claim Tracking" subtitle="Claim ID: CLM-84920">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Surveyor Assigned</Text>
        <Text style={styles.bodyText}>
          Government appointed crop loss surveyor will visit Mandya field on Oct 2nd for geo-tagged inspection.
        </Text>
      </View>
    </DetailShell>
  )
}

/* 9. Claim Details Screen */
export function ClaimDetailsScreen() {
  return (
    <DetailShell title="Claim Details">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Claim Summary</Text>
        <Text style={styles.bodyText}>Estimated Payout: ₹28,500</Text>
      </View>
    </DetailShell>
  )
}

/* 10. Insurance Documents Screen */
export function InsuranceDocumentsScreen() {
  return (
    <DetailShell title="Insurance Documents" subtitle="Stored KYC & Land Certificates">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aadhaar Card (Linked)</Text>
        <Text style={styles.bodyText}>Verified via UIDAI</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>RTC / Pahani (Mandya Plot 142)</Text>
        <Text style={styles.bodyText}>Verified via Karnataka Bhoomi Portal</Text>
      </View>
    </DetailShell>
  )
}

/* 11. Important Dates Screen */
export function ImportantDatesScreen() {
  return (
    <DetailShell title="Important Deadlines" subtitle="PMFBY Cut-Off Calendar">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kharif Enrollment Deadline</Text>
        <Text style={styles.highlightText}>July 31, 2026</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Loss Intimation Window</Text>
        <Text style={styles.bodyText}>Within 72 hours of flood, hail, or drought event</Text>
      </View>
    </DetailShell>
  )
}

/* 12. Insurance Help Screen */
export function InsuranceHelpScreen() {
  return (
    <DetailShell title="Insurance Support" subtitle="PMFBY Farmer Helpline">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>National Crop Insurance Helpline</Text>
        <Text style={styles.highlightText}>14447 (Toll-Free)</Text>
        <Text style={styles.bodyText}>Available in Kannada, English, and Hindi</Text>
      </View>
    </DetailShell>
  )
}

/* 13. Insurance Dashboard Screen */
export function InsuranceDashboardScreen() {
  const { policies, claims } = useInsurance()

  return (
    <DetailShell title="Insurance Dashboard" subtitle="Portfolio Overview">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Policies: {policies.length}</Text>
        <Text style={styles.highlightText}>Total Coverage: ₹45,000</Text>
        <Text style={styles.bodyText}>Open Claims: {claims.length}</Text>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  highlightText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#256428",
    marginVertical: 4,
  },
  bodyText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 4,
  },
  eligibleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  eligibleTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#16a34a",
  },
  footerWrap: {
    padding: 18,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  primaryBtn: {
    backgroundColor: "#256428",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f9fafb",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
  },
  uploadText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  lossBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#fecaca",
  },
  lossTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#991b1b",
  },
  lossSub: {
    fontSize: 12,
    color: "#7f1d1d",
    marginTop: 2,
  },
})
