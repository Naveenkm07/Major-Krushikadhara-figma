import { Platform } from "react-native"

/**
 * Cross-platform multipart/form-data POST helper.
 *
 * IMPORTANT: On Expo SDK 54+/58+ (`expo/fetch` installed globally as `fetch`),
 * passing `{ uri, name, type }` inside `FormData` throws:
 *   `Error: Unsupported FormDataPart implementation`
 * Using native `XMLHttpRequest` on iOS/Android bypasses `expo/fetch` and delegates
 * directly to React Native's native NetworkingModule, while Web uses browser `fetch`.
 */
export async function postMultipartFormData<T = unknown>(
  url: string,
  formData: FormData,
  timeoutMs: number = 45000
): Promise<T> {
  if (Platform.OS === "web") {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
        signal: controller.signal,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error || `Upload failed with status ${res.status}`)
      }
      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  return await new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.timeout = timeoutMs
    xhr.setRequestHeader("Accept", "application/json")

    xhr.onload = () => {
      const raw = xhr.responseText || ""
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(raw) as T)
        } catch {
          reject(new Error("Invalid JSON response from server"))
        }
      } else {
        let message = `Upload failed with status ${xhr.status}`
        try {
          const parsed = JSON.parse(raw)
          if (parsed?.error) message = parsed.error
        } catch {}
        reject(new Error(message))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network error while uploading to server. Please check Wi-Fi / backend connection."))
    }

    xhr.ontimeout = () => {
      reject(new Error("Upload timed out while waiting for server response."))
    }

    xhr.send(formData as any)
  })
}

