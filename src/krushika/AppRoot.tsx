"use client"

import App from "./App"
import { LangProvider } from "./i18n"
import { NavProvider } from "./nav"
import { EquipmentProvider } from "./equipment"
import { InsuranceProvider } from "./insurance"
import { ProfileProvider } from "./profile"

export default function AppRoot() {
  return (
    <LangProvider>
      <ProfileProvider>
        <EquipmentProvider>
          <InsuranceProvider>
            <NavProvider>
              <App />
            </NavProvider>
          </InsuranceProvider>
        </EquipmentProvider>
      </ProfileProvider>
    </LangProvider>
  )
}
