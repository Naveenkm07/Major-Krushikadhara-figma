// src/api/aiAdvisor.ts
// Frontend client for real-time agricultural advisory streaming & voice queries

import { API_BASE } from "./config"

export interface StreamChunkCallback {
  onChunk: (text: string) => void
  onDone?: () => void
  onError?: (err: string) => void
  onTranscript?: (transcript: string) => void
}

/**
 * Stream Gemini agricultural guidance chunk-by-chunk using fetch + ReadableStream.
 */
export async function streamAgriChat(
  query: string,
  callbacks: StreamChunkCallback,
  options?: { mobile?: string; cropName?: string; district?: string }
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/ai/ask-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        mobile: options?.mobile,
        cropName: options?.cropName,
        district: options?.district,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Server returned ${res.status}`)
    }

    if (!res.body) {
      throw new Error("No readable stream received")
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.chunk) {
              callbacks.onChunk(data.chunk)
            }
            if (data.done) {
              callbacks.onDone?.()
            }
            if (data.error) {
              callbacks.onError?.(data.error)
            }
          } catch {}
        }
      }
    }
    callbacks.onDone?.()
  } catch (err: any) {
    callbacks.onError?.(err?.message || "Streaming failed")
  }
}

/**
 * Upload an actual recorded audio Blob to Sarvam STT -> stream Gemini agricultural response.
 */
export async function streamVoiceAudio(
  audioBlob: Blob,
  filename: string,
  callbacks: StreamChunkCallback,
  options?: { mobile?: string; language?: string }
): Promise<void> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob, filename)
    formData.append("mobile", options?.mobile || "9591502209")
    formData.append("language", options?.language || "kn-IN")

    const res = await fetch(`${API_BASE}/ai/voice-stream`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Voice upload error: HTTP ${res.status}`)
    }

    if (!res.body) {
      throw new Error("No response stream from server")
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.transcript) {
              callbacks.onTranscript?.(data.transcript)
            }
            if (data.chunk) {
              callbacks.onChunk(data.chunk)
            }
            if (data.done) {
              callbacks.onDone?.()
            }
            if (data.error) {
              callbacks.onError?.(data.error)
            }
          } catch {}
        }
      }
    }
    callbacks.onDone?.()
  } catch (err: any) {
    callbacks.onError?.(err?.message || "Audio streaming failed")
  }
}
