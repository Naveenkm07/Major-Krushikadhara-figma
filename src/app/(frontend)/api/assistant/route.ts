import { SYSTEM_PROMPT } from "@/lib/assistant/systemPrompt"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_MESSAGE_CHARS = 1000
const MAX_HISTORY = 10
const MAX_HISTORY_CHARS = 1500
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000
const TIMEOUT_MS = 25_000

type Turn = { role: "user" | "assistant"; text: string }

const hits = new Map<string, number[]>()

function limited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k)
  }
  return recent.length > RATE_LIMIT
}

function fail(code: string, status: number) {
  return Response.json({ error: code }, { status })
}

function parse(body: unknown): { message: string; history: Turn[]; lang: "kn" | "en" } | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  if (typeof b.message !== "string") return null
  const message = b.message.trim()
  if (!message || message.length > MAX_MESSAGE_CHARS) return null
  const lang = b.lang === "en" ? "en" : "kn"
  const history: Turn[] = []
  if (b.history !== undefined) {
    if (!Array.isArray(b.history)) return null
    for (const h of b.history.slice(-MAX_HISTORY)) {
      if (!h || typeof h !== "object") return null
      const { role, text } = h as Record<string, unknown>
      if ((role !== "user" && role !== "assistant") || typeof text !== "string") return null
      history.push({ role, text: text.slice(0, MAX_HISTORY_CHARS) })
    }
  }
  return { message, history, lang }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fail("not_configured", 503)

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (limited(ip)) return fail("rate_limited", 429)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail("invalid_request", 400)
  }
  const input = parse(body)
  if (!input) return fail("invalid_request", 400)

  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = []
  for (const h of input.history) {
    const role = h.role === "user" ? "user" : "model"
    if (contents.length === 0 && role !== "user") continue
    if (contents.at(-1)?.role === role) contents.at(-1)!.parts[0].text += "\n" + h.text
    else contents.push({ role, parts: [{ text: h.text }] })
  }
  if (contents.at(-1)?.role === "user") contents.pop()
  contents.push({ role: "user", parts: [{ text: input.message }] })

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nThe app language setting is ${input.lang === "kn" ? "Kannada" : "English"}; still answer in the language of the farmer's latest question.`,
            },
          ],
        },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    })
    if (!res.ok) {
      console.error("[assistant] Gemini HTTP", res.status)
      return fail(res.status === 429 ? "upstream_busy" : "upstream_error", 502)
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const answer = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim()
    if (!answer) return fail("empty_answer", 502)
    return Response.json({ answer })
  } catch (err) {
    console.error("[assistant] request failed", err instanceof Error ? err.name : "unknown")
    return fail("upstream_error", 502)
  } finally {
    clearTimeout(timer)
  }
}
