import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Image,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import { useNav } from "../nav"
import {
  APP_STATUS_STEPS,
  CLAIM_STATUS_STEPS,
  RichText,
  getSeasonPremiumRate,
  useInsurance,
} from "../insurance"
import { useProfile } from "../profile"
import { fmt, useLang } from "../i18n"
import DetailShell from "./DetailShell"
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Upload,
  Phone,
  Bell,
  FileText,
  ShieldCheck,
  Calendar,
} from "lucide-react-native"

const SEASONS = [
  { id: "Kharif", en: "Kharif (2%)", kn: "ಮುಂಗಾರು (2%)", rate: 0.02 },
  { id: "Rabi", en: "Rabi (1.5%)", kn: "ಹಿಂಗಾರು (1.5%)", rate: 0.015 },
  { id: "Commercial", en: "Commercial / Horti (5%)", kn: "ವಾಣಿಜ್ಯ / ತೋಟಗಾರಿಕೆ (5%)", rate: 0.05 },
] as const

const OWNERSHIP_OPTIONS = ["Owned", "Tenant", "Sharecropper"] as const

function localizeSeason(season: string, isKn: boolean): string {
  if (!isKn) return season
  const s = season.toLowerCase()
  if (s.includes("rabi")) return "ಹಿಂಗಾರು"
  if (s.includes("comm") || s.includes("hort")) return "ವಾಣಿಜ್ಯ"
  return "ಮುಂಗಾರು"
}

function localizeCrop(crop: string, cropMap: Record<string, string>): string {
  return cropMap[crop] || crop
}

