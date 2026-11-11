// ==============================================================================
// Sarvam AI Speech-to-Text Service using Official SDK & REST fallback
// High-accuracy transcription for Indic languages (Kannada, Hindi, English, etc.)
// Model: saaras:v4
// ==============================================================================

import dotenv from "dotenv"
import { SarvamAIClient } from "sarvamai"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
dotenv.config()

export interface SarvamSttResult {
  success: boolean
  transcript: string
  languageCode: string
  error?: string
}

/**
 * Transcribes an audio buffer using Sarvam AI Saaras:v4 STT.
 * Supports both official SarvamAIClient file stream and fallback.
 * 
 * @param audioBuffer Binary buffer of recorded audio
 * @param filename Original audio filename (e.g. "recording.m4a", "audio.wav")
 * @param languageCode Preferred language (e.g. "kn-IN" for Kannada, "en-IN" for English)
 */
export async function transcribeAudioWithSarvam(
  audioBuffer: Buffer,
  filename: string = "audio.wav",
  languageCode: string = "kn-IN"
): Promise<SarvamSttResult> {
  const apiKey = process.env.SARVAM_API_KEY

  if (!apiKey) {
    console.warn("⚠️ [Sarvam AI] SARVAM_API_KEY is not set in backend/.env")
    return {
      success: false,
      transcript: "",
      languageCode,
      error: "SARVAM_API_KEY not configured",
    }
  }

  // Write temporary file for the Sarvam SDK file stream
  const tempDir = os.tmpdir()
  const tempFilePath = path.join(tempDir, `sarvam_${Date.now()}_${filename}`)

  try {
    console.log(`🎙️ [Sarvam STT] Transcribing ${audioBuffer.length} bytes (file: ${filename}, lang: ${languageCode})...`)

    fs.writeFileSync(tempFilePath, audioBuffer)

    const client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    })

    const fileStream = fs.createReadStream(tempFilePath)

    const response = await (client.speechToText.transcribe as any)(fileStream, {
      model: "saaras:v4",
      language_code: languageCode || "kn-IN",
      mode: "transcribe",
    })

    const transcript = (response as any).transcript || ""
    const detectedLang = (response as any).language_code || languageCode

    console.log(`✅ [Sarvam STT Success] Transcript: "${transcript}" (Lang: ${detectedLang})`)

    return {
      success: true,
      transcript,
      languageCode: detectedLang,
    }
  } catch (sdkError: any) {
    console.warn("⚠️ [Sarvam SDK Error], falling back to direct REST fetch:", sdkError?.message || sdkError)

    // Direct REST API fallback
    try {
      const formData = new FormData()
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: getMimeType(filename) })
      formData.append("file", blob, filename)
      formData.append("model", "saaras:v4")
      formData.append("mode", "transcribe")
      if (languageCode) {
        formData.append("language_code", languageCode)
      }

      const res = await fetch("https://api.sarvam.ai/speech-to-text", {
        method: "POST",
        headers: {
          "api-subscription-key": apiKey,
        },
        body: formData,
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Sarvam REST HTTP ${res.status}: ${errText}`)
      }

      const json = (await res.json()) as any
      return {
        success: true,
        transcript: json.transcript || "",
        languageCode: json.language_code || languageCode,
      }
    } catch (fallbackError: any) {
      console.error("❌ [Sarvam STT Failed]:", fallbackError)
      return {
        success: false,
        transcript: "",
        languageCode,
        error: fallbackError?.message || "STT failed",
      }
    }
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath)
      } catch {}
    }
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "wav":
      return "audio/wav"
    case "mp3":
      return "audio/mpeg"
    case "m4a":
      return "audio/m4a"
    case "aac":
      return "audio/aac"
    case "ogg":
      return "audio/ogg"
    case "webm":
      return "audio/webm"
    default:
      return "application/octet-stream"
  }
}
