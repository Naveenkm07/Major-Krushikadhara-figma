import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { prisma, withDbRetry } from "../config/db.js"
import {
  cacheFallbackFarmer,
  getOrCreateFallbackFarmer,
} from "../services/farmerFallback.service.js"

const TEST_PHONE = "9591502209"
const TEST_OTP = "1234"
const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format"
const inMemoryOtps = new Map<string, { otpCode: string; expiresAt: number }>()

function cleanMobile(raw: unknown): string {
  const digits = String(raw || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : ""
}

function isValidIndianMobile(mobile: string): boolean {
  if (!/^\d{10}$/.test(mobile)) return false
  return /^[6-9]/.test(mobile) || mobile === TEST_PHONE
}

async function sendSmsViaTwilio(mobile: string, otpCode: string): Promise<{ sent: boolean; reason?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const token = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from = process.env.TWILIO_PHONE_NUMBER?.trim()

  if (!sid || !token || !from || token.includes("*")) {
    return { sent: false, reason: "twilio_not_configured" }
  }

  try {
    const authHeader = Buffer.from(`${sid}:${token}`).toString("base64")
    const body = new URLSearchParams({
      To: `+91${mobile}`,
      From: from,
      Body: `Your KrushikaDhara verification OTP is ${otpCode}. Valid for 10 minutes.`,
    })
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      return { sent: false, reason: `twilio_http_${res.status}: ${errText.slice(0, 120)}` }
    }
    return { sent: true }
  } catch (err: any) {
    return { sent: false, reason: err?.message || "twilio_request_failed" }
  }
}

/**
 * POST /api/auth/request-otp
 * Generates and stores an OTP token in Neon PostgreSQL and attempts Twilio SMS dispatch.
 */
export async function requestOtpHandler(req: Request, res: Response) {
  try {
    const mobile = cleanMobile(req.body?.mobile || req.body?.phone)
    if (!isValidIndianMobile(mobile)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid 10-digit Indian mobile number.",
      })
    }

    const isDemo = mobile === TEST_PHONE
    const generatedOtp = isDemo
      ? TEST_OTP
      : String(Math.floor(1000 + Math.random() * 9000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    let smsResult: { sent: boolean; reason?: string } = { sent: false, reason: "demo_number" }
    if (!isDemo) {
      smsResult = await sendSmsViaTwilio(mobile, generatedOtp)
    }

    // Store OTP in Neon PostgreSQL cleanly (best-effort) + in-memory cache
    const otpToStore = smsResult.sent ? generatedOtp : TEST_OTP
    inMemoryOtps.set(mobile, {
      otpCode: otpToStore,
      expiresAt: expiresAt.getTime(),
    })
    await withDbRetry(async () => {
      await prisma.otpToken.create({
        data: {
          mobile,
          otpCode: otpToStore,
          expiresAt,
          verified: false,
        },
      })
    }, "createOtpToken").catch((err) => {
      console.warn("⚠️ [Auth OTP DB Warning]:", err?.message || err)
    })

    return res.json({
      success: true,
      mobile,
      smsSent: smsResult.sent,
      demoFallback: !smsResult.sent,
      message: smsResult.sent
        ? "OTP sent via SMS."
        : "OTP generated in test/fallback mode.",
    })
  } catch (err: any) {
    console.error("❌ [Auth requestOtp Error]:", err?.message || err)
    return res.status(500).json({
      success: false,
      error: "Failed to request OTP",
    })
  }
}

/**
 * POST /api/auth/verify-otp
 * Verifies the 4-digit OTP against Neon OtpToken (or test fallback OTP),
 * bootstraps/loads the Farmer profile, and returns a signed JWT.
 */
export async function verifyOtpHandler(req: Request, res: Response) {
  try {
    const mobile = cleanMobile(req.body?.mobile || req.body?.phone)
    const code = String(req.body?.code || req.body?.otp || "").replace(/\D/g, "")

    if (!isValidIndianMobile(mobile)) {
      return res.status(400).json({
        success: false,
        error: "Invalid 10-digit mobile number.",
      })
    }
    if (code.length !== 4) {
      return res.status(400).json({
        success: false,
        error: "Please enter the 4-digit OTP.",
      })
    }

    let isValidOtp = code === TEST_OTP
    const memOtp = inMemoryOtps.get(mobile)
    if (memOtp && memOtp.expiresAt > Date.now() && memOtp.otpCode === code) {
      isValidOtp = true
      inMemoryOtps.delete(mobile)
    }
    try {
      const latestToken = await withDbRetry(
        () =>
          prisma.otpToken.findFirst({
            where: {
              mobile,
              verified: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          }),
        "findLatestOtpToken"
      )
      if (latestToken) {
        if (latestToken.otpCode === code) {
          isValidOtp = true
          await prisma.otpToken
            .update({
              where: { id: latestToken.id },
              data: { verified: true },
            })
            .catch(() => {})
        } else if (code !== TEST_OTP) {
          isValidOtp = false
        }
      }
    } catch (dbErr: any) {
      console.warn("⚠️ [Auth verifyOtp DB Warning]:", dbErr?.message || dbErr)
    }

    if (!isValidOtp) {
      return res.status(401).json({
        success: false,
        verified: false,
        error: "Invalid or expired OTP code.",
      })
    }

    // Bootstrap / fetch Farmer record
    let farmer = null
    try {
      farmer = await withDbRetry(async () => {
        let existing = await prisma.farmer.findUnique({ where: { mobile } })
        if (!existing) {
          const fb = getOrCreateFallbackFarmer(mobile)
          existing = await prisma.farmer.create({
            data: {
              mobile,
              name: fb.name,
              nameKn: fb.nameKn,
              email: fb.email,
              state: fb.state || "Karnataka",
              district: fb.district,
              taluk: fb.taluk,
              village: fb.village,
              farmSize: Number(fb.farmSize) || 4.2,
              experienceYears: Number(fb.experienceYears) || 6,
              photoUrl: fb.photoUrl || DEFAULT_PHOTO,
              preferredLanguage: fb.preferredLanguage || "kn",
              rtcVerified: Boolean(fb.rtcVerified),
              soilType: fb.soilType || "Red Loam",
              irrigationType: fb.irrigationType || "Borewell + Drip",
              activeCrops: {
                create: (fb.activeCrops || []).map((c: any) => ({
                  cropName: c.cropName,
                  variety: c.variety,
                  acreage: Number(c.acreage) || 1.0,
                  season: c.season || "Kharif",
                  sowingDate: new Date(c.sowingDate || Date.now() - 35 * 86400000),
                  currentStage: c.currentStage || "TILLERING_VEGETATIVE",
                  stageDayCount: Number(c.stageDayCount) || 35,
                  healthStatus: c.healthStatus || "HEALTHY",
                })),
              },
            },
          })
        }
        return existing
      }, "authLoadFarmer")
      if (farmer) cacheFallbackFarmer(farmer)
    } catch {
      farmer = getOrCreateFallbackFarmer(mobile)
    }

    const secret = process.env.JWT_SECRET?.trim() || "krushikadhara-dev-secret"
    const token = jwt.sign(
      { sub: farmer?.id || mobile, mobile },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as any }
    )

    return res.json({
      success: true,
      verified: true,
      mobile,
      token,
      farmerId: farmer?.id || null,
    })
  } catch (err: any) {
    console.error("❌ [Auth verifyOtp Error]:", err?.message || err)
    return res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    })
  }
}

