import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  createCropFieldOnBackend,
  deleteCropFieldOnBackend,
  deleteProfileFromBackend,
  fetchProfileFromBackend,
  saveProfileToBackend,
  updateCropFieldOnBackend,
  uploadAvatarToBackend,
  type BackendProfileDTO,
  type CropFieldDTO,
} from "./api/profile"
import { clearLocalScanHistory } from "./storage/scanHistory"
import { triggerAppLogout } from "./startup"
import { clearAuthToken } from "./auth"
import {
  hydrateAppSettings,
  markCloudSyncedNow,
  setAppSettingsMobile,
} from "./storage/appSettings"
import { syncSavedTipsFromBackend } from "./storage/savedTips"

export type FarmerProfile = {
  name: string
  nameKn: string
  mobile: string
  email: string
  state: string
  district: string
  taluk: string
  village: string
  farmSize: string
  crops: string[]
  cropFields: CropFieldDTO[]
  experience: number
  photoUrl: string
  soilType: string
  irrigationType: string
  rtcVerified: boolean
  soilN: number | null
  soilP: number | null
  soilK: number | null
  soilPh: number | null
}

const DEFAULT: FarmerProfile = {
  name: "Naveen Kumar KM",
  nameKn: "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ",
  mobile: "9591502209",
  email: "naveen.krushika@gmail.com",
  state: "Karnataka",
  district: "Mandya",
  taluk: "Pandavapura",
  village: "Channasandra",
  farmSize: "4.2",
  crops: ["Rice", "Ragi", "Tomato"],
  cropFields: [],
  experience: 6,
  photoUrl:
    "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format",
  soilType: "Red Loam",
  irrigationType: "Borewell + Drip",
  rtcVerified: true,
  soilN: null,
  soilP: null,
  soilK: null,
  soilPh: null,
}

type ProfileCtx = {
  profile: FarmerProfile
  scansCount: number
  savedTipsCount: number
  loadingProfile: boolean
  updateProfile: (updates: Partial<FarmerProfile>) => void
  refreshProfile: (mobile?: string) => Promise<void>
  saveProfile: (
    updates: Partial<FarmerProfile>,
    preferredLanguage?: "en" | "kn"
  ) => Promise<boolean>
  uploadAvatar: (imageUri: string) => Promise<string>
  addCropField: (payload: {
    cropName: string
    variety?: string
    acreage: number
    season?: string
    sowingDate?: string
  }) => Promise<boolean>
  editCropField: (
    fieldId: string,
    payload: {
      cropName?: string
      variety?: string
      acreage?: number
      season?: string
      sowingDate?: string
      healthStatus?: string
    }
  ) => Promise<boolean>
  removeCropField: (fieldId: string) => Promise<boolean>
  deleteAccountData: () => Promise<boolean>
}

