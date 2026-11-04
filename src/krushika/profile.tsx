import { createContext, useContext, useState, type ReactNode } from "react"

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
  mobile: "",
  email: "",
  state: "Karnataka",
  district: "Mandya",
  taluk: "",
  village: "",
  farmSize: "4.2",
  crops: ["Rice", "Ragi", "Tomato"],
  experience: 0,
  photoUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format",
}

type ProfileCtx = {
  profile: FarmerProfile
  updateProfile: (updates: Partial<FarmerProfile>) => void
}

const ProfileContext = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FarmerProfile>(DEFAULT)

  function updateProfile(updates: Partial<FarmerProfile>) {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}
