// ==============================================================================
// Cloudinary Media Upload Service
// Uses official cloudinary v2 SDK for robust signing & upload
// ==============================================================================

import "../config/env.js"
import { v2 as cloudinary } from "cloudinary"

function getCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || ""
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || ""
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || ""
  return { cloudName, apiKey, apiSecret }
}

function detectImageMimeType(imageBuffer: Buffer, filename: string): string {
  if (imageBuffer.length >= 8 && imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4e && imageBuffer[3] === 0x47) {
    return "image/png"
  }
  if (imageBuffer.length >= 12 && imageBuffer.subarray(0, 4).toString("ascii") === "RIFF" && imageBuffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp"
  }
  const ext = filename.split(".").pop()?.toLowerCase()
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
  return "image/jpeg"
}

export interface CloudinaryUploadResult {
  success: boolean
  secureUrl: string
  publicId?: string
  error?: string
}

/**
 * Uploads an image buffer or file to Cloudinary using official SDK.
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  folder: string = "krushikadhara/scans",
  _filename: string = "leaf_scan.jpg"
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials()

  if (!cloudName || !apiKey || !apiSecret || apiSecret.includes("*")) {
    console.warn("⚠️ [Cloudinary] Incomplete Cloudinary credentials in backend/.env; skipping remote upload.")
    return {
      success: false,
      secureUrl: "",
      error: "Cloudinary credentials missing or invalid",
    }
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  try {
    const mimeType = detectImageMimeType(imageBuffer, _filename)
    const base64Data = `data:${mimeType};base64,${imageBuffer.toString("base64")}`
    console.log(`☁️ [Cloudinary] Uploading scan image to folder: ${folder}...`)

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "image",
    })

    console.log(`✅ [Cloudinary Success] Image uploaded: ${result.secure_url}`)
    return {
      success: true,
      secureUrl: result.secure_url,
      publicId: result.public_id,
    }
  } catch (err: any) {
    console.error("❌ [Cloudinary SDK Upload Error]:", err?.message || err)
    return {
      success: false,
      secureUrl: "",
      error: err?.message || "Cloudinary upload failed",
    }
  }
}
