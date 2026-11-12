// src/api/aiAdvisor.ts
// Cross-platform (Web + React Native / Expo Go) client for real-time AI streaming & voice queries

import { Platform } from "react-native"
import { API_BASE } from "./config"

export interface StreamChunkCallback {
  onChunk: (text: string) => void
  onDone?: () => void
  onError?: (err: string) => void
  onTranscript?: (transcript: string) => void
}

export type NativeAudioDescriptor = {
  uri: string
  name?: string
  type?: string
}

function processSseLines(
  lines: string[],
  callbacks: StreamChunkCallback,
  state: { doneCalled: boolean; errorCalled: boolean }
) {
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line.startsWith("data: ")) continue
    try {
      const data = JSON.parse(line.slice(6))
      if (data.transcript) {
        callbacks.onTranscript?.(data.transcript)
      }
      if (data.chunk) {
        callbacks.onChunk(data.chunk)
      }
      if (data.error && !state.errorCalled) {
        state.errorCalled = true
        callbacks.onError?.(data.error)
      }
      if (data.done && !state.doneCalled) {
        state.doneCalled = true
        callbacks.onDone?.()
      }
    } catch {
      // Ignore malformed/incomplete SSE line
    }
  }
}

/**
 * Sends a POST request expecting an SSE (`text/event-stream`) or JSON error response.
 * Uses ReadableStream on Web browsers when available, and XMLHttpRequest on React Native
 * (since Hermes `fetch` lacks `res.body.getReader()` and `TextDecoder`).
 */
async function postSseRequest(
  url: string,
  body: string | FormData,
  headers: Record<string, string>,
  callbacks: StreamChunkCallback
): Promise<void> {
  const state = { doneCalled: false, errorCalled: false }

  const canUseFetchStream =
    Platform.OS === "web" &&
    typeof TextDecoder !== "undefined" &&
    typeof ReadableStream !== "undefined"

  if (canUseFetchStream) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Server returned HTTP ${res.status}`)
    }

    if (res.body && typeof res.body.getReader === "function") {
      const reader = res.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        processSseLines(lines, callbacks, state)
      }

      if (buffer.trim()) {
        processSseLines([buffer], callbacks, state)
      }
      if (!state.doneCalled && !state.errorCalled) {
        state.doneCalled = true
        callbacks.onDone?.()
      }
      return
    }
  }

  // XMLHttpRequest path (reliable on React Native Android/iOS + Web fallback)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let lastIndex = 0
    let pendingBuffer = ""

    xhr.open("POST", url)
    xhr.timeout = 45000

    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v)
    }

    const flushResponseText = (final: boolean) => {
      if (xhr.status >= 400) return
      const fullText = xhr.responseText || ""
      if (fullText.length > lastIndex) {
        const delta = fullText.slice(lastIndex)
        lastIndex = fullText.length
        pendingBuffer += delta
        const lines = pendingBuffer.split("\n")
        pendingBuffer = lines.pop() || ""
        processSseLines(lines, callbacks, state)
      }
      if (final && pendingBuffer.trim()) {
        processSseLines([pendingBuffer], callbacks, state)
        pendingBuffer = ""
      }
    }

    xhr.onprogress = () => {
      flushResponseText(false)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        flushResponseText(true)
        if (!state.doneCalled && !state.errorCalled) {
          state.doneCalled = true
          callbacks.onDone?.()
        }
        resolve()
      } else {
        let message = `Server returned HTTP ${xhr.status}`
        try {
          const parsed = JSON.parse(xhr.responseText || "{}")
          if (parsed?.error) message = parsed.error
        } catch {}
        reject(new Error(message))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network request failed. Please check backend connection."))
    }

    xhr.ontimeout = () => {
      reject(new Error("Request timed out while waiting for AI response."))
    }

    xhr.send(body as any)
  })
}

/**
 * Stream Gemini agricultural guidance chunk-by-chunk (Web + React Native compatible).
 */
export async function streamAgriChat(
  query: string,
  callbacks: StreamChunkCallback,
  options?: { mobile?: string; cropName?: string; district?: string; language?: string }
): Promise<void> {
  try {
    await postSseRequest(
      `${API_BASE}/ai/ask-stream`,
      JSON.stringify({
        query,
        mobile: options?.mobile,
        cropName: options?.cropName,
        district: options?.district,
        language: options?.language,
      }),
      { "Content-Type": "application/json", Accept: "text/event-stream, application/json" },
      callbacks
    )
  } catch (err: any) {
    callbacks.onError?.(err?.message || "Streaming failed")
  }
}

/**
 * Upload recorded audio (Web Blob or React Native file URI descriptor) to Sarvam STT -> stream Gemini response.
 */
export async function streamVoiceAudio(
  audioInput: Blob | NativeAudioDescriptor,
  filename: string,
  callbacks: StreamChunkCallback,
  options?: { mobile?: string; language?: string; cropName?: string; district?: string }
): Promise<void> {
  try {
    const formData = new FormData()
    if ("uri" in audioInput) {
      formData.append("audio", {
        uri: audioInput.uri,
        name: audioInput.name || filename || "recording.m4a",
        type: audioInput.type || "audio/m4a",
      } as any)
    } else {
      formData.append("audio", audioInput, filename || "recording.webm")
    }

    formData.append("mobile", options?.mobile || "9591502209")
    formData.append("language", options?.language || "kn-IN")
    if (options?.cropName) formData.append("cropName", options.cropName)
    if (options?.district) formData.append("district", options.district)

    await postSseRequest(
      `${API_BASE}/ai/voice-stream`,
      formData,
      { Accept: "text/event-stream, application/json" },
      callbacks
    )
  } catch (err: any) {
    callbacks.onError?.(err?.message || "Audio streaming failed")
  }
}

/**
 * Request Sarvam Bulbul v3 TTS audio (base64 WAV) for Kannada / English advisory playback.
 */
export async function synthesizeSpeechAudio(
  text: string,
  language: string = "kn-IN"
): Promise<{ ok: boolean; dataUri?: string; error?: string }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`${API_BASE}/ai/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ text, language }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json?.success || !json?.audioBase64) {
      return { ok: false, error: json?.error || "TTS synthesis failed" }
    }
    const mime = json.mimeType || "audio/wav"
    return {
      ok: true,
      dataUri: `data:${mime};base64,${json.audioBase64}`,
    }
  } catch (err: any) {
    return { ok: false, error: err?.message || "TTS request failed" }
  }
}
