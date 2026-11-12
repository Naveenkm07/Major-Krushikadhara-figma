import "./config/env.js"
import path from "node:path"
import fs from "node:fs"
import express, { type NextFunction, type Request, type Response } from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import { warmUpPestDetector } from "./services/pestDetection.service.js"
import { warmUpMandiDirectory } from "./services/mandi.service.js"
import mandiRoutes from "./routes/mandi.routes.js"
import cropStageRoutes from "./routes/cropStage.routes.js"
import weatherRoutes from "./routes/weather.routes.js"
import aiAdvisorRoutes from "./routes/aiAdvisor.routes.js"
import scanRoutes from "./routes/scan.routes.js"
import schemesRoutes from "./routes/schemes.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import authRoutes from "./routes/auth.routes.js"
import insightsRoutes from "./routes/insights.routes.js"
import equipmentRoutes from "./routes/equipment.routes.js"
import insuranceRoutes from "./routes/insurance.routes.js"
import {
  DELETE_ACCOUNT_HTML,
  PRIVACY_POLICY_HTML,
  TERMS_OF_SERVICE_HTML,
} from "./utils/legalPages.js"

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Middlewares
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

const publicWebDir = path.resolve(__dirname, "../public-web")
const publicWebIndex = path.join(publicWebDir, "index.html")
if (fs.existsSync(publicWebDir)) {
  app.use(express.static(publicWebDir, { index: false, maxAge: "1h" }))
}

// Web App Root (browsers receive Expo Web SPA; API/health probes receive JSON status)
app.get("/", (req: Request, res: Response) => {
  if (req.accepts(["html", "json"]) === "html" && fs.existsSync(publicWebIndex)) {
    res.sendFile(publicWebIndex)
    return
  }
  res.json({
    status: "online",
    service: "KrushikaDhara Core API",
    webApp: "/",
    health: "/api/health",
    privacy: "/privacy",
    terms: "/terms",
    deleteAccount: "/delete-account",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "KrushikaDhara Core API",
    health: "/api/health",
    endpoints: [
      "/api/auth",
      "/api/profile",
      "/api/mandi",
      "/api/weather",
      "/api/scan",
      "/api/ai",
      "/api/crop-stage",
      "/api/schemes",
      "/api/insights",
      "/api/equipment",
      "/api/insurance",
    ],
    timestamp: new Date().toISOString(),
  })
})

app.get("/privacy", (_req: Request, res: Response) => {
  res.type("html").send(PRIVACY_POLICY_HTML)
})

app.get("/terms", (_req: Request, res: Response) => {
  res.type("html").send(TERMS_OF_SERVICE_HTML)
})

app.get("/delete-account", (_req: Request, res: Response) => {
  res.type("html").send(DELETE_ACCOUNT_HTML)
})

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "KrushikaDhara Core API",
    database: "Neon PostgreSQL",
    timestamp: new Date().toISOString(),
  })
})

// Feature Routes
app.use("/api/mandi", mandiRoutes)
app.use("/api/crop-stage", cropStageRoutes)
app.use("/api/weather", weatherRoutes)
app.use("/api/ai", aiAdvisorRoutes)
app.use("/api/scan", scanRoutes)
app.use("/api/schemes", schemesRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/insights", insightsRoutes)
app.use("/api/equipment", equipmentRoutes)
app.use("/api/insurance", insuranceRoutes)

// Global JSON error handler (ensures multer/upload and runtime errors return JSON instead of HTML)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || (err?.name === "MulterError" ? 400 : 500)
  console.error("❌ [Server Error Middleware]:", err?.message || err)
  res.status(status).json({
    success: false,
    error: err?.message || "Internal server error",
  })
})

// Start Server
async function startServer() {
  await connectDB()
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [KrushikaDhara Server] Running on http://0.0.0.0:${PORT}`)
    // Pre-warm TFLite interpreter & APMC directory cache asynchronously
    warmUpPestDetector()
    warmUpMandiDirectory().catch(() => {})
  })
}

startServer()

export default app

