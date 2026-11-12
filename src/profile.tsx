import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { fetchProfileFromBackend, saveProfileToBackend } from "./api/profile"

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
  experience: number
  photoUrl: string
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
  experience: 6,
  photoUrl:
    "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format",
}

type ProfileCtx = {
  profile: FarmerProfile
  scansCount: number
  loadingProfile: boolean
  updateProfile: (updates: Partial<FarmerProfile>) => void
  refreshProfile: (mobile?: string) => Promise<void>
  saveProfile: (
    updates: Partial<FarmerProfile>,
    preferredLanguage?: "en" | "kn"
  ) => Promise<boolean>
}

const ProfileContext = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FarmerProfile>(DEFAULT)
  const [scansCount, setScansCount] = useState<number>(0)
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false)

  const applyBackendProfile = useCallback(
    (dto: NonNullable<Awaited<ReturnType<typeof fetchProfileFromBackend>>>) => {
      setProfile((prev) => ({
        ...prev,
        mobile: dto.mobile || prev.mobile,
        name: dto.name || prev.name,
        nameKn:
          dto.name && dto.name !== DEFAULT.name ? prev.nameKn : DEFAULT.nameKn,
        state: dto.state || prev.state,
        district: dto.district || prev.district,
        taluk: dto.taluk || prev.taluk,
        village: dto.village || prev.village,
        farmSize: dto.farmSize || prev.farmSize,
        experience:
          typeof dto.experience === "number" ? dto.experience : prev.experience,
        photoUrl: dto.photoUrl || prev.photoUrl,
        crops:
          Array.isArray(dto.crops) && dto.crops.length > 0
            ? dto.crops
            : prev.crops,
      }))
      if (typeof dto.scansCount === "number") {
        setScansCount(dto.scansCount)
      }
    },
    []
  )

  const refreshProfile = useCallback(
    async (mobileOverride?: string) => {
      const targetMobile = mobileOverride || profile.mobile
      setLoadingProfile(true)
      try {
        const dto = await fetchProfileFromBackend(targetMobile)
        if (dto) applyBackendProfile(dto)
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
          state: merged.state,
          district: merged.district,
          taluk: merged.taluk,
          village: merged.village,
          farmSize: merged.farmSize,
          experience: merged.experience,
          photoUrl: merged.photoUrl,
          crops: merged.crops,
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

  return (
    <ProfileContext.Provider
      value={{
        profile,
        scansCount,
        loadingProfile,
        updateProfile,
        refreshProfile,
        saveProfile,
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
