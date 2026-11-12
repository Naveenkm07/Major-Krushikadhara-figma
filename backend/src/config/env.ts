import dotenv from "dotenv"
import path from "path"
import fs from "fs"

// Load backend/.env regardless of the current working directory (repo root vs backend/)
const candidateEnvPaths = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend/.env"),
]

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}

export {}

