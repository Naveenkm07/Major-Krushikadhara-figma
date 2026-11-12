import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useLang } from "../i18n"
import { useInsurance } from "../insurance"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  ChevronRight,
  AlertTriangle,
} from "lucide-react-native"

export default function CropInsuranceScreen() {
  const { t, lang } = useLang()
  const isKn = lang === "kn"
  const ins = t.ins
  const { policies, applications } = useInsurance()
  const { open } = useNav()

  const activePolicy = policies[0] ?? null
  const latestApp = applications[0] ?? null

  const quickActions = [
    {
      icon: ShieldCheck,
      label: ins.checkEligibility,
      route: "eligibilityCheck" as const,
      bg: "#dcfce7",
      color: "#16a34a",
    },
    {
      icon: FileText,
      label: ins.documents,
      route: "insuranceDocuments" as const,
      bg: "#dbeafe",
      color: "#2563eb",
    },
    {
      icon: CalendarDays,
      label: ins.importantDates,
      route: "importantDates" as const,
      bg: "#fef3c7",
      color: "#d97706",
    },
    {
      icon: HelpCircle,
      label: ins.help,
      route: "insuranceHelp" as const,
      bg: "#f3e8ff",
      color: "#9333ea",
    },
    {
      icon: LayoutDashboard,
      label: ins.dashboard,
      route: "insuranceDashboard" as const,
      bg: "#e0e7ff",
      color: "#4f46e5",
    },
  ]

  return (
    <DetailShell title={ins.title} subtitle={ins.subtitle}>
      {/* Active Policy Card */}
      {activePolicy ? (
        <TouchableOpacity
          onPress={() => open("policyDetails", { policyId: activePolicy.id })}
          activeOpacity={0.88}
          style={styles.policyCard}
        >
          <View style={styles.policyCardTop}>
            <View style={styles.policyBadge}>
              <CheckCircle2 size={14} color="#ffffff" />
              <Text style={styles.policyBadgeText}>
                {isKn ? "ಸಕ್ರಿಯ ಪಾಲಿಸಿ" : "Active Policy"}
              </Text>
            </View>
            <Text style={styles.policyNo}>{activePolicy.policyNumber}</Text>
          </View>

          <Text style={styles.policyScheme}>
            {isKn ? "PMFBY ಮುಂಗಾರು ಬೆಳೆ ವಿಮೆ" : "PMFBY Kharif Crop Insurance"}
          </Text>
          <Text style={styles.policyCrop}>
            {activePolicy.crop} · {activePolicy.season}
          </Text>

          <View style={styles.policyMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>
                {isKn ? "ವಿಮಾ ರಕ್ಷಣೆ" : "Coverage"}
              </Text>
              <Text style={styles.metricValue}>
                ₹{activePolicy.coverage.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>
                {isKn ? "ರೈತರ ಕಂತು" : "Farmer Premium"}
              </Text>
              <Text style={styles.metricValue}>
                ₹{activePolicy.premium.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          <View style={styles.viewPolicyRow}>
            <Text style={styles.viewPolicyText}>{ins.viewPolicy}</Text>
            <ChevronRight size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      ) : latestApp ? (
        <TouchableOpacity
          onPress={() => open("applicationStatus")}
          activeOpacity={0.88}
          style={styles.emptyPolicyCard}
        >
          <Text style={styles.emptyTitle}>
            {isKn
              ? `ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ (${latestApp.crop})`
              : `Application Submitted (${latestApp.crop})`}
          </Text>
          <View style={styles.applyNowBtn}>
            <Text style={styles.applyNowText}>{ins.trackApp}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyPolicyCard}>
          <Text style={styles.emptyTitle}>{ins.noPolicies}</Text>
          <TouchableOpacity
            onPress={() => open("insurancePlan")}
            style={styles.applyNowBtn}
          >
            <Text style={styles.applyNowText}>{ins.applyNow}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Report Loss Alert Banner */}
      <TouchableOpacity
        onPress={() => open("reportCropLoss")}
        activeOpacity={0.85}
        style={styles.lossBanner}
      >
        <View style={styles.lossIconWrap}>
          <AlertTriangle size={22} color="#dc2626" />
        </View>
        <View style={styles.lossTextWrap}>
          <Text style={styles.lossTitle}>{ins.reportLoss}</Text>
          <Text style={styles.lossSubtitle}>
            {isKn
              ? "ತಕ್ಷಣದ ಸಮೀಕ್ಷೆಗಾಗಿ ನೈಸರ್ಗಿಕ ವಿಕೋಪದ 72 ಗಂಟೆಗಳೊಳಗೆ ವರದಿ ಮಾಡಿ"
              : "Report within 72 hrs of natural calamity for immediate claim survey"}
          </Text>
        </View>
        <ChevronRight size={18} color="#dc2626" />
      </TouchableOpacity>

      {/* Quick Action Cards */}
      <Text style={styles.sectionHeader}>
        {isKn ? "ವಿಮಾ ಸೇವೆಗಳು" : "Insurance Services"}
      </Text>
      <View style={styles.servicesGrid}>
        {quickActions.map((act) => (
          <TouchableOpacity
            key={act.route}
            onPress={() => open(act.route)}
            activeOpacity={0.8}
            style={styles.serviceCard}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: act.bg }]}>
              <act.icon size={22} color={act.color} />
            </View>
            <Text style={styles.serviceLabel}>{act.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  policyCard: {
    backgroundColor: "#256428",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0f4a19",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  policyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  policyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  policyBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  policyNo: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  policyScheme: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 14,
  },
  policyCrop: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 3,
  },
  policyMetrics: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 12,
  },
  viewPolicyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 14,
  },
  viewPolicyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  emptyPolicyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 14,
    textAlign: "center",
  },
  applyNowBtn: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  applyNowText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
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
    marginBottom: 20,
  },
  lossIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  lossTextWrap: {
    flex: 1,
  },
  lossTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#991b1b",
  },
  lossSubtitle: {
    fontSize: 11,
    color: "#7f1d1d",
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
})
