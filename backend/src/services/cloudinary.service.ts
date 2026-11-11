// ==============================================================================
// Cloudinary Media Upload Service
// Uses official cloudinary v2 SDK for robust signing & upload
// ==============================================================================

import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "ian5c0mv",
  api_key: process.env.CLOUDINARY_API_KEY || "853581742453468",
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!apiSecret || apiSecret.includes("*") || apiSecret.trim() === "") {
    console.warn("⚠️ [Cloudinary] Valid CLOUDINARY_API_SECRET is missing; skipping remote upload.")
    return {
      success: false,
      secureUrl: "",
      error: "CLOUDINARY_API_SECRET missing or invalid",
    }
  }

  try {
    const base64Data = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`
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
