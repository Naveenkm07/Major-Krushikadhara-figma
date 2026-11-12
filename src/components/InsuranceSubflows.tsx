import { useState } from "react"
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
import { useInsurance } from "../insurance"
import { useProfile } from "../profile"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Upload,
  Phone,
} from "lucide-react-native"

/* 1. Eligibility Screen */
export function EligibilityScreen() {
  const { open } = useNav()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}
  const cropsLabel = profile.crops.map((c) => cropMap[c] || c).join(", ")

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
          <TouchableOpacity
            onPress={() => open("insuranceApplication")}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>
              {isKn ? "ಅರ್ಜಿಗೆ ಮುಂದುವರಿಯಿರಿ" : "Proceed to Application"}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.eligibleBadge}>
          <CheckCircle2 size={20} color="#16a34a" />
          <Text style={styles.eligibleTitle}>
            {isKn ? "ನೀವು ಅರ್ಹರಾಗಿದ್ದೀರಿ!" : "You are Eligible!"}
          </Text>
        </View>
        <Text style={styles.bodyText}>
          {isKn
            ? `${profile.district} ಜಿಲ್ಲೆಯಲ್ಲಿನ ನಿಮ್ಮ ${profile.farmSize} ಎಕರೆ ಜಮೀನು ಮತ್ತು ಬೆಳೆಗಳ (${cropsLabel}) ಆಧಾರದ ಮೇಲೆ ನೀವು PMFBY ಸಬ್ಸಿಡಿ ಬೆಳೆ ವಿಮೆಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ.`
            : `Based on your ${profile.farmSize} acres in ${profile.district} District and selected crops (${cropsLabel}), you qualify for subsidized PMFBY crop insurance.`}
        </Text>
      </View>
    </DetailShell>
  )
}

/* 2. Insurance Plan Screen */
export function InsurancePlanScreen() {
  const { open } = useNav()
  const { profile } = useProfile()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const acres = parseFloat(profile.farmSize) || 2.0
  const coverage = Math.round(acres * 45000)
  const premium = Math.round(coverage * 0.02)

  return (
    <DetailShell
      title={isKn ? "ಲಭ್ಯವಿರುವ ವಿಮಾ ಯೋಜನೆಗಳು" : "Available Insurance Plans"}
      subtitle={isKn ? "ಮುಂಗಾರು 2026 ಹಂಗಾಮು" : "Kharif 2026 Season"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn
            ? `PMFBY ಮುಂಗಾರು ${profile.crops[0] || "ಭತ್ತ"} ಯೋಜನೆ`
            : `PMFBY Kharif ${profile.crops[0] || "Paddy"} Plan`}
        </Text>
        <Text style={styles.highlightText}>
          ₹{coverage.toLocaleString("en-IN")} ({profile.farmSize} {isKn ? "ಎಕರೆ" : "acres"})
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? `ರೈತರ ಕಂತು (2%): ₹${premium.toLocaleString("en-IN")} (₹900/ಎಕರೆ)`
            : `Farmer Premium (2%): ₹${premium.toLocaleString("en-IN")} (₹900/acre)`}
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? "ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿ: 98% (ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರ)"
            : "Govt Subsidy: 98% (Centre & Karnataka State Share)"}
        </Text>

        <TouchableOpacity
          onPress={() => open("insuranceApplication")}
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
  const { open } = useNav()
  const { submitApplication } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const [surveyNo, setSurveyNo] = useState("142/2A")

  function handleSubmit() {
    if (!surveyNo.trim()) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Required",
        isKn ? "ದಯವಿಟ್ಟು ಸರ್ವೆ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ" : "Please enter your Land Survey Number."
      )
      return
    }
    const appId = submitApplication({
      crop: profile.crops[0] || "Rice",
      season: "Kharif",
      district: profile.district,
      taluk: profile.taluk,
      area: profile.farmSize,
      farmerName: profile.name,
      mobile: profile.mobile,
      surveyNumber: surveyNo.trim(),
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
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಬೆಳೆ ಮತ್ತು ವಿಸ್ತೀರ್ಣ" : "Crop & Insured Area"}
        </Text>
        <TextInput
          value={`${profile.crops[0] || "Rice"} · ${profile.farmSize} acres (${profile.district})`}
          editable={false}
          style={[styles.input, { backgroundColor: "#f3f4f6" }]}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ನೋಂದಾಯಿತ ಮೊಬೈಲ್" : "Registered Mobile"}
        </Text>
        <TextInput
          value={`+91 ${profile.mobile}`}
          editable={false}
          style={[styles.input, { backgroundColor: "#f3f4f6" }]}
        />
      </View>
    </DetailShell>
  )
}

