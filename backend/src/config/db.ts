import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log("✅ [Neon PostgreSQL] Database connected successfully.")
  } catch (error) {
    console.error("❌ [Neon PostgreSQL] Database connection error:", error)
  }
}