const ProfileContext = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FarmerProfile>(DEFAULT)
  const [scansCount, setScansCount] = useState<number>(0)
  const [savedTipsCount, setSavedTipsCount] = useState<number>(4)
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false)

  const applyBackendProfile = useCallback((dto: BackendProfileDTO) => {
    setAppSettingsMobile(dto.mobile)
    setProfile((prev) => ({
      ...prev,
      mobile: dto.mobile || prev.mobile,
      name: dto.name || prev.name,
      nameKn: dto.nameKn || dto.name || prev.nameKn,
      email: dto.email !== undefined ? dto.email : prev.email,
      state: dto.state || prev.state,
      district: dto.district || prev.district,
      taluk: dto.taluk ?? prev.taluk,
      village: dto.village ?? prev.village,
      farmSize: dto.farmSize || prev.farmSize,
      experience:
        typeof dto.experience === "number" ? dto.experience : prev.experience,
      photoUrl: dto.photoUrl || prev.photoUrl,
      soilType: dto.soilType || prev.soilType,
      irrigationType: dto.irrigationType || prev.irrigationType,
      rtcVerified:
        typeof dto.rtcVerified === "boolean" ? dto.rtcVerified : prev.rtcVerified,
      soilN: dto.soilN !== undefined ? dto.soilN : prev.soilN,
      soilP: dto.soilP !== undefined ? dto.soilP : prev.soilP,
      soilK: dto.soilK !== undefined ? dto.soilK : prev.soilK,
      soilPh: dto.soilPh !== undefined ? dto.soilPh : prev.soilPh,
      crops:
        Array.isArray(dto.crops) && dto.crops.length > 0 ? dto.crops : prev.crops,
      cropFields: Array.isArray(dto.cropFields) ? dto.cropFields : prev.cropFields,
    }))

    if (typeof dto.scansCount === "number") {
      setScansCount(dto.scansCount)
    }
    if (typeof dto.savedTipsCount === "number") {
      setSavedTipsCount(dto.savedTipsCount)
    }
    hydrateAppSettings({
      notificationsOn: dto.notificationsOn ?? true,
      offlineModeOn: dto.offlineModeOn ?? true,
    })
    markCloudSyncedNow()
  }, [])

  const refreshProfile = useCallback(
    async (mobileOverride?: string) => {
      const targetMobile = mobileOverride || profile.mobile
      setAppSettingsMobile(targetMobile)
      setLoadingProfile(true)
      try {
        const dto = await fetchProfileFromBackend(targetMobile)
        if (dto) applyBackendProfile(dto)
        syncSavedTipsFromBackend(targetMobile).catch(() => {})
      } finally {
        setLoadingProfile(false)
      }
    },
    [applyBackendProfile, profile.mobile]
  )

  useEffect(() => {
    refreshProfile(DEFAULT.mobile)
    // Only bootstrap once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateProfile = useCallback((updates: Partial<FarmerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  const saveProfile = useCallback(
    async (
      updates: Partial<FarmerProfile>,
      preferredLanguage?: "en" | "kn"
    ): Promise<boolean> => {
      const merged: FarmerProfile = { ...profile, ...updates }
      setProfile(merged)
      try {
        const dto = await saveProfileToBackend({
          mobile: merged.mobile,
          name: merged.name,
          nameKn: merged.nameKn,
          email: merged.email,
          state: merged.state,
          district: merged.district,
          taluk: merged.taluk,
          village: merged.village,
          farmSize: merged.farmSize,
          experience: merged.experience,
          photoUrl: merged.photoUrl,
          crops: merged.crops,
          soilType: merged.soilType,
          irrigationType: merged.irrigationType,
          rtcVerified: merged.rtcVerified,
          soilN: merged.soilN,
          soilP: merged.soilP,
          soilK: merged.soilK,
          soilPh: merged.soilPh,
          preferredLanguage,
        })
        if (dto) applyBackendProfile(dto)
        return true
      } catch (err) {
        console.warn("⚠️ [Profile Save Fallback]: Saved locally only:", err)
        return false
      }
    },
    [applyBackendProfile, profile]
  )

  const uploadAvatar = useCallback(
    async (imageUri: string): Promise<string> => {
      // Optimistically preview chosen photo immediately
      setProfile((prev) => ({ ...prev, photoUrl: imageUri }))
      const res = await uploadAvatarToBackend(imageUri, profile.mobile)
      applyBackendProfile(res.profile)
      return res.photoUrl
    },
    [applyBackendProfile, profile.mobile]
  )

  const addCropField = useCallback(
    async (payload: {
      cropName: string
      variety?: string
      acreage: number
      season?: string
      sowingDate?: string
    }): Promise<boolean> => {
      try {
        const dto = await createCropFieldOnBackend({
          mobile: profile.mobile,
          ...payload,
        })
        applyBackendProfile(dto)
        return true
      } catch {
        return false
      }
    },
    [applyBackendProfile, profile.mobile]
  )

  const editCropField = useCallback(
    async (
      fieldId: string,
      payload: {
        cropName?: string
        variety?: string
        acreage?: number
        season?: string
        sowingDate?: string
        healthStatus?: string
      }
    ): Promise<boolean> => {
      try {
        const dto = await updateCropFieldOnBackend(fieldId, {
          mobile: profile.mobile,
          ...payload,
        })
        applyBackendProfile(dto)
        return true
      } catch {
        return false
      }
    },
    [applyBackendProfile, profile.mobile]
  )

  const removeCropField = useCallback(
    async (fieldId: string): Promise<boolean> => {
      try {
        const dto = await deleteCropFieldOnBackend(fieldId, profile.mobile)
        applyBackendProfile(dto)
        return true
      } catch {
        return false
      }
    },
    [applyBackendProfile, profile.mobile]
  )

  const deleteAccountData = useCallback(async (): Promise<boolean> => {
    try {
      await deleteProfileFromBackend(profile.mobile).catch(() => false)
    } finally {
      clearLocalScanHistory()
      clearAuthToken()
      setProfile(DEFAULT)
      setScansCount(0)
      triggerAppLogout()
    }
    return true
  }, [profile.mobile])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        scansCount,
        savedTipsCount,
        loadingProfile,
        updateProfile,
        refreshProfile,
        saveProfile,
        uploadAvatar,
        addCropField,
        editCropField,
        removeCropField,
        deleteAccountData,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}
