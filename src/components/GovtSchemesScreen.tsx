import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLang } from "../i18n"
import { useNav } from "../nav"
import {
  Search,
  Landmark,
  ChevronRight,
  Bookmark,
  Sprout,
  TrendingUp,
  Droplets,
  Shield,
  X,
} from "lucide-react-native"

type Category = "all" | "income" | "insurance" | "credit" | "input"

type Scheme = {
  id: string
  category: Category
  color: string
  icon: typeof Sprout
}

const SCHEMES: Scheme[] = [
  { id: "pmkisan", category: "income", color: "#9333ea", icon: TrendingUp },
  { id: "pmfby", category: "insurance", color: "#0d9488", icon: Shield },
  { id: "kcc", category: "credit", color: "#ea580c", icon: TrendingUp },
  { id: "shc", category: "input", color: "#16a34a", icon: Sprout },
  { id: "pmkmy", category: "income", color: "#db2777", icon: TrendingUp },
  { id: "pmksy", category: "input", color: "#2563eb", icon: Droplets },
  { id: "nfsm", category: "input", color: "#d97706", icon: Sprout },
  { id: "pkvy", category: "input", color: "#65a30d", icon: Sprout },
]

export default function GovtSchemesScreen() {
  const { t } = useLang()
  const { open } = useNav()
  const insets = useSafeAreaInsets()
  const x = t.x.coreB.schemes
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>("all")
  const [savedIds, setSavedIds] = useState<string[]>([])

  function toggleSave(id: string) {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id))
    } else {
      setSavedIds([...savedIds, id])
    }
  }

  const filtered = SCHEMES.filter((s) => {
    if (category !== "all" && s.category !== category) return false
    const item: any = x.items[s.id as keyof typeof x.items]
    if (!item) return true
    if (!query) return true
    const q = query.toLowerCase()
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.eligibility || "").toLowerCase().includes(q) ||
      (item.benefitAmount || "").toLowerCase().includes(q)
    )
  })

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
        <View style={styles.headerTitleRow}>
          <Landmark size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Government Schemes</Text>
        </View>
        <Text style={styles.headerSubtitle}>Central & Karnataka farmer welfare schemes</Text>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Search size={18} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={x.searchPlaceholder || "Search schemes..."}
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.catScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {(["all", "income", "insurance", "credit", "input"] as Category[]).map(
            (cat) => {
              const active = category === cat
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catPill,
                    active && styles.catPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catText,
                      active && styles.catTextActive,
                    ]}
                  >
                    {x.categories[cat] || cat}
                  </Text>
                </TouchableOpacity>
              )
            }
          )}
        </ScrollView>
      </View>

      {/* Schemes List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.schemesList}>
          {filtered.map((s) => {
            const item: any = x.items[s.id as keyof typeof x.items]
            if (!item) return null
            const isSaved = savedIds.includes(s.id)
            const Icon = s.icon
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => open("schemeDetail", { id: s.id })}
                activeOpacity={0.85}
                style={styles.schemeCard}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { backgroundColor: s.color }]}>
                    <Icon size={20} color="#ffffff" />
                  </View>
                  <View style={styles.cardTitleBox}>
                    <Text style={styles.schemeTitle}>{item.name}</Text>
                    <Text style={styles.categoryBadge}>
                      {x.categories[s.category]}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSave(s.id)}
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

                <Text style={styles.schemeDesc} numberOfLines={2}>
                  {item.eligibility}
                </Text>

                <View style={styles.cardBottom}>
                  <View style={styles.benefitBox}>
                    <Text style={styles.benefitLabel}>Benefit:</Text>
                    <Text style={styles.benefitText}>{item.benefitAmount}</Text>
                  </View>
                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>Details</Text>
                    <ChevronRight size={16} color="#256428" />
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
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
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  catScrollWrap: {
    marginTop: 14,
  },
  catScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  catPillActive: {
    backgroundColor: "#256428",
  },
  catText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  catTextActive: {
    color: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
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
  schemeDesc: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
    marginVertical: 10,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
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
    fontWeight: "500",
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "bold",
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
