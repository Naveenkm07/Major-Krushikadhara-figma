import "./env.js"
import { PrismaClient } from "@prisma/client"

function buildDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim()
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "15")
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "15")
    }
    return url.toString()
  } catch {
    return raw
  }
}

const resolvedDbUrl = buildDatabaseUrl()

export const prisma = new PrismaClient({
  ...(resolvedDbUrl ? { datasources: { db: { url: resolvedDbUrl } } } : {}),
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
})

export function isTransientDbError(error: unknown): boolean {
  const code = (error as any)?.code
  if (code === "P1001" || code === "P1002" || code === "P1008" || code === "P1017" || code === "P2024") {
    return true
  }
  const msg = error instanceof Error ? error.message : String(error || "")
  const lower = msg.toLowerCase()
  return (
    lower.includes("can't reach database server") ||
    lower.includes("kind: closed") ||
    lower.includes("connection terminated") ||
    lower.includes("connection closed") ||
    lower.includes("econnreset") ||
    lower.includes("etimedout") ||
    lower.includes("timed out fetching a new connection") ||
    lower.includes("server has closed the connection")
  )
}

let dbCircuitOpenUntil = 0
const DB_CIRCUIT_COOLDOWN_MS = 30_000

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  label = "Prisma query",
  retries = 2
): Promise<T> {
  if (Date.now() < dbCircuitOpenUntil) {
    throw new Error(`P1001: Database circuit temporarily open (${label})`)
  }
  let lastError: unknown
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await operation()
      dbCircuitOpenUntil = 0
      return result
    } catch (error) {
      lastError = error
      if (!isTransientDbError(error)) {
        throw error
      }
      if (attempt === retries) {
        dbCircuitOpenUntil = Date.now() + DB_CIRCUIT_COOLDOWN_MS
        throw error
      }
      const delayMs = attempt * 400
      console.warn(
        `⚠️ [Neon PostgreSQL] ${label} hit transient error (attempt ${attempt}/${retries}), reconnecting in ${delayMs}ms:`,
        error instanceof Error ? error.message : error
      )
      await prisma.$disconnect().catch(() => {})
      await new Promise((r) => setTimeout(r, delayMs))
      await prisma.$connect().catch(() => {})
    }
  }
  throw lastError
}

let keepAliveTimer: NodeJS.Timeout | null = null

export function startDbKeepAlive(intervalMs = 3 * 60 * 1000): void {
  if (keepAliveTimer) return
  keepAliveTimer = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      await prisma.$disconnect().catch(() => {})
      await prisma.$connect().catch(() => {})
    }
  }, intervalMs)
  keepAliveTimer.unref?.()
}

export async function connectDB(retries = 1): Promise<boolean> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      dbCircuitOpenUntil = 0
      console.log("✅ [Neon PostgreSQL] Database connected successfully.")
      startDbKeepAlive()
      return true
    } catch (error) {
      console.warn(
        `⚠️ [Neon PostgreSQL] Connection attempt ${attempt}/${retries + 1} failed:`,
        error instanceof Error ? error.message : error
      )
      if (attempt <= retries) {
        await new Promise((r) => setTimeout(r, 1500))
      } else {
        dbCircuitOpenUntil = Date.now() + DB_CIRCUIT_COOLDOWN_MS
        console.error("❌ [Neon PostgreSQL] Database connection error:", error)
      }
    }
  }
  return false
}