/* 4. Application Status Screen */
export function ApplicationStatusScreen() {
  const { applications, advanceApplicationStatus } = useInsurance()
  const { profile } = useProfile()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const app = applications[0]

  return (
    <DetailShell
      title={isKn ? "ಅರ್ಜಿ ಸ್ಥಿತಿ" : "Application Status"}
      subtitle={app ? `PMFBY-${app.id.toUpperCase()}` : "PMFBY-2026-KA"}
    >
      {app ? (
        <View style={styles.card}>
          <View style={styles.eligibleBadge}>
            <Clock size={20} color="#256428" />
            <Text style={styles.eligibleTitle}>
              {app.status.replace(/_/g, " ").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.bodyText}>
            {isKn
              ? `ರೈತ: ${app.farmerName} · ಬೆಳೆ: ${app.crop} · ಸರ್ವೆ ನಂ: ${app.surveyNumber} (${app.district})`
              : `Farmer: ${app.farmerName} · Crop: ${app.crop} · Survey No: ${app.surveyNumber} (${app.district})`}
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
                {isKn ? "ಮುಂದಿನ ಪರಿಶೀಲನಾ ಹಂತಕ್ಕೆ (ಡೆಮೊ)" : "Advance Verification Step (Demo)"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn
              ? `${profile.district} ವಿಭಾಗದಲ್ಲಿ ಸಕ್ರಿಯ ಅರ್ಜಿ ಇಲ್ಲ.`
              : `No submitted application yet for ${profile.district}.`}
          </Text>
        </View>
      )}
    </DetailShell>
  )
}

/* 5. Policy Screen */
export function PolicyScreen() {
  const { policies } = useInsurance()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const p = policies[0]

  return (
    <DetailShell
      title={isKn ? "ಪಾಲಿಸಿ ಪ್ರಮಾಣಪತ್ರ" : "Policy Certificate"}
      subtitle={p?.policyNumber}
    >
      {p ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isKn ? "PMFBY ಮುಂಗಾರು ಯೋಜನೆ" : "PMFBY Kharif Scheme"}
          </Text>
          <Text style={styles.highlightText}>
            {isKn ? "ವಿಮಾ ಮೊತ್ತ" : "Sum Insured"}: ₹{p.coverage.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.bodyText}>
            {isKn ? "ವಿಮೆ ಮಾಡಿದ ಬೆಳೆ" : "Insured Crop"}: {p.crop} ({p.area} ac)
          </Text>
          <Text style={styles.bodyText}>
            {isKn ? "ಮಾನ್ಯತೆ" : "Validity"}: {p.startDate} – {p.endDate}
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪಾಲಿಸಿ ಇಲ್ಲ." : "No active policy issued yet."}
          </Text>
        </View>
      )}
    </DetailShell>
  )
}

/* 6. Claim Home Screen */
export function ClaimHomeScreen() {
  const { open } = useNav()
  const { lang, t } = useLang()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ವಿಮೆ ಕ್ಲೇಮ್‌ಗಳು" : "Insurance Claims"}
      subtitle={isKn ? "ಬೆಳೆ ನಷ್ಟ ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಿ ಅಥವಾ ಪರಿಶೀಲಿಸಿ" : "File or track crop loss claims"}
    >
      <TouchableOpacity
        onPress={() => open("reportCropLoss")}
        style={styles.lossBanner}
      >
        <AlertTriangle size={24} color="#dc2626" />
        <View style={{ flex: 1 }}>
          <Text style={styles.lossTitle}>{t.ins.reportLoss}</Text>
          <Text style={styles.lossSub}>
            {isKn ? "ಹಾನಿಯಾದ 72 ಗಂಟೆಗಳೊಳಗೆ ವರದಿ ಸಲ್ಲಿಸಿ" : "File loss within 72 hours of damage event"}
          </Text>
        </View>
        <ChevronRight size={18} color="#dc2626" />
      </TouchableOpacity>
    </DetailShell>
  )
}

