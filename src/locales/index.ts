import * as equipmentA from "./equipmentA"
import * as equipmentB from "./equipmentB"
import * as scanFlow from "./scanFlow"
import * as info from "./info"
import * as coreA from "./coreA"
import * as coreB from "./coreB"
import * as insurance from "./insurance"
import * as login from "./login"
import * as assistant from "./assistant"

export const extraEn = {
  equipmentA: equipmentA.en,
  equipmentB: equipmentB.en,
  scanFlow: scanFlow.en,
  info: info.en,
  coreA: coreA.en,
  coreB: coreB.en,
  insurance: insurance.en,
  login: login.en,
  assistant: assistant.en,
}

export const extraKn: typeof extraEn = {
  equipmentA: equipmentA.kn,
  equipmentB: equipmentB.kn,
  scanFlow: scanFlow.kn,
  info: info.kn,
  coreA: coreA.kn,
  coreB: coreB.kn,
  insurance: insurance.kn,
  login: login.kn,
  assistant: assistant.kn,
}
