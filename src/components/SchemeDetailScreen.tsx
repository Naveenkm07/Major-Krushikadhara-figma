import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import DetailShell from "./DetailShell"
import { SCHEMES_CATALOG } from "../data/schemesCatalog"
import {
  callSchemeHelpline,
  evaluateSchemeEligibilityLocal,
  fetchSchemeDetailFromBackend,
  getCachedSchemeById,
  openOfficialPortalUrl,
  parseFarmAcres,
  saveSchemeProgress,
  shareSchemeInfo,
  subscribeSchemes,
  toggleSchemeBookmark,
  type EnrichedScheme,
} from "../api/schemes"
import {
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Globe,
  Landmark,
  PhoneCall,
  Share2,
  Shield,
  Sprout,
  Square,
  CheckSquare,
  Sun,
  Tractor,
  TrendingUp,
} from "lucide-react-native"

function renderSchemeIcon(iconName: EnrichedScheme["iconName"]) {
  switch (iconName) {
    case "Shield":
      return Shield
    case "Sprout":
      return Sprout
    case "Droplets":
      return Droplets
    case "Landmark":
      return Landmark
    case "Sun":
      return Sun
    case "Tractor":
      return Tractor
    case "TrendingUp":
    default:
      return TrendingUp
  }
}

export default function SchemeDetailScreen() {
  const { params } = useNav()
  const { lang } = useLang()
  const { profile } = useProfile()
  const insets = useSafeAreaInsets()
  const isKn = lang === "kn"
  const id = typeof params.id === "string" ? params.id : "pmkisan"

  const initialScheme: EnrichedScheme = useMemo(() => {
    if (params.scheme && (params.scheme as EnrichedScheme).id === id) {
      return params.scheme as EnrichedScheme
    }
    const cached = getCachedSchemeById(id)
    if (cached) return cached
    const fallback = SCHEMES_CATALOG.find((s) => s.id === id) ?? SCHEMES_CATALOG[0]
    return {
      ...fallback,
      eligibilityMatch: evaluateSchemeEligibilityLocal(
        fallback,
        profile.state,
        parseFarmAcres(profile.farmSize)
      ),
      progress: {
        bookmarked: false,
        status: "NOT_APPLIED",
        checkedDocs: [],
        appliedAt: null,
        notes: null,
        updatedAt: null,
      },
    }
  }, [id, params.scheme, profile.state, profile.farmSize])

  const [scheme, setScheme] = useState<EnrichedScheme>(initialScheme)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeSchemes((list) => {
      const updated = list.find((item) => item.id === id)
      if (updated) setScheme(updated)
    })

    void fetchSchemeDetailFromBackend(id, {
      mobile: profile.mobile,
      state: profile.state,
      farmSize: profile.farmSize,
    }).then((fresh) => {
      if (fresh) setScheme(fresh)
    })

    return unsubscribe
  }, [id, profile.mobile, profile.state, profile.farmSize])

  const Icon = renderSchemeIcon(scheme.iconName)
  const isSaved = scheme.progress.bookmarked
  const checkedDocs = scheme.progress.checkedDocs
  const totalDocs = scheme.documents.length
  const checkedCount = checkedDocs.length
  const isApplied =
    scheme.progress.status === "APPLIED" || scheme.progress.status === "APPROVED"

  const farmerMeta = {
    mobile: profile.mobile,
    name: profile.name,
    state: profile.state,
    district: profile.district,
    farmSize: profile.farmSize,
  }

  function handleBookmarkToggle() {
    void toggleSchemeBookmark(scheme.id, farmerMeta)
  }

  function handleToggleDoc(docKey: string) {
    const nextDocs = checkedDocs.includes(docKey)
      ? checkedDocs.filter((k) => k !== docKey)
      : [...checkedDocs, docKey]
    void saveSchemeProgress(scheme.id, { checkedDocs: nextDocs }, farmerMeta)
  }

  async function handleToggleApplied() {
    setSaving(true)
    const nextStatus = isApplied
      ? totalDocs > 0 && checkedCount >= totalDocs
        ? "CHECKLIST_READY"
        : "NOT_APPLIED"
      : "APPLIED"
    await saveSchemeProgress(scheme.id, { status: nextStatus }, farmerMeta)
    setSaving(false)
  }

  async function handleOpenOfficialPortal(
    url: string,
    label: string,
    mode: "inapp" | "external" = "inapp"
  ) {
    await openOfficialPortalUrl(url, label, lang, mode)
  }

  const eligibilityItems = isKn ? scheme.eligibilityKn : scheme.eligibilityEn
  const stepItems = isKn ? scheme.stepsKn : scheme.stepsEn
  const appliedDateText = scheme.progress.appliedAt
    ? new Date(scheme.progress.appliedAt).toLocaleDateString()
    : null

  return (
    <DetailShell
      title={scheme.shortName}
      subtitle={isKn ? scheme.ministryKn : scheme.ministryEn}
      action={
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => void shareSchemeInfo(scheme, lang)}
            style={styles.headerActionBtn}
            activeOpacity={0.75}
            accessibilityLabel={isKn ? "ಹಂಚಿಕೊಳ್ಳಿ" : "Share link"}
          >
            <Share2 size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBookmarkToggle}
            style={styles.headerActionBtn}
            activeOpacity={0.75}
            accessibilityLabel={isKn ? "ಉಳಿಸಿ" : "Bookmark"}
          >
            <Bookmark
              size={18}
              color={isSaved ? "#fde047" : "#ffffff"}
              fill={isSaved ? "#fde047" : "none"}
            />
          </TouchableOpacity>
        </View>
      }
      footer={
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 8, 16) },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              void handleOpenOfficialPortal(
                scheme.officialUrl,
                scheme.portalName,
                "inapp"
              )
            }
            activeOpacity={0.85}
            style={styles.applyBtn}
          >
            <Text style={styles.applyBtnText} numberOfLines={1}>
              {isKn ? "ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ" : "Apply on Official Portal"}
            </Text>
            <ExternalLink size={16} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void handleToggleApplied()}
            disabled={saving}
            activeOpacity={0.85}
            style={[
              styles.markAppliedBtn,
              isApplied && styles.markAppliedBtnDone,
            ]}
          >
            <Check size={16} color={isApplied ? "#ffffff" : "#256428"} />
            <Text
              style={[
                styles.markAppliedText,
                isApplied && styles.markAppliedTextDone,
              ]}
            >
              {isApplied
                ? isKn
                  ? "ಅರ್ಜಿ ಸಲ್ಲಿಸಿದೆ"
                  : "Applied"
                : isKn
                ? "ಅರ್ಜಿ ಗುರುತಿಸಿ"
                : "Mark Applied"}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      {/* Hero Summary Card */}
      <View style={styles.card}>
        <View style={styles.heroTopRow}>
          <View style={[styles.iconCircle, { backgroundColor: scheme.color }]}>
            <Icon size={28} color="#ffffff" />
          </View>
          <View style={styles.heroBadgesCol}>
            <View
              style={[
                styles.levelTag,
                scheme.level === "karnataka"
                  ? styles.karnatakaTag
                  : styles.centralTag,
              ]}
            >
              <Text
                style={[
                  styles.levelTagText,
                  scheme.level === "karnataka"
                    ? styles.karnatakaTagText
                    : styles.centralTagText,
                ]}
              >
                {scheme.level === "karnataka"
                  ? isKn
                    ? "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಯೋಜನೆ"
                    : "Government of Karnataka"
                  : isKn
                  ? "ಭಾರತ ಸರ್ಕಾರದ ಯೋಜನೆ"
                  : "Government of India"}
              </Text>
            </View>

            <View
              style={[
                styles.eligibilityBanner,
                scheme.eligibilityMatch.eligible
                  ? styles.eligibilityBannerOk
                  : styles.eligibilityBannerWarn,
              ]}
            >
              <CheckCircle2
                size={13}
                color={scheme.eligibilityMatch.eligible ? "#15803d" : "#b45309"}
              />
              <Text
                style={[
                  styles.eligibilityBannerText,
                  scheme.eligibilityMatch.eligible
                    ? styles.eligibilityBannerTextOk
                    : styles.eligibilityBannerTextWarn,
                ]}
              >
                {isKn
                  ? scheme.eligibilityMatch.matchLabelKn
                  : scheme.eligibilityMatch.matchLabelEn}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>{isKn ? scheme.nameKn : scheme.nameEn}</Text>
        <Text style={styles.benefitText}>
          {isKn ? "ಸೌಲಭ್ಯ: " : "Benefit: "}
          {isKn ? scheme.benefitAmountKn : scheme.benefitAmountEn}
        </Text>

        <View style={styles.deadlineRow}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.deadlineText}>
            {isKn ? "ಗಡುವು: " : "Deadline: "}
            {isKn ? scheme.deadlineKn : scheme.deadlineEn}
          </Text>
        </View>

        {isApplied && (
          <View style={styles.appliedBanner}>
            <Check size={14} color="#15803d" />
            <Text style={styles.appliedBannerText}>
              {isKn ? "ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ ಎಂದು ದಾಖಲಾಗಿದೆ" : "Tracked as Applied"}
              {appliedDateText ? ` · ${appliedDateText}` : ""}
            </Text>
          </View>
        )}

        <Text style={styles.descText}>
          {isKn ? scheme.overviewKn : scheme.overviewEn}
        </Text>
      </View>

      {/* Verified Official Portals & Helpline Card */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isKn ? "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು" : "Official Government Portals"}
          </Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>
              {isKn ? "ಪರಿಶೀಲಿತ .gov.in" : "Verified Live"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            void handleOpenOfficialPortal(scheme.officialUrl, scheme.portalName)
          }
          activeOpacity={0.82}
          style={styles.portalPrimaryBox}
        >
          <View style={styles.portalInfoCol}>
            <View style={styles.portalNameRow}>
              <Globe size={15} color="#15803d" />
              <Text style={styles.portalNameText}>{scheme.portalName}</Text>
            </View>
            <Text style={styles.portalUrlText} numberOfLines={1}>
              {scheme.officialUrl}
            </Text>
          </View>
          <View style={styles.portalGoPill}>
            <Text style={styles.portalGoText}>{isKn ? "ತೆರೆಯಿರಿ" : "Open"}</Text>
            <ExternalLink size={13} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {scheme.secondaryUrl ? (
          <TouchableOpacity
            onPress={() =>
              void handleOpenOfficialPortal(
                scheme.secondaryUrl!,
                scheme.secondaryPortalName || scheme.secondaryUrl!
              )
            }
            activeOpacity={0.82}
            style={styles.portalSecondaryBox}
          >
            <View style={styles.portalInfoCol}>
              <Text style={styles.secondaryPortalName}>
                {scheme.secondaryPortalName ||
                  (isKn ? "ರಾಜ್ಯ / ಪೂರಕ ಪೋರ್ಟಲ್" : "State / Complementary Portal")}
              </Text>
              <Text style={styles.portalUrlText} numberOfLines={1}>
                {scheme.secondaryUrl}
              </Text>
            </View>
            <ExternalLink size={16} color="#2563eb" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.contactActionsRow}>
          <TouchableOpacity
            onPress={() =>
              void handleOpenOfficialPortal(
                scheme.officialUrl,
                scheme.portalName,
                "external"
              )
            }
            activeOpacity={0.8}
            style={styles.externalBrowserBtn}
          >
            <ExternalLink size={14} color="#1d4ed8" />
            <Text style={styles.externalBrowserBtnText}>
              {isKn ? "ಬ್ರೌಸರ್ ಆಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ" : "Open in Browser App"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              void callSchemeHelpline(scheme.helpline, scheme.shortName, lang)
            }
            activeOpacity={0.8}
            style={styles.helplineBtn}
          >
            <PhoneCall size={14} color="#166534" />
            <Text style={styles.helplineBtnText}>
              {scheme.helpline}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void shareSchemeInfo(scheme, lang)}
            activeOpacity={0.8}
            style={styles.shareBtn}
          >
            <Share2 size={15} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Eligibility Criteria */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {isKn ? "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು" : "Eligibility Criteria"}
        </Text>
        {eligibilityItems.map((line, idx) => (
          <View key={idx} style={styles.reqItem}>
            <Check size={16} color="#16a34a" style={styles.reqIcon} />
            <Text style={styles.reqText}>{line}</Text>
          </View>
        ))}
      </View>

      {/* Interactive Required Documents Checklist */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isKn ? "ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪಟ್ಟಿ" : "Required Documents Checklist"}
          </Text>
          <View style={styles.docProgressPill}>
            <Text style={styles.docProgressText}>
              {checkedCount}/{totalDocs} {isKn ? "ಸಿದ್ಧ" : "Ready"}
            </Text>
          </View>
        </View>
        <Text style={styles.checklistHint}>
          {isKn
            ? "ನಿಮ್ಮ ಬಳಿ ಸಿದ್ಧವಿರುವ ದಾಖಲೆಗಳನ್ನು ಟಿಕ್ ಮಾಡಿ — ಇದು ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಉಳಿಯುತ್ತದೆ."
            : "Tap each document as you prepare it — your progress is saved to your farmer account."}
        </Text>

        {scheme.documents.map((doc) => {
          const checked = checkedDocs.includes(doc.key)
          return (
            <TouchableOpacity
              key={doc.key}
              onPress={() => handleToggleDoc(doc.key)}
              activeOpacity={0.75}
              style={[styles.docRow, checked && styles.docRowChecked]}
            >
              {checked ? (
                <CheckSquare size={18} color="#15803d" />
              ) : (
                <Square size={18} color="#6b7280" />
              )}
              <Text style={[styles.docText, checked && styles.docTextChecked]}>
                {isKn ? doc.labelKn : doc.labelEn}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Step-by-Step How to Apply */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {isKn ? "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತಗಳು" : "How to Apply (Step-by-Step)"}
        </Text>
        {stepItems.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>{idx + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgesCol: {
    flex: 1,
    gap: 6,
  },
  levelTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  karnatakaTag: {
    backgroundColor: "#dcfce7",
  },
  centralTag: {
    backgroundColor: "#e0f2fe",
  },
  levelTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  karnatakaTagText: {
    color: "#166534",
  },
  centralTagText: {
    color: "#0369a1",
  },
  eligibilityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  eligibilityBannerOk: {
    backgroundColor: "#ecfdf5",
  },
  eligibilityBannerWarn: {
    backgroundColor: "#fef3c7",
  },
  eligibilityBannerText: {
    fontSize: 11,
    fontWeight: "600",
  },
  eligibilityBannerTextOk: {
    color: "#15803d",
  },
  eligibilityBannerTextWarn: {
    color: "#92400e",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 25,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#15803d",
    marginTop: 6,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  deadlineText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  appliedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  appliedBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  descText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  portalPrimaryBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  portalInfoCol: {
    flex: 1,
  },
  portalNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  portalNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14532d",
    flex: 1,
  },
  portalUrlText: {
    fontSize: 11,
    color: "#4b5563",
    marginTop: 3,
  },
  portalGoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#15803d",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  portalGoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  portalSecondaryBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    gap: 10,
  },
  secondaryPortalName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e40af",
  },
  contactActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  externalBrowserBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  externalBrowserBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  helplineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  helplineBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  reqItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reqIcon: {
    marginTop: 2,
  },
  reqText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 19,
  },
  docProgressPill: {
    backgroundColor: "#fef9c3",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  docProgressText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#854d0e",
  },
  checklistHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
    lineHeight: 17,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  docRowChecked: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  docText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 18,
  },
  docTextChecked: {
    color: "#14532d",
    fontWeight: "600",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stepText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 10,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 7,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  markAppliedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#256428",
    backgroundColor: "#ffffff",
  },
  markAppliedBtnDone: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  markAppliedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#256428",
  },
  markAppliedTextDone: {
    color: "#ffffff",
  },
})