/* 7. Report Crop Loss Screen */
export function ReportCropLossScreen() {
  const { open } = useNav()
  const { policies, submitClaim } = useInsurance()
  const { profile } = useProfile()
  const { lang, t } = useLang()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const [lossType, setLossType] = useState(isKn ? "ಬರ / ನೀರಿನ ಕೊರತೆ" : "Drought / Water Deficit")
  const [photoUri, setPhotoUri] = useState<string | null>(null)

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
    const active = policies[0]
    const claimId = submitClaim({
      policyId: active?.id || "pmfby-direct",
      policyNumber: active?.policyNumber || "PMFBY-KA-2026",
      crop: active?.crop || profile.crops[0] || "Rice",
      lossType: lossType.trim() || "Weather Damage",
      incidentDate: new Date().toLocaleDateString("en-IN"),
      area: profile.farmSize,
      description: `Reported from ${profile.district}${photoUri ? " (photo attached)" : ""}`,
    })
    open("claimTracking", { claimId })
  }

  return (
    <DetailShell
      title={t.ins.reportLoss}
      subtitle={isKn ? "PMFBY ಮಾರ್ಗಸೂಚಿಗಳ ಅಡಿಯಲ್ಲಿ ಮಾಹಿತಿ" : "Intimation under PMFBY guidelines"}
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
        <Text style={styles.label}>
          {isKn ? "ಬೆಳೆ ಹಾನಿಗೆ ಕಾರಣ" : "Cause of Crop Damage"}
        </Text>
        <TextInput
          value={lossType}
          onChangeText={setLossType}
          style={styles.input}
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
                {isKn ? "ಬೆಳೆ ಹಾನಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" : "Tap to attach crop loss photo"}
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
  const { claims } = useInsurance()
  const { profile } = useProfile()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const claim = claims[0]

  return (
    <DetailShell
      title={isKn ? "ಕ್ಲೇಮ್ ಟ್ರ್ಯಾಕಿಂಗ್" : "Claim Tracking"}
      subtitle={claim ? `${isKn ? "ಕ್ಲೇಮ್ ID" : "Claim ID"}: ${claim.claimNumber}` : "PMFBY Claims"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {claim
            ? `${claim.crop} · ${claim.status.replace(/_/g, " ").toUpperCase()}`
            : isKn
            ? "ಸಮೀಕ್ಷಕರನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ"
            : "Surveyor Assignment Pending"}
        </Text>
        <Text style={styles.bodyText}>
          {claim
            ? isKn
              ? `${profile.district} ಕೃಷಿ ಇಲಾಖೆಯಿಂದ ${claim.lossType} ವರದಿ (${claim.submittedDate}) ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ.`
              : `Loss report for ${claim.lossType} (${claim.submittedDate}) is registered with ${profile.district} Agriculture Dept.`
            : isKn
            ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಕ್ಲೇಮ್ ಕಂಡುಬಂದಿಲ್ಲ."
            : "No active claims submitted yet."}
        </Text>
      </View>
    </DetailShell>
  )
}

/* 9. Claim Details Screen */
export function ClaimDetailsScreen() {
  const { claims } = useInsurance()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const claim = claims[0]

  return (
    <DetailShell title={isKn ? "ಕ್ಲೇಮ್ ವಿವರಗಳು" : "Claim Details"}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಕ್ಲೇಮ್ ಸಾರಾಂಶ" : "Claim Summary"}
        </Text>
        <Text style={styles.bodyText}>
          {claim
            ? `${claim.claimNumber} · ${claim.crop} (${claim.area} ac) · ${claim.lossType}`
            : isKn
            ? "ಯಾವುದೇ ಕ್ಲೇಮ್ ದಾಖಲೆ ಇಲ್ಲ."
            : "No claim record selected."}
        </Text>
      </View>
    </DetailShell>
  )
}

/* 10. Insurance Documents Screen */
export function InsuranceDocumentsScreen() {
  const { documents } = useInsurance()
  const { profile } = useProfile()
  const { lang } = useLang()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ವಿಮಾ ದಾಖಲೆಗಳು" : "Insurance Documents"}
      subtitle={isKn ? "ಸಂಗ್ರಹಿಸಿದ KYC ಮತ್ತು ಭೂ ಪ್ರಮಾಣಪತ್ರಗಳು" : "Stored KYC & Land Certificates"}
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
          RTC / Pahani ({profile.district} · {profile.farmSize} ac)
        </Text>
        <Text style={styles.bodyText}>
          {isKn ? "ಕರ್ನಾಟಕ ಭೂಮಿ ಪೋರ್ಟಲ್" : "Karnataka Bhoomi Portal"}
        </Text>
      </View>
      {documents.map((doc) => (
        <View key={doc.id} style={styles.card}>
          <Text style={styles.cardTitle}>{doc.name}</Text>
          <Text style={styles.bodyText}>{doc.date} · {doc.status}</Text>
        </View>
      ))}
    </DetailShell>
  )
}