/* 1. Eligibility Screen */
export function EligibilityScreen() {
  const { open } = useNav()
  const { setEligibilityResult } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const insText = t.x.insurance.elig

  const acres = parseFloat(String(profile.farmSize || "0"))
  const hasAcres = Number.isFinite(acres) && acres > 0
  const hasDistrict = Boolean(profile.district && profile.district.trim().length > 0)
  const hasCrops = Array.isArray(profile.crops) && profile.crops.length > 0
  const hasMobile = /^\d{10}$/.test(String(profile.mobile || "").replace(/\D/g, ""))
  const isEligible = hasAcres && hasDistrict && hasCrops

  useEffect(() => {
    setEligibilityResult(isEligible ? "eligible" : "needs_info")
  }, [isEligible, setEligibilityResult])

  const [selectedSeason, setSelectedSeason] = useState<string>("Kharif")
  const [selectedCrop, setSelectedCrop] = useState<string>(profile.crops[0] || "Rice")

  const ratePct = Math.round(getSeasonPremiumRate(selectedSeason) * 1000) / 10
  const subsidyPct = Math.round((100 - ratePct) * 10) / 10
  const cropsLabel = (hasCrops ? profile.crops : ["Rice"])
    .map((c) => localizeCrop(c, cropMap))
    .join(", ")

  return (
    <DetailShell
      title={t.ins.checkEligibility}
      subtitle="Pradhan Mantri Fasal Bima Yojana"
      footer={
        <View
          style={[
            styles.footerWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          {isEligible ? (
            <TouchableOpacity
              onPress={() =>
                open("insurancePlan", { selectedCrop, selectedSeason })
              }
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>
                {isKn ? "ವಿಮಾ ಯೋಜನೆಗಳು ಮತ್ತು ಕಂತು ನೋಡಿ" : "View Plans & Apply"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => open("editProfile")}
              style={[styles.primaryBtn, { backgroundColor: "#d97706" }]}
            >
              <Text style={styles.primaryBtnText}>
                {isKn ? "ರೈತ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ" : "Complete Farmer Profile"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.eligibleBadge}>
          {isEligible ? (
            <CheckCircle2 size={20} color="#16a34a" />
          ) : (
            <AlertTriangle size={20} color="#d97706" />
          )}
          <Text
            style={[
              styles.eligibleTitle,
              !isEligible && { color: "#b45309" },
            ]}
          >
            {isEligible
              ? isKn
                ? "ನೀವು PMFBY ಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ!"
                : "You are Eligible for PMFBY!"
              : isKn
              ? "ಹೆಚ್ಚಿನ ಜಮೀನು ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ"
              : "More Farm Information Needed"}
          </Text>
        </View>

        <Text style={styles.bodyText}>
          {isEligible
            ? isKn
              ? `${profile.district} ಜಿಲ್ಲೆಯಲ್ಲಿನ ನಿಮ್ಮ ${profile.farmSize} ಎಕರೆ ಜಮೀನು ಮತ್ತು ಬೆಳೆಗಳ (${cropsLabel}) ಆಧಾರದ ಮೇಲೆ ನೀವು PMFBY ಸಬ್ಸಿಡಿ ಬೆಳೆ ವಿಮೆಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ.`
              : `Based on your ${profile.farmSize} acres in ${profile.district} District and registered crops (${cropsLabel}), you qualify for subsidized PMFBY crop insurance.`
            : isKn
            ? "ಅರ್ಹತೆ ಖಚಿತಪಡಿಸಲು ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಜಿಲ್ಲೆ, ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ) ಮತ್ತು ಕನಿಷ್ಠ ಒಂದು ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ."
            : "Please ensure District, Land Area (acres), and at least one crop are filled in your profile to calculate PMFBY eligibility."}
        </Text>

        {/* Verification Checklist */}
        <View style={styles.checklistWrap}>
          {[
            {
              ok: hasDistrict,
              label: isKn
                ? `ಜಿಲ್ಲೆ: ${profile.district || "ಖಾಲಿ"}`
                : `Notified District: ${profile.district || "Missing"}`,
            },
            {
              ok: hasAcres,
              label: isKn
                ? `ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ: ${hasAcres ? profile.farmSize + " ಎಕರೆ" : "ಅಗತ್ಯವಿದೆ"}`
                : `Land Area: ${hasAcres ? profile.farmSize + " acres" : "Missing"}`,
            },
            {
              ok: hasCrops,
              label: isKn
                ? `ಬೆಳೆಗಳು: ${hasCrops ? cropsLabel : "ಸೇರಿಸಿಲ್ಲ"}`
                : `Notified Crops: ${hasCrops ? cropsLabel : "Missing"}`,
            },
            {
              ok: hasMobile && Boolean(profile.rtcVerified),
              label: profile.rtcVerified
                ? isKn
                  ? "RTC / ಪಹಣಿ ಮತ್ತು ಮೊಬೈಲ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ"
                  : "RTC / Pahani & Mobile Verified"
                : isKn
                ? "ಅರ್ಜಿ ಸಮಯದಲ್ಲಿ ಸರ್ವೆ ಸಂಖ್ಯೆ / ಪಹಣಿ ನಮೂದಿಸಿ"
                : "Enter Survey No. / RTC during application",
            },
          ].map((item, idx) => (
            <View key={idx} style={styles.checkRow}>
              <CheckCircle2
                size={15}
                color={item.ok ? "#16a34a" : "#d97706"}
              />
              <Text style={styles.checkRowText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Season & Crop Preview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{insText.whatYouGet}</Text>
        <Text style={[styles.label, { marginTop: 10 }]}>
          {insText.season}
        </Text>
        <View style={styles.pillRow}>
          {SEASONS.map((s) => {
            const active = selectedSeason === s.id
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSeason(s.id)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {isKn ? s.kn : s.en}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {hasCrops ? (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>{insText.crop}</Text>
            <View style={styles.pillRow}>
              {profile.crops.map((c) => {
                const active = selectedCrop === c
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedCrop(c)}
                    style={[styles.choicePill, active && styles.choicePillActive]}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        active && styles.choicePillTextActive,
                      ]}
                    >
                      {localizeCrop(c, cropMap)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        ) : null}

        <View style={styles.subsidyBox}>
          <Text style={styles.subsidyText}>
            {isKn
              ? `ರೈತರ ಕಂತು: ${ratePct}% · ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ: ${subsidyPct}%`
              : `Farmer Share: ${ratePct}% · Govt Subsidy: ${subsidyPct}%`}
          </Text>
        </View>

        {insText.benefits.map((b, i) => (
          <View key={i} style={[styles.checkRow, { marginTop: 6 }]}>
            <ShieldCheck size={14} color="#256428" />
            <Text style={styles.checkRowText}>{b}</Text>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

/* 2. Insurance Plan Screen */
export function InsurancePlanScreen() {
  const { open, params } = useNav()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const currentYear = new Date().getFullYear()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const cropChoices = profile.crops.length > 0 ? profile.crops : ["Rice", "Ragi", "Tomato"]

  const [selectedSeason, setSelectedSeason] = useState<string>(
    params?.selectedSeason || "Kharif"
  )
  const [selectedCrop, setSelectedCrop] = useState<string>(
    params?.selectedCrop || cropChoices[0] || "Rice"
  )

  const acres = Math.max(0.1, parseFloat(String(profile.farmSize)) || 2.0)
  const rate = getSeasonPremiumRate(selectedSeason)
  const ratePct = Math.round(rate * 1000) / 10
  const subsidyPct = Math.round((100 - ratePct) * 10) / 10
  const coverage = Math.round(acres * 45000)
  const premium = Math.round(coverage * rate)
  const perAcrePremium = Math.round(45000 * rate)

  return (
    <DetailShell
      title={isKn ? "ಲಭ್ಯವಿರುವ ವಿಮಾ ಯೋಜನೆಗಳು" : "Available Insurance Plans"}
      subtitle={`${localizeSeason(selectedSeason, isKn)} ${currentYear}`}
    >
      {/* Season & Crop Selectors */}
      <View style={styles.card}>
        <Text style={styles.label}>
          {isKn ? "ಹಂಗಾಮು ಆಯ್ಕೆಮಾಡಿ" : "Select Crop Season"}
        </Text>
        <View style={styles.pillRow}>
          {SEASONS.map((s) => {
            const active = selectedSeason === s.id
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSeason(s.id)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {isKn ? s.kn : s.en}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ವಿಮೆ ಮಾಡಬೇಕಾದ ಬೆಳೆ" : "Select Crop to Insure"}
        </Text>
        <View style={styles.pillRow}>
          {cropChoices.map((c) => {
            const active = selectedCrop === c
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedCrop(c)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {localizeCrop(c, cropMap)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Plan Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn
            ? `PMFBY ${localizeSeason(selectedSeason, true)} ${localizeCrop(selectedCrop, cropMap)} ಯೋಜನೆ`
            : `PMFBY ${selectedSeason} ${selectedCrop} Plan`}
        </Text>
        <Text style={styles.highlightText}>
          ₹{coverage.toLocaleString("en-IN")} ({acres} {isKn ? "ಎಕರೆ" : "acres"})
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? `ರೈತರ ಕಂತು (${ratePct}%): ₹${premium.toLocaleString("en-IN")} (₹${perAcrePremium.toLocaleString("en-IN")}/ಎಕರೆ)`
            : `Farmer Premium (${ratePct}%): ₹${premium.toLocaleString("en-IN")} (₹${perAcrePremium.toLocaleString("en-IN")}/acre)`}
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? `ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿ: ${subsidyPct}% (ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರ)`
            : `Govt Subsidy: ${subsidyPct}% (Centre & Karnataka State Share)`}
        </Text>

        <View style={styles.checklistWrap}>
          {t.x.insurance.plan.coverage.items.map((item, idx) => (
            <View key={idx} style={styles.checkRow}>
              <CheckCircle2 size={14} color="#16a34a" />
              <Text style={styles.checkRowText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() =>
            open("insuranceApplication", {
              selectedCrop,
              selectedSeason,
            })
          }
          style={[styles.primaryBtn, { marginTop: 14 }]}
        >
          <Text style={styles.primaryBtnText}>
            {isKn ? "ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" : "Select & Apply"}
          </Text>
        </TouchableOpacity>
      </View>
    </DetailShell>
  )
}

/* 3. Insurance Application Screen */
export function InsuranceApplicationScreen() {
  const { open, params } = useNav()
  const { submitApplication } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const ownMap = (t.x.insurance.ownership as Record<string, string>) || {}

  const cropChoices = profile.crops.length > 0 ? profile.crops : ["Rice", "Ragi", "Tomato"]

  const [surveyNo, setSurveyNo] = useState("")
  const [selectedCrop, setSelectedCrop] = useState<string>(
    params?.selectedCrop || cropChoices[0] || "Rice"
  )
  const [selectedSeason, setSelectedSeason] = useState<string>(
    params?.selectedSeason || "Kharif"
  )
  const [ownershipType, setOwnershipType] = useState<string>("Owned")
  const [areaText, setAreaText] = useState<string>(String(profile.farmSize || "2.0"))
  const [sowingDate, setSowingDate] = useState<string>(
    new Date().toLocaleDateString("en-IN")
  )

  const acres = Math.max(0.1, parseFloat(areaText) || 2.0)
  const rate = getSeasonPremiumRate(selectedSeason)
  const coverage = Math.round(acres * 45000)
  const premium = Math.round(coverage * rate)

  function handleSubmit() {
    if (!surveyNo.trim()) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Required",
        isKn
          ? "ದಯವಿಟ್ಟು ಸರ್ವೆ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ"
          : "Please enter your Land Survey Number."
      )
      return
    }
    const parsedArea = parseFloat(areaText)
    if (!Number.isFinite(parsedArea) || parsedArea <= 0) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Invalid Area",
        isKn
          ? "ದಯವಿಟ್ಟು ಸರಿಯಾದ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ) ನಮೂದಿಸಿ"
          : "Please enter a valid positive acreage."
      )
      return
    }
    const appId = submitApplication({
      crop: selectedCrop,
      season: selectedSeason,
      district: profile.district,
      taluk: profile.taluk,
      area: areaText.trim(),
      farmerName: profile.name,
      mobile: profile.mobile,
      surveyNumber: surveyNo.trim(),
      ownershipType,
      sowingDate: sowingDate.trim() || new Date().toLocaleDateString("en-IN"),
    })
    open("applicationStatus", { applicationId: appId })
  }

  return (
    <DetailShell
      title={isKn ? "ಬೆಳೆ ವಿಮೆ ಅರ್ಜಿ" : "Insurance Application"}
      subtitle={isKn ? "ಭೂಮಿ ಮತ್ತು ಬೆಳೆ ನೋಂದಣಿ" : "Land & Crop Registration"}
      footer={
        <View
          style={[
            styles.footerWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity onPress={handleSubmit} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>{t.ins.submitApp}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.label}>
          {isKn ? "ಸರ್ವೆ ಸಂಖ್ಯೆ (ಪಹಣಿ / RTC)" : "Survey Number (Pahani / RTC)"}
        </Text>
        <TextInput
          value={surveyNo}
          onChangeText={setSurveyNo}
          placeholder={isKn ? "ಉದಾ: 142/2A" : "e.g. 142/2A"}
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಹಂಗಾಮು" : "Season"}
        </Text>
        <View style={styles.pillRow}>
          {SEASONS.map((s) => {
            const active = selectedSeason === s.id
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSeason(s.id)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {isKn ? s.kn : s.en}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ" : "Crop"}
        </Text>
        <View style={styles.pillRow}>
          {cropChoices.map((c) => {
            const active = selectedCrop === c
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedCrop(c)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {localizeCrop(c, cropMap)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ವಿಮೆ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)" : "Insured Land Area (Acres)"}
        </Text>
        <TextInput
          value={areaText}
          onChangeText={setAreaText}
          keyboardType="decimal-pad"
          placeholder="2.0"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಜಮೀನಿನ ಮಾಲೀಕತ್ವ" : "Land Ownership"}
        </Text>
        <View style={styles.pillRow}>
          {OWNERSHIP_OPTIONS.map((own) => {
            const active = ownershipType === own
            return (
              <TouchableOpacity
                key={own}
                onPress={() => setOwnershipType(own)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {ownMap[own] || own}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಬಿತ್ತನೆ ದಿನಾಂಕ" : "Sowing Date"}
        </Text>
        <TextInput
          value={sowingDate}
          onChangeText={setSowingDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />

        <View style={styles.subsidyBox}>
          <Text style={styles.subsidyText}>
            {isKn
              ? `ಅಂದಾಜು ವಿಮಾ ರಕ್ಷಣೆ: ₹${coverage.toLocaleString("en-IN")} · ರೈತರ ಕಂತು: ₹${premium.toLocaleString("en-IN")}`
              : `Sum Insured: ₹${coverage.toLocaleString("en-IN")} · Farmer Premium: ₹${premium.toLocaleString("en-IN")}`}
          </Text>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ನೋಂದಾಯಿತ ಮೊಬೈಲ್ & ಜಿಲ್ಲೆ" : "Registered Mobile & District"}
        </Text>
        <TextInput
          value={`+91 ${profile.mobile} · ${profile.district}`}
          editable={false}
          style={[styles.input, { backgroundColor: "#f3f4f6" }]}
        />
      </View>
    </DetailShell>
  )
}

/* 4. Application Status Screen */
export function ApplicationStatusScreen() {
  const { open, params } = useNav()
  const { applications, policies, advanceApplicationStatus } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const currentYear = new Date().getFullYear()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const appStepsMap = t.x.insurance.appSteps as Record<string, string>

  const app =
    (params?.applicationId
      ? applications.find((a) => a.id === params.applicationId)
      : undefined) || applications[0]

  const issuedPolicy = app
    ? policies.find((p) => p.applicationId === app.id)
    : undefined

  const statusLabel = app
    ? (t.x.coreB.insurance.status as Record<string, string>)[app.status] ||
      (t.x.insurance.appStatus as Record<string, string>)[app.status] ||
      app.status.replace(/_/g, " ")
    : ""

  const currentStepIdx = app
    ? Math.max(
        0,
        APP_STATUS_STEPS.findIndex((s) => s.key === app.status)
      )
    : 0

  return (
    <DetailShell
      title={isKn ? "ಅರ್ಜಿ ಸ್ಥಿತಿ" : "Application Status"}
      subtitle={app ? `PMFBY-${app.id.toUpperCase()}` : `PMFBY-${currentYear}-KA`}
    >
      {app ? (
        <>
          <View style={styles.card}>
            <View style={styles.eligibleBadge}>
              {app.status === "policy_issued" ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <Clock size={20} color="#256428" />
              )}
              <Text
                style={[
                  styles.eligibleTitle,
                  app.status === "policy_issued" && { color: "#16a34a" },
                ]}
              >
                {statusLabel}
              </Text>
            </View>
            <Text style={styles.bodyText}>
              {isKn
                ? `ರೈತ: ${app.farmerName} · ಬೆಳೆ: ${localizeCrop(app.crop, cropMap)} (${localizeSeason(app.season, true)})`
                : `Farmer: ${app.farmerName} · Crop: ${app.crop} (${app.season})`}
            </Text>
            <Text style={styles.bodyText}>
              {isKn
                ? `ಸರ್ವೆ ನಂ: ${app.surveyNumber} · ವಿಸ್ತೀರ್ಣ: ${app.area} ಎಕರೆ (${app.district})`
                : `Survey No: ${app.surveyNumber} · Area: ${app.area} ac (${app.district})`}
            </Text>
            <Text style={styles.bodyText}>
              {isKn
                ? `ವಿಮಾ ರಕ್ಷಣೆ: ₹${app.coverage.toLocaleString("en-IN")} · ಕಂತು: ₹${app.premium.toLocaleString("en-IN")}`
                : `Sum Insured: ₹${app.coverage.toLocaleString("en-IN")} · Premium: ₹${app.premium.toLocaleString("en-IN")}`}
            </Text>

            {app.status !== "policy_issued" ? (
              <TouchableOpacity
                onPress={() => advanceApplicationStatus(app.id)}
                style={[styles.primaryBtn, { marginTop: 14 }]}
              >
                <Text style={styles.primaryBtnText}>
                  {isKn ? "ಮುಂದಿನ ಪರಿಶೀಲನಾ ಹಂತಕ್ಕೆ" : "Advance Verification Step"}
                </Text>
              </TouchableOpacity>
            ) : issuedPolicy ? (
              <TouchableOpacity
                onPress={() =>
                  open("policyDetails", { policyId: issuedPolicy.id })
                }
                style={[styles.primaryBtn, { marginTop: 14 }]}
              >
                <Text style={styles.primaryBtnText}>
                  {isKn ? "ಪಾಲಿಸಿ ಪ್ರಮಾಣಪತ್ರ ನೋಡಿ" : "View Policy Certificate"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Progress Stepper */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t.x.insurance.appStatusScreen.progress}
            </Text>
            <View style={styles.stepperWrap}>
              {APP_STATUS_STEPS.map((st, idx) => {
                const done = idx <= currentStepIdx
                const current = idx === currentStepIdx
                return (
                  <View key={st.key} style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        current && styles.stepDotCurrent,
                      ]}
                    >
                      {done ? (
                        <CheckCircle2 size={14} color="#ffffff" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        done && styles.stepTextDone,
                      ]}
                    >
                      {appStepsMap[st.key] || st.key}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn
              ? `${profile.district} ವಿಭಾಗದಲ್ಲಿ ಸಕ್ರಿಯ ಅರ್ಜಿ ಇಲ್ಲ.`
              : `No submitted application yet for ${profile.district}.`}
          </Text>
          <TouchableOpacity
            onPress={() => open("insurancePlan")}
            style={[styles.primaryBtn, { marginTop: 14 }]}
          >
            <Text style={styles.primaryBtnText}>{t.ins.applyNow}</Text>
          </TouchableOpacity>
        </View>
      )}
    </DetailShell>
  )
}

/* 5. Policy Screen */
export function PolicyScreen() {
  const { open, params } = useNav()
  const { policies } = useInsurance()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const polText = t.x.insurance.policy
  const p =
    (params?.policyId
      ? policies.find((x) => x.id === params.policyId)
      : undefined) || policies[0]

  return (
    <DetailShell
      title={isKn ? "ಪಾಲಿಸಿ ಪ್ರಮಾಣಪತ್ರ" : "Policy Certificate"}
      subtitle={p?.policyNumber}
    >
      {p ? (
        <>
          <View style={styles.card}>
            <View style={styles.eligibleBadge}>
              <ShieldCheck size={20} color="#16a34a" />
              <Text style={styles.cardTitle}>
                {isKn
                  ? `PMFBY ${localizeSeason(p.season, true)} ಯೋಜನೆ`
                  : `PMFBY ${p.season} Scheme`}
              </Text>
            </View>
            <Text style={styles.highlightText}>
              {polText.coverageAmount}: ₹{p.coverage.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.bodyText}>
              {polText.farmerName}: {p.farmerName} ({p.district})
            </Text>
            <Text style={styles.bodyText}>
              {polText.crop}: {localizeCrop(p.crop, cropMap)} ({p.area}{" "}
              {isKn ? "ಎಕರೆ" : "ac"})
            </Text>
            <Text style={styles.bodyText}>
              {polText.season}: {localizeSeason(p.season, isKn)}
            </Text>
            <Text style={styles.bodyText}>
              {polText.premiumAmount}: ₹{p.premium.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.bodyText}>
              {polText.validity}: {p.startDate} – {p.endDate}
            </Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => open("reportCropLoss", { policyId: p.id })}
              style={[styles.primaryBtn, { backgroundColor: "#dc2626" }]}
            >
              <Text style={styles.primaryBtnText}>{t.ins.reportLoss}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => open("insuranceDocuments")}
              style={[styles.secondaryBtn, { marginTop: 10 }]}
            >
              <Text style={styles.secondaryBtnText}>{t.ins.documents}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪಾಲಿಸಿ ಇಲ್ಲ." : "No active policy issued yet."}
          </Text>
          <TouchableOpacity
            onPress={() => open("insurancePlan")}
            style={[styles.primaryBtn, { marginTop: 14 }]}
          >
            <Text style={styles.primaryBtnText}>{t.ins.applyNow}</Text>
          </TouchableOpacity>
        </View>
      )}
    </DetailShell>
  )
}

/* 6. Claim Home Screen */
export function ClaimHomeScreen() {
  const { open } = useNav()
  const { claims, policies } = useInsurance()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const chText = t.x.insurance.claimHome
  const claimPillMap = t.x.insurance.claimPill as Record<string, string>
  const lossMap = t.ins.lossTypes as Record<string, string>

  return (
    <DetailShell
      title={isKn ? "ವಿಮೆ ಕ್ಲೇಮ್‌ಗಳು" : "Insurance Claims"}
      subtitle={chText.subtitle}
    >
      <TouchableOpacity
        onPress={() => open("reportCropLoss")}
        style={styles.lossBanner}
      >
        <AlertTriangle size={24} color="#dc2626" />
        <View style={{ flex: 1 }}>
          <Text style={styles.lossTitle}>{t.ins.reportLoss}</Text>
          <Text style={styles.lossSub}>{chText.warnTitle}</Text>
        </View>
        <ChevronRight size={18} color="#dc2626" />
      </TouchableOpacity>

      {policies.length === 0 ? (
        <View style={[styles.card, { marginTop: 14 }]}>
          <Text style={styles.cardTitle}>{chText.noPolicy}</Text>
          <Text style={styles.bodyText}>
            {isKn
              ? "ನೀವು ನೇರ PMFBY ನಷ್ಟ ವರದಿ ಸಲ್ಲಿಸಬಹುದು ಅಥವಾ ಮೊದಲು ಪಾಲಿಸಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು."
              : "You can still file an emergency PMFBY loss intimation or enroll in a crop insurance plan."}
          </Text>
          <TouchableOpacity
            onPress={() => open("insurancePlan")}
            style={[styles.secondaryBtn, { marginTop: 12 }]}
          >
            <Text style={styles.secondaryBtnText}>{chText.applyIns}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>{chText.myClaims}</Text>
      {claims.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>{chText.emptyHint}</Text>
        </View>
      ) : (
        claims.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => open("claimTracking", { claimId: c.id })}
            activeOpacity={0.85}
            style={styles.card}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{c.claimNumber}</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>
                  {claimPillMap[c.status] || c.status}
                </Text>
              </View>
            </View>
            <Text style={styles.bodyText}>
              {localizeCrop(c.crop, cropMap)} ({c.area} {isKn ? "ಎಕರೆ" : "ac"}) ·{" "}
              {lossMap[c.lossType] || c.lossType}
            </Text>
            <Text style={styles.subtleText}>{c.submittedDate}</Text>
          </TouchableOpacity>
        ))
      )}
    </DetailShell>
  )
}

/* 7. Report Crop Loss Screen */
export function ReportCropLossScreen() {
  const { open, params } = useNav()
  const { policies, submitClaim } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const lossMap = t.ins.lossTypes as Record<string, string>
  const lossKeys = Object.keys(lossMap) as (keyof typeof t.ins.lossTypes)[]

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    params?.policyId || policies[0]?.id || "pmfby-direct"
  )
  const [lossKey, setLossKey] = useState<string>("drought")
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date().toLocaleDateString("en-IN")
  )
  const [affectedArea, setAffectedArea] = useState<string>(
    String(profile.farmSize || "2.0")
  )
  const [notes, setNotes] = useState<string>("")
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const selectedPolicy =
    policies.find((p) => p.id === selectedPolicyId) || policies[0]

  async function handlePickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    })
    if (!res.canceled && res.assets?.[0]?.uri) {
      setPhotoUri(res.assets[0].uri)
    }
  }

  function handleSubmit() {
    const parsedArea = parseFloat(affectedArea)
    if (!Number.isFinite(parsedArea) || parsedArea <= 0) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Required",
        isKn
          ? "ದಯವಿಟ್ಟು ಹಾನಿಗೊಂಡ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ) ನಮೂದಿಸಿ"
          : "Please enter a valid affected acreage."
      )
      return
    }
    const currentYear = new Date().getFullYear()
    const summaryNote = [
      notes.trim() || `${lossMap[lossKey] || lossKey} reported in ${profile.district}`,
      photoUri ? "(photo attached)" : "",
    ]
      .filter(Boolean)
      .join(" ")

    const claimId = submitClaim({
      policyId: selectedPolicy?.id || "pmfby-direct",
      policyNumber: selectedPolicy?.policyNumber || `PMFBY-KA-${currentYear}`,
      crop: selectedPolicy?.crop || profile.crops[0] || "Rice",
      lossType: lossKey,
      incidentDate: incidentDate.trim() || new Date().toLocaleDateString("en-IN"),
      area: affectedArea.trim(),
      description: summaryNote,
    })
    open("claimTracking", { claimId })
  }

  return (
    <DetailShell
      title={t.ins.reportLoss}
      subtitle={
        isKn
          ? "PMFBY ಮಾರ್ಗಸೂಚಿಗಳ ಅಡಿಯಲ್ಲಿ ಮಾಹಿತಿ"
          : "Intimation under PMFBY guidelines"
      }
      footer={
        <View
          style={[
            styles.footerWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.primaryBtn, { backgroundColor: "#dc2626" }]}
          >
            <Text style={styles.primaryBtnText}>{t.ins.submitClaim}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        {policies.length > 0 ? (
          <>
            <Text style={styles.label}>
              {isKn ? "ಪಾಲಿಸಿ ಆಯ್ಕೆಮಾಡಿ" : "Select Policy"}
            </Text>
            <View style={styles.pillRow}>
              {policies.map((p) => {
                const active = (selectedPolicy?.id || "") === p.id
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPolicyId(p.id)}
                    style={[styles.choicePill, active && styles.choicePillActive]}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        active && styles.choicePillTextActive,
                      ]}
                    >
                      {p.policyNumber} ({localizeCrop(p.crop, cropMap)})
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        ) : (
          <View style={styles.warnHintBox}>
            <Text style={styles.warnHintText}>
              {isKn
                ? "ಸಕ್ರಿಯ ಪಾಲಿಸಿ ಕಂಡುಬಂದಿಲ್ಲ — ನೇರ ತುರ್ತು PMFBY ನಷ್ಟ ವರದಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ."
                : "No active policy linked yet — submitting as direct PMFBY emergency loss intimation."}
            </Text>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಬೆಳೆ ಹಾನಿಗೆ ಕಾರಣ" : "Cause of Crop Damage"}
        </Text>
        <View style={styles.pillRow}>
          {lossKeys.map((k) => {
            const active = lossKey === k
            return (
              <TouchableOpacity
                key={k}
                onPress={() => setLossKey(k)}
                style={[styles.choicePill, active && styles.choicePillActive]}
              >
                <Text
                  style={[
                    styles.choicePillText,
                    active && styles.choicePillTextActive,
                  ]}
                >
                  {lossMap[k]}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {t.x.insurance.loss.incidentDate}
        </Text>
        <TextInput
          value={incidentDate}
          onChangeText={setIncidentDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {t.x.insurance.loss.affectedArea}
        </Text>
        <TextInput
          value={affectedArea}
          onChangeText={setAffectedArea}
          keyboardType="decimal-pad"
          placeholder="1.5"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {t.x.insurance.loss.describe}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholder={t.x.insurance.loss.describePh}
          placeholderTextColor="#9ca3af"
          style={[styles.input, { minHeight: 74, textAlignVertical: "top" }]}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>
          {isKn ? "ಹಾನಿಯ ಪುರಾವೆ (ಫೋಟೋ)" : "Damage Proof Photo"}
        </Text>
        <TouchableOpacity onPress={handlePickPhoto} style={styles.uploadBox}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImg} />
          ) : (
            <>
              <Upload size={24} color="#6b7280" />
              <Text style={styles.uploadText}>
                {isKn
                  ? "ಬೆಳೆ ಹಾನಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"
                  : "Tap to attach crop loss photo"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </DetailShell>
  )
}

/* 8. Claim Tracking Screen */
export function ClaimTrackingScreen() {
  const { open, params } = useNav()
  const { claims, advanceClaimStatus } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const lossMap = t.ins.lossTypes as Record<string, string>
  const claimStepsMap = t.x.insurance.claimSteps as Record<string, string>

  const claim =
    (params?.claimId ? claims.find((c) => c.id === params.claimId) : undefined) ||
    claims[0]
  const claimStatusLabel = claim
    ? (t.x.insurance.claimStatus as Record<string, string>)[claim.status] ||
      claim.status.replace(/_/g, " ")
    : ""
  const currentStepIdx = claim
    ? Math.max(
        0,
        CLAIM_STATUS_STEPS.findIndex((s) => s.key === claim.status)
      )
    : 0

  return (
    <DetailShell
      title={isKn ? "ಕ್ಲೇಮ್ ಟ್ರ್ಯಾಕಿಂಗ್" : "Claim Tracking"}
      subtitle={
        claim
          ? `${t.x.insurance.tracking.claimNumber}: ${claim.claimNumber}`
          : "PMFBY Claims"
      }
    >
      {claim ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {localizeCrop(claim.crop, cropMap)} · {claimStatusLabel}
            </Text>
            <Text style={styles.bodyText}>
              {isKn
                ? `${profile.district} ಕೃಷಿ ಇಲಾಖೆಯಿಂದ ${lossMap[claim.lossType] || claim.lossType} ವರದಿ (${claim.submittedDate}) ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ.`
                : `Loss report for ${lossMap[claim.lossType] || claim.lossType} (${claim.submittedDate}) is registered with ${profile.district} Agriculture Dept.`}
            </Text>

            {claim.status !== "completed" ? (
              <TouchableOpacity
                onPress={() => advanceClaimStatus(claim.id)}
                style={[styles.primaryBtn, { marginTop: 14 }]}
              >
                <Text style={styles.primaryBtnText}>
                  {isKn
                    ? "ಮುಂದಿನ ಕ್ಲೇಮ್ ಹಂತಕ್ಕೆ"
                    : "Advance Claim Inspection Stage"}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => open("claimDetails", { claimId: claim.id })}
              style={[styles.secondaryBtn, { marginTop: 10 }]}
            >
              <Text style={styles.secondaryBtnText}>
                {t.x.insurance.tracking.viewFull}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t.x.insurance.tracking.progress}
            </Text>
            <View style={styles.stepperWrap}>
              {CLAIM_STATUS_STEPS.map((st, idx) => {
                const done = idx <= currentStepIdx
                const current = idx === currentStepIdx
                return (
                  <View key={st.key} style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        current && styles.stepDotCurrent,
                      ]}
                    >
                      {done ? (
                        <CheckCircle2 size={14} color="#ffffff" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        done && styles.stepTextDone,
                      ]}
                    >
                      {claimStepsMap[st.key] || st.key}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn
              ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಕ್ಲೇಮ್ ಕಂಡುಬಂದಿಲ್ಲ."
              : "No active claims submitted yet."}
          </Text>
        </View>
      )}
    </DetailShell>
  )
}

/* 9. Claim Details Screen */
export function ClaimDetailsScreen() {
  const { open, params } = useNav()
  const { claims } = useInsurance()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const lossMap = t.ins.lossTypes as Record<string, string>
  const cd = t.x.insurance.claimDetails
  const statusMap = t.x.insurance.claimStatus as Record<string, string>

  const claim =
    (params?.claimId ? claims.find((c) => c.id === params.claimId) : undefined) ||
    claims[0]

  const stageInfo = claim
    ? (cd.info as Record<string, { title: string; body: string }>)[claim.status]
    : undefined

  return (
    <DetailShell title={cd.title}>
      {claim ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {claim.claimNumber} · {statusMap[claim.status] || claim.status}
            </Text>
            <Text style={styles.bodyText}>
              {cd.policyNumber}: {claim.policyNumber}
            </Text>
            <Text style={styles.bodyText}>
              {cd.crop}: {localizeCrop(claim.crop, cropMap)}
            </Text>
            <Text style={styles.bodyText}>
              {cd.lossType}: {lossMap[claim.lossType] || claim.lossType}
            </Text>
            <Text style={styles.bodyText}>
              {cd.incidentDate}: {claim.incidentDate}
            </Text>
            <Text style={styles.bodyText}>
              {cd.affectedArea}: {claim.area} {isKn ? "ಎಕರೆ" : "acres"}
            </Text>
            <Text style={styles.bodyText}>
              {cd.submittedOn}: {claim.submittedDate}
            </Text>
            {claim.description ? (
              <Text style={styles.bodyText}>
                {cd.lossDescription}: {claim.description}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={() => open("claimTracking", { claimId: claim.id })}
              style={[styles.primaryBtn, { marginTop: 14 }]}
            >
              <Text style={styles.primaryBtnText}>{cd.trackProgress}</Text>
            </TouchableOpacity>
          </View>

          {stageInfo ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{stageInfo.title}</Text>
              <Text style={styles.bodyText}>{stageInfo.body}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn ? "ಯಾವುದೇ ಕ್ಲೇಮ್ ದಾಖಲೆ ಇಲ್ಲ." : "No claim record selected."}
          </Text>
        </View>
      )}
    </DetailShell>
  )
}

/* 10. Insurance Documents Screen */
export function InsuranceDocumentsScreen() {
  const { documents, addUploadedDocument } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const docTypes = t.x.insurance.docTypes as Record<string, string>
  const [docTitle, setDocTitle] = useState("")

  async function handleAttachDoc() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    })
    if (!res.canceled && res.assets?.[0]?.uri) {
      const label =
        docTitle.trim() ||
        (isKn ? "ಪೂರಕ KYC / ಪಹಣಿ ದಾಖಲೆ" : "Supporting KYC / RTC Document")
      addUploadedDocument(label)
      setDocTitle("")
      Alert.alert(
        isKn ? "ಅಪ್‌ಲೋಡ್ ಯಶಸ್ವಿ" : "Document Added",
        isKn ? "ದಾಖಲೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಸಲಾಗಿದೆ." : "Supporting document saved."
      )
    }
  }

  return (
    <DetailShell
      title={isKn ? "ವಿಮಾ ದಾಖಲೆಗಳು" : "Insurance Documents"}
      subtitle={t.x.insurance.docs.subtitle}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಆಧಾರ್ ಕಾರ್ಡ್ (ಲಿಂಕ್ ಆಗಿದೆ)" : "Aadhaar Card (Linked)"}
        </Text>
        <Text style={styles.bodyText}>
          {isKn ? "UIDAI ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : "Verified via UIDAI"}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          RTC / Pahani ({profile.district} · {profile.farmSize}{" "}
          {isKn ? "ಎಕರೆ" : "ac"})
        </Text>
        <Text style={styles.bodyText}>
          {isKn ? "ಕರ್ನಾಟಕ ಭೂಮಿ ಪೋರ್ಟಲ್" : "Karnataka Bhoomi Portal"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          {isKn ? "ಹೊಸ ದಾಖಲೆ ಸೇರಿಸಿ" : "Upload Supporting Document"}
        </Text>
        <TextInput
          value={docTitle}
          onChangeText={setDocTitle}
          placeholder={
            isKn
              ? "ದಾಖಲೆಯ ಹೆಸರು (ಉದಾ: ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್)"
              : "Document name (e.g. Bank Passbook)"
          }
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleAttachDoc}
          style={[styles.secondaryBtn, { marginTop: 10, flexDirection: "row", gap: 8 }]}
        >
          <Upload size={16} color="#256428" />
          <Text style={styles.secondaryBtnText}>
            {isKn ? "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಸೇರಿಸಿ" : "Pick Image & Upload"}
          </Text>
        </TouchableOpacity>
      </View>

      {documents.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t.x.insurance.docs.emptyHint}</Text>
        </View>
      ) : (
        documents.map((doc) => (
          <View key={doc.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <FileText size={16} color="#256428" />
                <Text style={styles.cardTitle}>
                  {doc.type === "uploaded" ? doc.name : docTypes[doc.type] || doc.name}
                </Text>
              </View>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>
                  {doc.status === "available"
                    ? isKn
                      ? "ಲಭ್ಯವಿದೆ"
                      : "Available"
                    : isKn
                    ? "ಬಾಕಿ ಇದೆ"
                    : "Pending"}
                </Text>
              </View>
            </View>
            <Text style={styles.bodyText}>{doc.date}</Text>
          </View>
        ))
      )}
    </DetailShell>
  )
}

/* 11. Important Dates Screen */
export function ImportantDatesScreen() {
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const datesText = t.x.insurance.dates

  return (
    <DetailShell
      title={isKn ? "ಪ್ರಮುಖ ದಿನಾಂಕಗಳು" : "Important Deadlines"}
      subtitle={datesText.subtitle}
    >
      {datesText.items.map((item, idx) => (
        <View key={idx} style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Calendar size={16} color="#256428" />
            <Text style={[styles.cardTitle, { flex: 1 }]}>{item.label}</Text>
          </View>
          <Text style={styles.highlightText}>{item.date}</Text>
          <Text style={styles.bodyText}>{item.desc}</Text>
        </View>
      ))}
    </DetailShell>
  )
}

/* 12. Insurance Help Screen */
export function InsuranceHelpScreen() {
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const helpText = t.x.insurance.help

  async function callPmFbyHelpline() {
    try {
      await Linking.openURL("tel:14447")
    } catch {
      Alert.alert(
        "PMFBY Helpline",
        isKn ? "ದಯವಿಟ್ಟು 14447 ಗೆ ಕರೆ ಮಾಡಿ." : "Please dial 14447."
      )
    }
  }

  return (
    <DetailShell
      title={isKn ? "ವಿಮೆ ಸಹಾಯ" : "Insurance Support"}
      subtitle={helpText.subtitle}
    >
      <TouchableOpacity onPress={callPmFbyHelpline} style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn
            ? "ರಾಷ್ಟ್ರೀಯ ಬೆಳೆ ವಿಮೆ ಸಹಾಯವಾಣಿ (ಕರೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ)"
            : "National Crop Insurance Helpline (Tap to Call)"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <Phone size={18} color="#256428" />
          <Text style={styles.highlightText}>
            14447 ({isKn ? "ಉಚಿತ ಕರೆ" : "Toll-Free"})
          </Text>
        </View>
        <Text style={styles.bodyText}>
          {isKn
            ? "ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಹಿಂದಿಯಲ್ಲಿ ಲಭ್ಯವಿದೆ"
            : "Available in Kannada, English, and Hindi"}
        </Text>
      </TouchableOpacity>

      {helpText.faqs.slice(0, 4).map((faq, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.cardTitle}>{faq.q}</Text>
          <Text style={styles.bodyText}>{faq.a}</Text>
        </View>
      ))}
    </DetailShell>
  )
}

/* 13. Insurance Dashboard Screen */
export function InsuranceDashboardScreen() {
  const { open } = useNav()
  const {
    policies,
    applications,
    claims,
    notifications,
    unreadCount,
    markNotifsRead,
  } = useInsurance()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const dash = t.x.insurance.dashboard
  const notifDict = t.x.insurance.notif as Record<string, any>
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const appStatusMap = t.x.insurance.appStatus as Record<string, string>
  const claimPillMap = t.x.insurance.claimPill as Record<string, string>

  const totalCoverage = policies.reduce((acc, p) => acc + p.coverage, 0)

  return (
    <DetailShell
      title={isKn ? "ವಿಮೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Insurance Dashboard"}
      subtitle={dash.subtitle}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {dash.activePolicies}: {policies.length}
        </Text>
        <Text style={styles.highlightText}>
          ₹{totalCoverage.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.bodyText}>
          {dash.applications}: {applications.length} · {dash.claims}: {claims.length}
        </Text>
      </View>

      {/* Unread Banner & Notifications */}
      {notifications.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Bell size={16} color="#256428" />
              <Text style={styles.cardTitle}>
                {isKn ? "ವಿಮಾ ಅಧಿಸೂಚನೆಗಳು" : "Insurance Alerts"} ({unreadCount})
              </Text>
            </View>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={markNotifsRead}>
                <Text style={styles.linkText}>
                  {isKn ? "ಎಲ್ಲಾ ಓದಿದೆ" : "Mark read"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {unreadCount > 0 ? (
            <View style={styles.subsidyBox}>
              <RichText
                text={fmt(
                  unreadCount === 1 ? dash.unreadOne : dash.unreadMany,
                  { n: unreadCount }
                )}
              />
            </View>
          ) : null}
          {notifications.slice(0, 5).map((n) => {
            const tpl = notifDict[n.key]
            const vars = {
              ...n.vars,
              crop: n.vars.crop ? localizeCrop(n.vars.crop, cropMap) : "",
            }
            const title = tpl?.title ? fmt(tpl.title, vars) : n.kind
            const body = tpl?.body ? fmt(tpl.body, vars) : ""
            return (
              <View
                key={n.id}
                style={[styles.notifItem, !n.read && styles.notifUnread]}
              >
                <Text style={styles.notifTitle}>{title}</Text>
                <Text style={styles.bodyText}>{body}</Text>
              </View>
            )
          })}
        </View>
      ) : null}

      {/* Policies List */}
      {policies.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{dash.activePolicies}</Text>
          {policies.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => open("policyDetails", { policyId: p.id })}
              style={styles.card}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{p.policyNumber}</Text>
                <ChevronRight size={16} color="#6b7280" />
              </View>
              <Text style={styles.bodyText}>
                {localizeCrop(p.crop, cropMap)} ({localizeSeason(p.season, isKn)}) · ₹
                {p.coverage.toLocaleString("en-IN")}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      {/* Applications List */}
      {applications.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{dash.applications}</Text>
          {applications.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => open("applicationStatus", { applicationId: a.id })}
              style={styles.card}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>
                  {localizeCrop(a.crop, cropMap)} ({localizeSeason(a.season, isKn)})
                </Text>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>
                    {appStatusMap[a.status] || a.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.bodyText}>
                {a.surveyNumber} · ₹{a.coverage.toLocaleString("en-IN")}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      {/* Claims List */}
      {claims.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{dash.claims}</Text>
          {claims.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => open("claimTracking", { claimId: c.id })}
              style={styles.card}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{c.claimNumber}</Text>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>
                    {claimPillMap[c.status] || c.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.bodyText}>
                {localizeCrop(c.crop, cropMap)} · {c.area}{" "}
                {isKn ? "ಎಕರೆ" : "ac"}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      ) : null}
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 6,
    marginBottom: 10,
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
  subtleText: {
    fontSize: 11.5,
    color: "#9ca3af",
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
  checklistWrap: {
    marginTop: 12,
    gap: 6,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkRowText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  choicePill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  choicePillActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  choicePillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
  },
  choicePillTextActive: {
    color: "#ffffff",
  },
  subsidyBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  subsidyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  warnHintBox: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warnHintText: {
    fontSize: 12.5,
    color: "#92400e",
  },
  footerWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
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
  secondaryBtn: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
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
    padding: 20,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
  },
  previewImg: {
    width: "100%",
    height: 150,
    borderRadius: 12,
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
    marginBottom: 12,
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
  stepperWrap: {
    marginTop: 12,
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: "#256428",
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: "#86efac",
  },
  stepText: {
    fontSize: 13.5,
    color: "#6b7280",
    fontWeight: "500",
  },
  stepTextDone: {
    color: "#111827",
    fontWeight: "700",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusChip: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#166534",
  },
  linkText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#256428",
  },
  notifItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  notifUnread: {
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 12,
    borderTopWidth: 0,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
  },
})
