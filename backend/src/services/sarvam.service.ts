// ==============================================================================
// Sarvam AI Speech-to-Text Service using Official SDK & REST fallback
// High-accuracy transcription for Indic languages (Kannada, Hindi, English, etc.)
// Model: saaras:v4
// ==============================================================================

import "../config/env.js"
import { SarvamAIClient } from "sarvamai"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

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
  const safeName = path.basename(filename || "audio.m4a").replace(/[^a-zA-Z0-9._-]/g, "_") || "audio.m4a"
  const finalName = path.extname(safeName) ? safeName : `${safeName}.m4a`
  const tempDir = os.tmpdir()
  const tempFilePath = path.join(tempDir, `sarvam_${Date.now()}_${finalName}`)

  try {
    console.log(`🎙️ [Sarvam STT] Transcribing ${audioBuffer.length} bytes (file: ${finalName}, lang: ${languageCode})...`)

    fs.writeFileSync(tempFilePath, audioBuffer)

    const client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    })

    const fileStream = fs.createReadStream(tempFilePath)

    const response = await client.speechToText.transcribe({
      file: fileStream,
      model: "saaras:v4",
      language_code: (languageCode || "kn-IN") as any,
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
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: getMimeType(finalName) })
      formData.append("file", blob, finalName)
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
        signal: AbortSignal.timeout(20000),
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
    case "mp4":
      return "audio/mp4"
    case "aac":
      return "audio/aac"
    case "3gp":
      return "audio/3gpp"
    case "caf":
      return "audio/x-caf"
    case "amr":
      return "audio/amr"
    case "flac":
      return "audio/flac"
    case "opus":
      return "audio/opus"
    case "ogg":
      return "audio/ogg"
    case "webm":
      return "audio/webm"
    default:
      return "application/octet-stream"
  }
}

export interface SarvamTtsResult {
  success: boolean
  audioBase64?: string
  mimeType?: string
  error?: string
}

/**
 * Synthesizes Kannada or English speech via Sarvam AI Bulbul v3 TTS.
 */
export async function synthesizeSpeechWithSarvam(
  text: string,
  languageCode: string = "kn-IN"
): Promise<SarvamTtsResult> {
  const apiKey = process.env.SARVAM_API_KEY
  if (!apiKey) {
    return { success: false, error: "SARVAM_API_KEY not configured" }
  }

  const cleanText = String(text || "")
    .replace(/[*_`#>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 480)
  if (!cleanText) {
    return { success: false, error: "Text is empty" }
  }

  const targetLang = languageCode.toLowerCase().startsWith("en") ? "en-IN" : "kn-IN"

  try {
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleanText,
        target_language_code: targetLang,
        model: "bulbul:v3",
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      return { success: false, error: `Sarvam TTS HTTP ${res.status}: ${errText.slice(0, 140)}` }
    }

    const json = (await res.json()) as { audios?: string[] }
    const audioBase64 = Array.isArray(json.audios) ? json.audios[0] : undefined
    if (!audioBase64) {
      return { success: false, error: "No audio returned by Sarvam TTS" }
    }

    return {
      success: true,
      audioBase64,
      mimeType: "audio/wav",
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Sarvam TTS request failed",
    }
  }
}
