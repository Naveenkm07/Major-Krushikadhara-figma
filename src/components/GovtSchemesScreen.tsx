import { useCallback, useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import { useProfile } from "../profile"
import {
  getCachedSchemes,
  openOfficialPortalUrl,
  subscribeSchemes,
  syncSchemesFromBackend,
  toggleSchemeBookmark,
  type EnrichedScheme,
} from "../api/schemes"
import {
  Search,
  Landmark,
  ChevronRight,
  Bookmark,
  Sprout,
  TrendingUp,
  Droplets,
  Shield,
  Sun,
  Tractor,
  ExternalLink,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react-native"

type FilterTab =
  | "all"
  | "saved"
  | "karnataka"
  | "income"
  | "insurance"
  | "credit"
  | "input"

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

export default function GovtSchemesScreen() {
  const { t, lang } = useLang()
  const { open } = useNav()
  const { profile } = useProfile()
  const insets = useSafeAreaInsets()
  const isKn = lang === "kn"
  const x = t.x.coreB.schemes

  const [schemes, setSchemes] = useState<EnrichedScheme[]>(() => getCachedSchemes())
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [refreshing, setRefreshing] = useState(false)
  const [syncedOnline, setSyncedOnline] = useState<boolean | null>(null)

  const refreshSchemes = useCallback(async () => {
    setRefreshing(true)
    const res = await syncSchemesFromBackend({
      mobile: profile.mobile,
      state: profile.state,
      farmSize: profile.farmSize,
    })
    setSchemes(res.schemes)
    setSyncedOnline(res.ok)
    setRefreshing(false)
  }, [profile.mobile, profile.state, profile.farmSize])

  useEffect(() => {
    const unsubscribe = subscribeSchemes((next) => setSchemes([...next]))
    void refreshSchemes()
    return unsubscribe
  }, [refreshSchemes])

  const counts = useMemo(() => {
    return {
      all: schemes.length,
      saved: schemes.filter((s) => s.progress.bookmarked).length,
      karnataka: schemes.filter((s) => s.level === "karnataka").length,
      eligible: schemes.filter((s) => s.eligibilityMatch.eligible).length,
      applied: schemes.filter(
        (s) => s.progress.status === "APPLIED" || s.progress.status === "APPROVED"
      ).length,
    }
  }, [schemes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return schemes.filter((s) => {
      if (filter === "saved" && !s.progress.bookmarked) return false
      if (filter === "karnataka" && s.level !== "karnataka") return false
      if (
        filter !== "all" &&
        filter !== "saved" &&
        filter !== "karnataka" &&
        s.category !== filter
      ) {
        return false
      }
      if (!q) return true

      const haystack = [
        s.nameEn,
        s.nameKn,
        s.shortName,
        s.ministryEn,
        s.ministryKn,
        s.benefitSummaryEn,
        s.benefitSummaryKn,
        s.benefitAmountEn,
        s.benefitAmountKn,
        s.portalName,
        ...s.tagsEn,
        ...s.tagsKn,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [schemes, filter, query])

  function handleBookmark(id: string) {
    void toggleSchemeBookmark(id, {
      mobile: profile.mobile,
      name: profile.name,
      state: profile.state,
      district: profile.district,
      farmSize: profile.farmSize,
    })
  }

  const filterTabs: Array<{ key: FilterTab; label: string; count?: number }> = [
    { key: "all", label: x.categories.all || "All", count: counts.all },
    {
      key: "saved",
      label: (x.categories as any).saved || (isKn ? "ಉಳಿಸಿದ" : "Saved"),
      count: counts.saved,
    },
    {
      key: "karnataka",
      label: (x.categories as any).karnataka || (isKn ? "ಕರ್ನಾಟಕ" : "Karnataka"),
      count: counts.karnataka,
    },
    { key: "income", label: x.categories.income || "Income" },
    { key: "insurance", label: x.categories.insurance || "Insurance" },
    { key: "credit", label: x.categories.credit || "Credit" },
    { key: "input", label: x.categories.input || "Inputs" },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + 10, 44),
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleRow}>
            <Landmark size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>
              {isKn ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು" : "Government Schemes"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => void refreshSchemes()}
            style={styles.syncPill}
            activeOpacity={0.75}
          >
            <RefreshCw size={12} color="#dcfce7" />
            <Text style={styles.syncPillText}>
              {syncedOnline === false
                ? isKn
                  ? "ಆಫ್‌ಲೈನ್"
                  : "Offline"
                : isKn
                ? "ಅಧಿಕೃತ ಲಿಂಕ್"
                : "Verified URLs"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          {isKn
            ? `ಕೇಂದ್ರ & ${profile.state} ರೈತ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು (${counts.eligible} ಅರ್ಹ)`
            : `Central & ${profile.state} welfare portals · ${counts.eligible} matched`}
        </Text>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Search size={18} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={x.searchPlaceholder || "Search schemes, PM-KISAN, FRUITS..."}
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Personalized Profile Eligibility Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryLeft}>
          <CheckCircle2 size={16} color="#15803d" />
          <Text style={styles.summaryText} numberOfLines={1}>
            {isKn
              ? `${profile.district}, ${profile.farmSize} ಎಕರೆ · ${counts.eligible}/${counts.all} ಯೋಜನೆ ಅರ್ಹ`
              : `${profile.district} · ${profile.farmSize} ac · ${counts.eligible}/${counts.all} eligible`}
          </Text>
        </View>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>
            {isKn ? `${counts.applied} ಅರ್ಜಿ` : `${counts.applied} Applied`}
          </Text>
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.catScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {filterTabs.map((tab) => {
            const active = filter === tab.key
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilter(tab.key)}
                style={[styles.catPill, active && styles.catPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {tab.label}
                  {typeof tab.count === "number" ? ` (${tab.count})` : ""}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Schemes List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshSchemes}
            tintColor="#256428"
            colors={["#256428"]}
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Landmark size={34} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {x.emptyTitle || (isKn ? "ಯಾವುದೇ ಯೋಜನೆ ಸಿಗಲಿಲ್ಲ" : "No schemes found")}
            </Text>
            <Text style={styles.emptyHint}>
              {filter === "saved"
                ? isKn
                  ? "ಬುಕ್‌ಮಾರ್ಕ್ ಐಕಾನ್ ಒತ್ತಿ ಯೋಜನೆಗಳನ್ನು ಇಲ್ಲಿ ಉಳಿಸಿ."
                  : "Tap the bookmark icon on any scheme card to save it here."
                : x.emptyHint || "Try a different search or filter tab"}
            </Text>
          </View>
        ) : (
          <View style={styles.schemesList}>
            {filtered.map((s) => {
              const Icon = renderSchemeIcon(s.iconName)
              const isSaved = s.progress.bookmarked
              const checkedCount = s.progress.checkedDocs.length
              const totalDocs = s.documents.length
              const status = s.progress.status

              return (
                <View key={s.id} style={styles.schemeCard}>
                  <View style={styles.cardTop}>
                    <TouchableOpacity
                      onPress={() => open("schemeDetail", { id: s.id, scheme: s })}
                      activeOpacity={0.8}
                      style={styles.cardHeaderTapArea}
                    >
                      <View style={[styles.iconBox, { backgroundColor: s.color }]}>
                        <Icon size={20} color="#ffffff" />
                      </View>
                      <View style={styles.cardTitleBox}>
                        <Text style={styles.schemeTitle}>
                          {isKn ? s.nameKn : s.nameEn}
                        </Text>
                        <Text style={styles.categoryBadge} numberOfLines={1}>
                          {isKn ? s.ministryKn : s.ministryEn}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleBookmark(s.id)}
                      hitSlop={10}
                      style={styles.bookmarkBtn}
                    >
                      <Bookmark
                        size={20}
                        color={isSaved ? "#256428" : "#9ca3af"}
                        fill={isSaved ? "#256428" : "none"}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => open("schemeDetail", { id: s.id, scheme: s })}
                    activeOpacity={0.85}
                  >
                    {/* Badges Row */}
                    <View style={styles.badgesRow}>
                      <View
                        style={[
                          styles.levelPill,
                          s.level === "karnataka"
                            ? styles.karnatakaPill
                            : styles.centralPill,
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelPillText,
                            s.level === "karnataka"
                              ? styles.karnatakaPillText
                              : styles.centralPillText,
                          ]}
                        >
                          {s.level === "karnataka"
                            ? isKn
                              ? "ಕರ್ನಾಟಕ ಸರ್ಕಾರ"
                              : "Karnataka Govt"
                            : isKn
                            ? "ಕೇಂದ್ರ ಸರ್ಕಾರ"
                            : "Central Govt"}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.matchPill,
                          s.eligibilityMatch.eligible
                            ? styles.matchEligiblePill
                            : styles.matchWarnPill,
                        ]}
                      >
                        <Text
                          style={[
                            styles.matchPillText,
                            s.eligibilityMatch.eligible
                              ? styles.matchEligibleText
                              : styles.matchWarnText,
                          ]}
                        >
                          {isKn
                            ? s.eligibilityMatch.matchLabelKn
                            : s.eligibilityMatch.matchLabelEn}
                        </Text>
                      </View>

                      {(status === "APPLIED" || status === "APPROVED") && (
                        <View style={styles.appliedPill}>
                          <Text style={styles.appliedPillText}>
                            {isKn ? "ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ ✓" : "Applied ✓"}
                          </Text>
                        </View>
                      )}

                      {status === "CHECKLIST_READY" && (
                        <View style={styles.readyPill}>
                          <Text style={styles.readyPillText}>
                            {isKn ? "ದಾಖಲೆ ಸಿದ್ಧ" : "Docs Ready"}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.schemeDesc} numberOfLines={2}>
                      {isKn ? s.benefitSummaryKn : s.benefitSummaryEn}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.benefitBox}>
                        <Text style={styles.benefitLabel}>
                          {isKn ? "ಸೌಲಭ್ಯ:" : "Benefit:"}
                        </Text>
                        <Text style={styles.benefitText} numberOfLines={1}>
                          {isKn ? s.benefitAmountKn : s.benefitAmountEn}
                        </Text>
                      </View>
                      {checkedCount > 0 && (
                        <Text style={styles.docsCountText}>
                          {checkedCount}/{totalDocs} {isKn ? "ದಾಖಲೆ" : "docs"}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Action Footer: Sibling Direct Official Portal + Details */}
                  <View style={styles.cardBottom}>
                    <TouchableOpacity
                      onPress={() =>
                        void openOfficialPortalUrl(
                          s.officialUrl,
                          s.portalName,
                          lang,
                          "inapp"
                        )
                      }
                      activeOpacity={0.8}
                      style={styles.portalActionBtn}
                    >
                      <ExternalLink size={13} color="#15803d" />
                      <Text style={styles.portalActionText} numberOfLines={1}>
                        {isKn ? "ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ" : s.portalName.split(" ")[0]}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => open("schemeDetail", { id: s.id, scheme: s })}
                      activeOpacity={0.8}
                      style={styles.viewDetailsRow}
                    >
                      <Text style={styles.viewDetailsText}>
                        {isKn ? "ವಿವರ ಮತ್ತು ಅರ್ಜಿ" : "Details & Apply"}
                      </Text>
                      <ChevronRight size={16} color="#256428" />
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8ec",
  },
  header: {
    backgroundColor: "#256428",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#ffffff",
  },
  syncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  syncPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dcfce7",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.88)",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
    flex: 1,
  },
  summaryBadge: {
    backgroundColor: "#15803d",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  catScrollWrap: {
    marginTop: 12,
  },
  catScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  catPillActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  catText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  catTextActive: {
    color: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  emptyHint: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  schemesList: {
    gap: 14,
  },
  schemeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  cardHeaderTapArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleBox: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 20,
  },
  categoryBadge: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    fontWeight: "500",
  },
  bookmarkBtn: {
    padding: 4,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  karnatakaPill: {
    backgroundColor: "#dcfce7",
  },
  centralPill: {
    backgroundColor: "#e0f2fe",
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  karnatakaPillText: {
    color: "#166534",
  },
  centralPillText: {
    color: "#0369a1",
  },
  matchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  matchEligiblePill: {
    backgroundColor: "#f3f4f6",
  },
  matchWarnPill: {
    backgroundColor: "#fef3c7",
  },
  matchPillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  matchEligibleText: {
    color: "#374151",
  },
  matchWarnText: {
    color: "#92400e",
  },
  appliedPill: {
    backgroundColor: "#15803d",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  appliedPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  readyPill: {
    backgroundColor: "#fef08a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  readyPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#854d0e",
  },
  schemeDesc: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 9,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10,
    gap: 8,
  },
  benefitBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  benefitLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#15803d",
    flex: 1,
  },
  docsCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 10,
  },
  portalActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: "58%",
  },
  portalActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#256428",
  },
})
