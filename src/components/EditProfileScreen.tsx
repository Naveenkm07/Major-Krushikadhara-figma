import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import { useLang } from "../i18n"
import { syncScanHistoryFromBackend } from "../storage/scanHistory"
import { syncSavedTipsFromBackend } from "../storage/savedTips"
import DetailShell from "./DetailShell"
import { Camera, Check, Plus, X } from "lucide-react-native"

let ImagePicker: any = null
try {
  ImagePicker = require("expo-image-picker")
} catch {}

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

const SOIL_TYPES = [
  "Red Loam",
  "Black Cotton Soil",
  "Alluvial / Silt",
  "Laterite Soil",
  "Sandy Loam",
]

const IRRIGATION_TYPES = [
  "Borewell + Drip",
  "Canal + Flood",
  "Sprinkler",
  "Rainfed",
  "Open Well",
]

export default function EditProfileScreen() {
  const { profile, saveProfile, uploadAvatar } = useProfile()
  const { back } = useNav()
  const { t, lang } = useLang()
  const insets = useSafeAreaInsets()
  const isKn = lang === "kn"
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
  const [soilType, setSoilType] = useState(profile.soilType || "Red Loam")
  const [irrigationType, setIrrigationType] = useState(
    profile.irrigationType || "Borewell + Drip"
  )
  const [crops, setCrops] = useState<string[]>(
    profile.crops.length > 0 ? profile.crops : ["Rice", "Ragi"]
  )
  const [customCrop, setCustomCrop] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function pickPhoto(source: "camera" | "gallery") {
    if (!ImagePicker) return
    try {
      const perm =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm?.granted) {
        Alert.alert(
          isKn ? "ಅನುಮತಿ ಅಗತ್ಯವಿದೆ" : "Permission Required",
          isKn
            ? "ಫೋಟೋ ಬದಲಿಸಲು ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗ್ಯಾಲರಿ ಅನುಮತಿ ನೀಡಿ."
            : "Please grant camera or gallery permission."
        )
        return
      }
      const res =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.75,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions?.Images || ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.75,
            })
      if (res.canceled || !res.assets?.[0]?.uri) return
      setUploadingPhoto(true)
      await uploadAvatar(res.assets[0].uri)
    } catch (err: any) {
      Alert.alert(
        isKn ? "ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ" : "Upload Failed",
        err?.message || "Could not upload profile photo."
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  function handleAvatarPress() {
    Alert.alert(ep.changePhotoAria, ep.photoHint, [
      { text: isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera", onPress: () => pickPhoto("camera") },
      { text: isKn ? "ಗ್ಯಾಲರಿ" : "Gallery", onPress: () => pickPhoto("gallery") },
      { text: ep.cancel, style: "cancel" },
    ])
  }

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

    const prevMobile = profile.mobile
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
        soilType,
        irrigationType,
        crops,
      },
      lang
    )
    if (cleanMobile !== prevMobile) {
      syncScanHistoryFromBackend(cleanMobile).catch(() => {})
      syncSavedTipsFromBackend(cleanMobile).catch(() => {})
    }
    setSaving(false)

    if (!syncedToCloud) {
      Alert.alert(
        ep.title,
        isKn
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

      {/* Profile Avatar Picker Card */}
      <View style={styles.avatarCard}>
        <TouchableOpacity
          onPress={handleAvatarPress}
          activeOpacity={0.85}
          style={styles.avatarBtn}
        >
          <Image source={{ uri: profile.photoUrl }} style={styles.avatarPreview} />
          {uploadingPhoto ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : (
            <View style={styles.avatarCamIcon}>
              <Camera size={14} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.avatarTitle}>{ep.changePhotoAria}</Text>
          <Text style={styles.avatarHint}>{ep.photoHint}</Text>
        </View>
      </View>

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
          <Text style={styles.label}>{isKn ? "ಮಣ್ಣಿನ ವಿಧ" : "Soil Type"}</Text>
          <View style={styles.chipsWrap}>
            {SOIL_TYPES.map((st) => {
              const active = soilType === st
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setSoilType(st)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{isKn ? "ನೀರಾವರಿ ಮೂಲ" : "Irrigation Source"}</Text>
          <View style={styles.chipsWrap}>
            {IRRIGATION_TYPES.map((ir) => {
              const active = irrigationType === ir
              return (
                <TouchableOpacity
                  key={ir}
                  onPress={() => setIrrigationType(ir)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {ir}
                  </Text>
                </TouchableOpacity>
              )
            })}
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
  avatarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    position: "relative",
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#dcfce7",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 34,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCamIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#256428",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  avatarHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
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