/* 11. Important Dates Screen */
export function ImportantDatesScreen() {
  const { lang } = useLang()
  const isKn = lang === "kn"
  return (
    <DetailShell
      title={isKn ? "ಪ್ರಮುಖ ದಿನಾಂಕಗಳು" : "Important Deadlines"}
      subtitle={isKn ? "PMFBY ಕ್ಯಾಲೆಂಡರ್" : "PMFBY Cut-Off Calendar"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಮುಂಗಾರು ನೋಂದಣಿ ಕೊನೆಯ ದಿನಾಂಕ" : "Kharif Enrollment Deadline"}
        </Text>
        <Text style={styles.highlightText}>
          {isKn ? "ಜುಲೈ 31, 2026" : "July 31, 2026"}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ನಷ್ಟ ಮಾಹಿತಿ ಸಲ್ಲಿಕೆ ಅವಧಿ" : "Loss Intimation Window"}
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? "ಪ್ರವಾಹ, ಆಲಿಕಲ್ಲು ಅಥವಾ ಬರದ ನಂತರ 72 ಗಂಟೆಗಳ ಒಳಗೆ"
            : "Within 72 hours of flood, hail, or drought event"}
        </Text>
      </View>
    </DetailShell>
  )
}

/* 12. Insurance Help Screen */
export function InsuranceHelpScreen() {
  const { lang } = useLang()
  const isKn = lang === "kn"

  async function callPmFbyHelpline() {
    try {
      await Linking.openURL("tel:14447")
    } catch {
      Alert.alert("PMFBY Helpline", isKn ? "ದಯವಿಟ್ಟು 14447 ಗೆ ಕರೆ ಮಾಡಿ." : "Please dial 14447.")
    }
  }

  return (
    <DetailShell
      title={isKn ? "ವಿಮೆ ಸಹಾಯ" : "Insurance Support"}
      subtitle={isKn ? "PMFBY ರೈತ ಸಹಾಯವಾಣಿ" : "PMFBY Farmer Helpline"}
    >
      <TouchableOpacity onPress={callPmFbyHelpline} style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ರಾಷ್ಟ್ರೀಯ ಬೆಳೆ ವಿಮೆ ಸಹಾಯವಾಣಿ (ಕರೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ)" : "National Crop Insurance Helpline (Tap to Call)"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Phone size={18} color="#256428" />
          <Text style={styles.highlightText}>14447 ({isKn ? "ಉಚಿತ ಕರೆ" : "Toll-Free"})</Text>
        </View>
        <Text style={styles.bodyText}>
          {isKn ? "ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಹಿಂದಿಯಲ್ಲಿ ಲಭ್ಯವಿದೆ" : "Available in Kannada, English, and Hindi"}
        </Text>
      </TouchableOpacity>
    </DetailShell>
  )
}

/* 13. Insurance Dashboard Screen */
export function InsuranceDashboardScreen() {
  const { policies, applications, claims } = useInsurance()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const totalCoverage = policies.reduce((acc, p) => acc + p.coverage, 0)

  return (
    <DetailShell
      title={isKn ? "ವಿಮೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Insurance Dashboard"}
      subtitle={isKn ? "ಸಂಪೂರ್ಣ ವಿಮಾ ಸ್ಥಿತಿ" : "Portfolio Overview"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಸಕ್ರಿಯ ಪಾಲಿಸಿಗಳು" : "Active Policies"}: {policies.length}
        </Text>
        <Text style={styles.highlightText}>
          {isKn ? "ಒಟ್ಟು ರಕ್ಷಣೆ" : "Total Coverage"}: ₹{totalCoverage.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.bodyText}>
          {isKn ? "ಅರ್ಜಿಗಳು" : "Applications"}: {applications.length} ·{" "}
          {isKn ? "ತೆರೆದ ಕ್ಲೇಮ್‌ಗಳು" : "Open Claims"}: {claims.length}
        </Text>
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
