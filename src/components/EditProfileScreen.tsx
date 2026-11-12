import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import { Check, Plus, X } from "lucide-react-native"

const PRESET_CROPS = [
  "Rice",
  "Ragi",
  "Tomato",
  "Maize",
  "Sugarcane",
  "Onion",
  "Chilli",
  "Groundnut",
  "Jowar",
  "Cotton",
  "Wheat",
]

const KARNATAKA_DISTRICTS = [
  "Mandya",
  "Mysuru",
  "Bengaluru Rural",
  "Hassan",
  "Tumakuru",
  "Ramanagara",
  "Kolar",
  "Chikkaballapur",
  "Belagavi",
  "Dharwad",
  "Shivamogga",
  "Davanagere",
]

export default function EditProfileScreen() {
  const { profile, saveProfile } = useProfile()
  const { back } = useNav()
  const { t, lang } = useLang()
  const insets = useSafeAreaInsets()
  const ep = t.x.coreA.editProfile
  const cropMap = (t.x.coreA.crops as Record<string, string>) || {}

  const [name, setName] = useState(profile.name)
  const [nameKn, setNameKn] = useState(profile.nameKn)
  const [mobile, setMobile] = useState(profile.mobile)
  const [email, setEmail] = useState(profile.email)
  const [stateName, setStateName] = useState(profile.state || "Karnataka")
  const [district, setDistrict] = useState(profile.district)
  const [taluk, setTaluk] = useState(profile.taluk)
  const [village, setVillage] = useState(profile.village)
  const [farmSize, setFarmSize] = useState(profile.farmSize)
  const [experience, setExperience] = useState(String(profile.experience ?? 5))
  const [crops, setCrops] = useState<string[]>(
    profile.crops.length > 0 ? profile.crops : ["Rice", "Ragi"]
  )
  const [customCrop, setCustomCrop] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [saving, setSaving] = useState(false)

  function toggleCrop(crop: string) {
    setErrorMsg("")
    setCrops((prev) => {
      if (prev.includes(crop)) {
        if (prev.length === 1) return prev
        return prev.filter((c) => c !== crop)
      }
      return [...prev, crop]
    })
  }

  function handleAddCustomCrop() {
    const clean = customCrop.trim()
    if (!clean) return
    if (!crops.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setCrops((prev) => [...prev, clean])
    }
    setCustomCrop("")
  }

  async function handleSave() {
    setErrorMsg("")
    const cleanName = name.trim()
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10)
    const parsedSize = parseFloat(farmSize)
    const parsedExp = parseInt(experience, 10)

    if (!cleanName) {
      setErrorMsg(ep.errName)
      return
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg(ep.errMobile)
      return
    }
    if (!district.trim()) {
      setErrorMsg(ep.errDistrict)
      return
    }
    if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
      setErrorMsg(ep.errFarmSize)
      return
    }
    if (!Number.isFinite(parsedExp) || parsedExp < 0) {
      setErrorMsg(ep.errExperience)
      return
    }

    setSaving(true)
    const syncedToCloud = await saveProfile(
      {
        name: cleanName,
        nameKn: nameKn.trim() || cleanName,
        mobile: cleanMobile,
        email: email.trim(),
        state: stateName.trim() || "Karnataka",
        district: district.trim(),
        taluk: taluk.trim(),
        village: village.trim(),
        farmSize: String(parsedSize),
        experience: parsedExp,
        crops,
      },
      lang
    )
    setSaving(false)

    if (!syncedToCloud) {
      Alert.alert(
        ep.title,
        lang === "kn"
          ? "ಪ್ರೊಫೈಲ್ ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ (ಸರ್ವರ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ)."
          : "Profile saved locally (backend offline — will sync when online)."
      )
    }
    back()
  }

  return (
    <DetailShell
      title={ep.title}
      subtitle={ep.subtitle}
      footer={
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity
            onPress={back}
            disabled={saving}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>{ep.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Check size={18} color="#ffffff" />
            )}
            <Text style={styles.saveBtnText}>{ep.save}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Personal Details */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>{ep.personal}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.fullName}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder={ep.fullNamePh}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.nameKn}</Text>
          <TextInput
            value={nameKn}
            onChangeText={setNameKn}
            style={styles.input}
            placeholder={ep.nameKnPh}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.mobile}</Text>
          <TextInput
            value={mobile}
            onChangeText={(v) => setMobile(v.replace(/\D/g, "").slice(0, 10))}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder={ep.mobilePh}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.email}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={ep.emailPh}
          />
        </View>
      </View>

      {/* Location Details */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>{ep.location}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.state}</Text>
          <TextInput
            value={stateName}
            onChangeText={setStateName}
            style={styles.input}
            placeholder="Karnataka"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.district}</Text>
          <TextInput
            value={district}
            onChangeText={setDistrict}
            style={styles.input}
            placeholder={ep.selectDistrict}
          />
          <View style={styles.chipsWrap}>
            {KARNATAKA_DISTRICTS.map((dist) => {
              const active = district.toLowerCase() === dist.toLowerCase()
              return (
                <TouchableOpacity
                  key={dist}
                  onPress={() => setDistrict(dist)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {dist}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.rowTwo}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>{ep.taluk}</Text>
            <TextInput
              value={taluk}
              onChangeText={setTaluk}
              style={styles.input}
              placeholder={ep.talukPh}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>{ep.village}</Text>
            <TextInput
              value={village}
              onChangeText={setVillage}
              style={styles.input}
              placeholder={ep.villagePh}
            />
          </View>
        </View>
      </View>

      {/* Farm Details */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>{ep.farmDetails}</Text>

        <View style={styles.rowTwo}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>{ep.farmSize}</Text>
            <TextInput
              value={farmSize}
              onChangeText={setFarmSize}
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder={ep.farmSizePh}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>{ep.experience}</Text>
            <TextInput
              value={experience}
              onChangeText={(v) => setExperience(v.replace(/\D/g, ""))}
              style={styles.input}
              keyboardType="number-pad"
              placeholder="6"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{ep.mainCrops}</Text>
          <View style={styles.chipsWrap}>
            {Array.from(new Set([...PRESET_CROPS, ...crops])).map((crop) => {
              const selected = crops.includes(crop)
              return (
                <TouchableOpacity
                  key={crop}
                  onPress={() => toggleCrop(crop)}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextActive]}
                  >
                    {cropMap[crop] || crop}
                  </Text>
                  {selected && crops.length > 1 ? (
                    <X size={12} color="#ffffff" />
                  ) : null}
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={styles.customCropRow}>
            <TextInput
              value={customCrop}
              onChangeText={setCustomCrop}
              onSubmitEditing={handleAddCustomCrop}
              placeholder={ep.customCropPh}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={handleAddCustomCrop}
              style={styles.addCropBtn}
            >
              <Plus size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#256428",
  },
  fieldGroup: {
    gap: 6,
  },
  rowTwo: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: {
    backgroundColor: "#256428",
    borderColor: "#256428",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  customCropRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    alignItems: "center",
  },
  addCropBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4b5563",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
