import { useState } from "react"
import {
  Search,
  Landmark,
  ChevronRight,
  BookmarkPlus,
  Bookmark,
  SlidersHorizontal,
  X,
  Sprout,
  TrendingUp,
  Droplets,
  Shield,
} from "lucide-react"
import { useLang, fmt } from "@/krushika/i18n"
import { useNav } from "@/krushika/nav"

type Category = "all" | "income" | "insurance" | "credit" | "input"
type Scheme = {
  id: string
  category: Category
  color: string
  icon: typeof Sprout
}

const SCHEMES: Scheme[] = [
  {
    id: "pmkisan",
    category: "income",
    color: "from-purple-500 to-purple-700",
    icon: TrendingUp,
  },
  {
    id: "pmfby",
    category: "insurance",
    color: "from-teal-500 to-teal-700",
    icon: Shield,
  },
  {
    id: "kcc",
    category: "credit",
    color: "from-orange-500 to-orange-700",
    icon: TrendingUp,
  },
  {
    id: "shc",
    category: "input",
    color: "from-green-500 to-green-700",
    icon: Sprout,
  },
  {
    id: "pmkmy",
    category: "income",
    color: "from-pink-500 to-pink-700",
    icon: TrendingUp,
  },
  {
    id: "pmksy",
    category: "input",
    color: "from-blue-500 to-blue-700",
    icon: Droplets,
  },
  {
    id: "nfsm",
    category: "input",
    color: "from-amber-500 to-amber-700",
    icon: Sprout,
  },
  {
    id: "pkvy",
    category: "input",
    color: "from-lime-600 to-lime-800",
    icon: Sprout,
  },
]

const CATEGORIES: { id: Category; icon: typeof Sprout }[] = [
  { id: "all", icon: Landmark },
  { id: "income", icon: TrendingUp },
  { id: "insurance", icon: Shield },
  { id: "credit", icon: TrendingUp },
  { id: "input", icon: Sprout },
]

export default function GovtSchemesScreen() {
  const { t } = useLang()
  const x = t.x.coreB.schemes
  const info = (id: string) => x.items[id as keyof typeof x.items]
  const { open } = useNav()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>("all")
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [showFilter, setShowFilter] = useState(false)

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = SCHEMES.filter((s) => {
    const matchesCat = category === "all" || s.category === category
    const q = query.toLowerCase()
    const d = info(s.id)
    const matchesQ =
      !q ||
      d.shortName.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.tags.some((tag) => tag.toLowerCase().includes(q))
    return matchesCat && matchesQ
  })

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-b from-[#2f7d32] to-[#1b5e20] px-5 pb-5 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white shadow-lg">
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t.pages.schemes.title}</h1>
        </div>
        <p className="mt-1 text-sm text-white/80">{t.pages.schemes.subtitle}</p>

        {/* Search bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={x.searchPlaceholder}
              aria-label={x.searchPlaceholder}
              className="w-full rounded-2xl bg-white/20 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm focus:bg-white/25"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label={x.clear}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilter((v) => !v)}
            aria-label={x.filter}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20"
          >
            <SlidersHorizontal className="h-4 w-4 text-white" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4">
        {/* Category filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition active:scale-95 ${
                category === id
                  ? "bg-[#2f7d32] text-white shadow-sm"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {x.categories[id]}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="mb-3 text-xs text-gray-400">
          {fmt(filtered.length === 1 ? x.foundOne : x.found, { n: filtered.length })}
          {savedIds.size > 0 && ` · ${fmt(x.saved, { n: savedIds.size })}`}
        </p>

        {/* DEMO notice */}
        <div className="mb-4 rounded-2xl bg-amber-50 p-3">
          <p className="text-[11px] text-amber-700">
            {x.demo}
          </p>
        </div>

        {/* Scheme cards */}
        <div className="space-y-3">
          {filtered.map((scheme) => {
            const Icon = scheme.icon
            const isSaved = savedIds.has(scheme.id)
            const d = info(scheme.id)
            return (
              <div
                key={scheme.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition active:scale-[0.99]"
              >
                {/* Color band */}
                <div className={`bg-gradient-to-r ${scheme.color} px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                        <Icon className="h-4 w-4 text-white" />
                      </span>
                      <div>
                        <p className="font-bold text-white">{d.shortName}</p>
                        <p className="text-[10px] text-white/70">{d.ministry}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSave(scheme.id)}
                      aria-label={isSaved ? x.unsave : x.save}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition active:scale-90"
                    >
                      {isSaved ? (
                        <Bookmark className="h-4 w-4 fill-white text-white" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="px-4 pb-4 pt-3">
                  <p className="mb-2 text-xs font-medium leading-snug text-gray-500">{d.name}</p>

                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-xs text-gray-400">{t.pages.schemes.eligibility}</dt>
                      <dd className="flex-1 text-xs font-medium text-gray-700">{d.eligibility}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-xs text-gray-400">{t.pages.schemes.benefit}</dt>
                      <dd className="flex-1 text-xs text-gray-700">
                        <span className="font-bold text-gray-900">{d.benefitAmount}</span>
                        {" — "}{d.benefit}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-xs text-gray-400">{t.pages.schemes.deadline}</dt>
                      <dd className="flex-1 text-xs font-medium text-gray-700">{d.deadline}</dd>
                    </div>
                  </dl>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => open("schemeDetail", { schemeId: scheme.id })}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 active:scale-95"
                  >
                    {t.pages.schemes.view} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Landmark className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="font-semibold">{x.emptyTitle}</p>
            <p className="mt-1 text-xs">{x.emptyHint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
